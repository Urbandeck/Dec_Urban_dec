package com.digitalframes.shop.service;

import com.digitalframes.shop.dto.DashboardStatsDTO;
import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.entity.CustomerOrderItem;
import com.digitalframes.shop.entity.Product;
import com.digitalframes.shop.model.User;
import com.digitalframes.shop.repository.CustomerOrderRepository;
import com.digitalframes.shop.repository.ProductRepository;
import com.digitalframes.shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CustomerOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public DashboardStatsDTO getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);

        // Get all orders
        List<CustomerOrder> allOrders = orderRepository.findAll();
        List<CustomerOrder> completedOrders = allOrders.stream()
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()) ||
                            "DELIVERED".equalsIgnoreCase(o.getStatus()) ||
                            "SUCCESS".equalsIgnoreCase(o.getPaymentStatus()))
                .collect(Collectors.toList());

        // Calculate current month stats
        List<CustomerOrder> currentMonthOrders = completedOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfMonth))
                .collect(Collectors.toList());

        Double totalRevenue = completedOrders.stream()
                .mapToDouble(CustomerOrder::getTotalAmount)
                .sum();

        Double currentMonthRevenue = currentMonthOrders.stream()
                .mapToDouble(CustomerOrder::getTotalAmount)
                .sum();

        // Calculate last month stats for growth
        List<CustomerOrder> lastMonthOrders = completedOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfLastMonth) &&
                            o.getCreatedAt().isBefore(endOfLastMonth))
                .collect(Collectors.toList());

        Double lastMonthRevenue = lastMonthOrders.stream()
                .mapToDouble(CustomerOrder::getTotalAmount)
                .sum();

        // Calculate growth rates
        double revenueGrowth = calculateGrowth(currentMonthRevenue, lastMonthRevenue);
        double ordersGrowth = calculateGrowth(currentMonthOrders.size(), lastMonthOrders.size());

        // Get unique customers
        Set<String> uniqueCustomers = completedOrders.stream()
                .map(CustomerOrder::getCustomerEmail)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Calculate repeat customers
        Map<String, Long> customerOrderCount = completedOrders.stream()
                .filter(o -> o.getCustomerEmail() != null)
                .collect(Collectors.groupingBy(CustomerOrder::getCustomerEmail, Collectors.counting()));

        long repeatCustomers = customerOrderCount.values().stream()
                .filter(count -> count > 1)
                .count();

        double repeatRate = uniqueCustomers.isEmpty() ? 0 :
                           (double) repeatCustomers / uniqueCustomers.size() * 100;

        // Get top selling products
        Map<Long, ProductSalesData> productSales = new HashMap<>();
        for (CustomerOrder order : completedOrders) {
            if (order.getItems() != null) {
                for (CustomerOrderItem item : order.getItems()) {
                    Long productId = item.getProductId();
                    productSales.computeIfAbsent(productId, k -> new ProductSalesData())
                            .addSale(item.getQuantity(), item.getPrice() * item.getQuantity());
                }
            }
        }

        List<DashboardStatsDTO.TopSellingProduct> topProducts = productSales.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue().revenue, e1.getValue().revenue))
                .limit(5)
                .map(entry -> {
                    Product product = productRepository.findById(entry.getKey()).orElse(null);
                    String productName = product != null ? product.getName() : "Product #" + entry.getKey();
                    return DashboardStatsDTO.TopSellingProduct.builder()
                            .name(productName)
                            .sold(entry.getValue().quantity)
                            .revenue(entry.getValue().revenue)
                            .build();
                })
                .collect(Collectors.toList());

        // Get recent orders
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        List<DashboardStatsDTO.RecentOrder> recentOrders = allOrders.stream()
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .limit(10)
                .map(order -> DashboardStatsDTO.RecentOrder.builder()
                        .id(order.getOrderId() != null ? order.getOrderId() : "ORD-" + order.getId())
                        .customer(order.getCustomerName())
                        .amount(order.getTotalAmount())
                        .status(mapOrderStatus(order))
                        .date(order.getCreatedAt().format(formatter))
                        .build())
                .collect(Collectors.toList());

        // Sales by state
        Map<String, SalesStateData> statesSales = new HashMap<>();
        for (CustomerOrder order : completedOrders) {
            String state = order.getState();
            if (state != null && !state.trim().isEmpty()) {
                statesSales.computeIfAbsent(state, k -> new SalesStateData())
                        .addSale(order.getTotalAmount());
            }
        }

        List<DashboardStatsDTO.SalesByState> salesByState = statesSales.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue().revenue, e1.getValue().revenue))
                .limit(8)
                .map(entry -> DashboardStatsDTO.SalesByState.builder()
                        .state(entry.getKey())
                        .orders(entry.getValue().orders)
                        .revenue(entry.getValue().revenue)
                        .build())
                .collect(Collectors.toList());

        // Calculate customer growth
        List<User> allUsers = userRepository.findAll();
        long currentMonthCustomers = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfMonth))
                .count();
        long lastMonthCustomers = allUsers.stream()
                .filter(u -> u.getCreatedAt() != null &&
                            u.getCreatedAt().isAfter(startOfLastMonth) &&
                            u.getCreatedAt().isBefore(endOfLastMonth))
                .count();
        double customersGrowth = calculateGrowth(currentMonthCustomers, lastMonthCustomers);

        return DashboardStatsDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders((long) completedOrders.size())
                .totalCustomers((long) uniqueCustomers.size())
                .repeatCustomerRate(Math.round(repeatRate * 10) / 10.0)
                .topSellingProducts(topProducts)
                .recentOrders(recentOrders)
                .salesByState(salesByState)
                .revenueGrowth(revenueGrowth)
                .ordersGrowth(ordersGrowth)
                .customersGrowth(customersGrowth)
                .repeatRateGrowth(2.3) // This would need historical data to calculate properly
                .build();
    }

    private double calculateGrowth(double current, double previous) {
        if (previous == 0) {
            return current > 0 ? 100 : 0;
        }
        return Math.round(((current - previous) / previous) * 100 * 10) / 10.0;
    }

    private String mapOrderStatus(CustomerOrder order) {
        if ("SUCCESS".equalsIgnoreCase(order.getPaymentStatus())) {
            if ("DELIVERED".equalsIgnoreCase(order.getStatus())) {
                return "Delivered";
            } else if ("SHIPPED".equalsIgnoreCase(order.getStatus())) {
                return "Shipped";
            } else {
                return "Processing";
            }
        } else if ("PENDING".equalsIgnoreCase(order.getPaymentStatus()) ||
                   "PENDING".equalsIgnoreCase(order.getStatus())) {
            return "Pending";
        } else {
            return order.getStatus() != null ? order.getStatus() : "Unknown";
        }
    }

    private static class ProductSalesData {
        int quantity = 0;
        double revenue = 0;

        void addSale(int qty, double amount) {
            this.quantity += qty;
            this.revenue += amount;
        }
    }

    private static class SalesStateData {
        long orders = 0;
        double revenue = 0;

        void addSale(double amount) {
            this.orders++;
            this.revenue += amount;
        }
    }
}