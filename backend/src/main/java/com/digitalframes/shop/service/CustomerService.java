package com.digitalframes.shop.service;

import com.digitalframes.shop.dto.CustomerDTO;
import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.model.User;
import com.digitalframes.shop.repository.CustomerOrderRepository;
import com.digitalframes.shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final UserRepository userRepository;
    private final CustomerOrderRepository orderRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public List<CustomerDTO> getAllCustomers(String search, String status) {
        List<User> users = userRepository.findAll();
        List<CustomerOrder> allOrders = orderRepository.findAll();

        // Group orders by customer email
        Map<String, List<CustomerOrder>> ordersByCustomer = allOrders.stream()
                .filter(o -> o.getCustomerEmail() != null)
                .collect(Collectors.groupingBy(CustomerOrder::getCustomerEmail));

        List<CustomerDTO> customers = new ArrayList<>();

        // Process users from User table
        for (User user : users) {
            CustomerDTO customer = buildCustomerFromUser(user, ordersByCustomer.get(user.getEmail()));
            customers.add(customer);
        }

        // Also add customers who have orders but no user account
        Set<String> userEmails = users.stream().map(User::getEmail).collect(Collectors.toSet());
        for (Map.Entry<String, List<CustomerOrder>> entry : ordersByCustomer.entrySet()) {
            if (!userEmails.contains(entry.getKey())) {
                CustomerDTO customer = buildCustomerFromOrders(entry.getKey(), entry.getValue());
                customers.add(customer);
            }
        }

        // Apply filters
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            customers = customers.stream()
                    .filter(c -> c.getName().toLowerCase().contains(searchLower) ||
                                c.getEmail().toLowerCase().contains(searchLower) ||
                                (c.getPhone() != null && c.getPhone().contains(search)))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.equals("all")) {
            customers = customers.stream()
                    .filter(c -> c.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        // Sort by total spent (descending)
        customers.sort((c1, c2) -> Double.compare(c2.getTotalSpent(), c1.getTotalSpent()));

        return customers;
    }

    private CustomerDTO buildCustomerFromUser(User user, List<CustomerOrder> orders) {
        if (orders == null) orders = new ArrayList<>();

        double totalSpent = orders.stream()
                .filter(o -> "SUCCESS".equalsIgnoreCase(o.getPaymentStatus()) ||
                           "DELIVERED".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(CustomerOrder::getTotalAmount)
                .sum();

        LocalDateTime lastOrderDate = orders.stream()
                .map(CustomerOrder::getCreatedAt)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        // Get most recent order for address details
        CustomerOrder mostRecentOrder = orders.stream()
                .max(Comparator.comparing(CustomerOrder::getCreatedAt))
                .orElse(null);

        // Determine status based on last order date
        String status = "active";
        if (lastOrderDate != null) {
            long daysSinceLastOrder = java.time.temporal.ChronoUnit.DAYS.between(
                    lastOrderDate.toLocalDate(),
                    LocalDateTime.now().toLocalDate());
            if (daysSinceLastOrder > 90) {
                status = "inactive";
            }
        }

        return CustomerDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .joinDate(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : "")
                .totalOrders(orders.size())
                .totalSpent(Math.round(totalSpent * 100) / 100.0)
                .lastOrderDate(lastOrderDate != null ? lastOrderDate.format(DATE_FORMATTER) : "")
                .status(status)
                .address(mostRecentOrder != null ? mostRecentOrder.getShippingAddress() : "")
                .city(mostRecentOrder != null ? mostRecentOrder.getCity() : "")
                .state(mostRecentOrder != null ? mostRecentOrder.getState() : "")
                .pincode(mostRecentOrder != null ? mostRecentOrder.getPincode() : "")
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private CustomerDTO buildCustomerFromOrders(String email, List<CustomerOrder> orders) {
        if (orders == null || orders.isEmpty()) return null;

        CustomerOrder firstOrder = orders.stream()
                .min(Comparator.comparing(CustomerOrder::getCreatedAt))
                .orElse(orders.get(0));

        CustomerOrder mostRecentOrder = orders.stream()
                .max(Comparator.comparing(CustomerOrder::getCreatedAt))
                .orElse(orders.get(0));

        double totalSpent = orders.stream()
                .filter(o -> "SUCCESS".equalsIgnoreCase(o.getPaymentStatus()) ||
                           "DELIVERED".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(CustomerOrder::getTotalAmount)
                .sum();

        // Determine status based on last order date
        String status = "active";
        long daysSinceLastOrder = java.time.temporal.ChronoUnit.DAYS.between(
                mostRecentOrder.getCreatedAt().toLocalDate(),
                LocalDateTime.now().toLocalDate());
        if (daysSinceLastOrder > 90) {
            status = "inactive";
        }

        return CustomerDTO.builder()
                .id(email.hashCode() + 1000000L) // Generate a pseudo ID for non-registered customers
                .name(mostRecentOrder.getCustomerName())
                .email(email)
                .phone(mostRecentOrder.getCustomerPhone())
                .joinDate(firstOrder.getCreatedAt().format(DATE_FORMATTER))
                .totalOrders(orders.size())
                .totalSpent(Math.round(totalSpent * 100) / 100.0)
                .lastOrderDate(mostRecentOrder.getCreatedAt().format(DATE_FORMATTER))
                .status(status)
                .address(mostRecentOrder.getShippingAddress())
                .city(mostRecentOrder.getCity())
                .state(mostRecentOrder.getState())
                .pincode(mostRecentOrder.getPincode())
                .createdAt(firstOrder.getCreatedAt())
                .updatedAt(mostRecentOrder.getCreatedAt())
                .build();
    }

    public CustomerDTO getCustomerById(Long id) {
        // Try to find as a user first
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            List<CustomerOrder> orders = orderRepository.findByPurchaserEmailOrCustomerEmailOrderByCreatedAtDesc(
                    user.getEmail(), user.getEmail());
            return buildCustomerFromUser(user, orders);
        }

        // If not found as user, search in orders
        List<CustomerOrder> allOrders = orderRepository.findAll();
        for (Map.Entry<String, List<CustomerOrder>> entry :
                allOrders.stream().collect(Collectors.groupingBy(CustomerOrder::getCustomerEmail)).entrySet()) {
            CustomerDTO customer = buildCustomerFromOrders(entry.getKey(), entry.getValue());
            if (customer != null && customer.getId().equals(id)) {
                return customer;
            }
        }

        throw new RuntimeException("Customer not found with id: " + id);
    }

    public CustomerDTO updateCustomer(Long id, Map<String, Object> updates) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // Update user fields
            if (updates.containsKey("name")) {
                user.setName((String) updates.get("name"));
            }
            if (updates.containsKey("phone")) {
                user.setPhone((String) updates.get("phone"));
            }
            if (updates.containsKey("active")) {
                user.setActive((Boolean) updates.get("active"));
            }

            userRepository.save(user);
            return getCustomerById(id);
        }

        throw new RuntimeException("Customer not found with id: " + id);
    }

    public Map<String, Object> getCustomerStats() {
        List<User> users = userRepository.findAll();
        List<CustomerOrder> orders = orderRepository.findAll();

        // Calculate various stats
        int totalCustomers = users.size();

        // New customers this month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newCustomersThisMonth = users.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfMonth))
                .count();

        // Active customers (ordered in last 90 days)
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);
        Set<String> activeCustomerEmails = orders.stream()
                .filter(o -> o.getCreatedAt().isAfter(ninetyDaysAgo))
                .map(CustomerOrder::getCustomerEmail)
                .collect(Collectors.toSet());

        // Calculate average lifetime value
        double totalRevenue = orders.stream()
                .filter(o -> "SUCCESS".equalsIgnoreCase(o.getPaymentStatus()))
                .mapToDouble(CustomerOrder::getTotalAmount)
                .sum();

        double avgLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", totalCustomers);
        stats.put("newCustomersThisMonth", newCustomersThisMonth);
        stats.put("activeCustomers", activeCustomerEmails.size());
        stats.put("inactiveCustomers", totalCustomers - activeCustomerEmails.size());
        stats.put("avgLifetimeValue", Math.round(avgLifetimeValue * 100) / 100.0);
        stats.put("totalRevenue", Math.round(totalRevenue * 100) / 100.0);

        return stats;
    }
}