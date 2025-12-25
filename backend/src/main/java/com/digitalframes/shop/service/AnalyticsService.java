package com.digitalframes.shop.service;

import com.digitalframes.shop.dto.AnalyticsDTO;
import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.entity.CustomerOrderItem;
import com.digitalframes.shop.entity.Product;
import com.digitalframes.shop.model.User;
import com.digitalframes.shop.repository.CustomerOrderRepository;
import com.digitalframes.shop.repository.ProductRepository;
import com.digitalframes.shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final CustomerOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AnalyticsDTO getAnalytics(int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        // Get all data within the date range
        List<CustomerOrder> orders = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(startDate))
                .collect(Collectors.toList());

        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startDate))
                .collect(Collectors.toList());

        List<Product> products = productRepository.findAll();

        // Generate sales over time data
        List<AnalyticsDTO.SalesOverTime> salesOverTime = generateSalesOverTime(orders, days);

        // Calculate customer metrics
        AnalyticsDTO.CustomerMetrics customerMetrics = calculateCustomerMetrics(orders, users, startDate);

        // Get top states by revenue
        List<AnalyticsDTO.StateMetrics> topStates = calculateStateMetrics(orders);

        // Calculate product performance
        List<AnalyticsDTO.ProductPerformance> productPerformance = calculateProductPerformance(orders, products);

        // Generate traffic sources (simulated since we don't track this yet)
        List<AnalyticsDTO.TrafficSource> trafficSources = generateTrafficSources(orders.size());

        return AnalyticsDTO.builder()
                .salesOverTime(salesOverTime)
                .customerMetrics(customerMetrics)
                .topStates(topStates)
                .productPerformance(productPerformance)
                .trafficSources(trafficSources)
                .build();
    }

    private List<AnalyticsDTO.SalesOverTime> generateSalesOverTime(List<CustomerOrder> orders, int days) {
        List<AnalyticsDTO.SalesOverTime> salesData = new ArrayList<>();

        if (days <= 7) {
            // Group by day for last 7 days
            for (int i = 6; i >= 0; i--) {
                LocalDate date = LocalDate.now().minusDays(i);
                String dateStr = date.format(DateTimeFormatter.ofPattern("EEE"));

                double revenue = orders.stream()
                        .filter(o -> o.getCreatedAt().toLocalDate().equals(date))
                        .mapToDouble(CustomerOrder::getTotalAmount)
                        .sum();

                int orderCount = (int) orders.stream()
                        .filter(o -> o.getCreatedAt().toLocalDate().equals(date))
                        .count();

                salesData.add(AnalyticsDTO.SalesOverTime.builder()
                        .date(dateStr)
                        .revenue(revenue)
                        .orders(orderCount)
                        .build());
            }
        } else if (days <= 30) {
            // Group by week for last 30 days
            for (int week = 0; week < 4; week++) {
                LocalDateTime weekStart = LocalDateTime.now().minusWeeks(3 - week);
                LocalDateTime weekEnd = weekStart.plusWeeks(1);

                double revenue = orders.stream()
                        .filter(o -> o.getCreatedAt().isAfter(weekStart) && o.getCreatedAt().isBefore(weekEnd))
                        .mapToDouble(CustomerOrder::getTotalAmount)
                        .sum();

                int orderCount = (int) orders.stream()
                        .filter(o -> o.getCreatedAt().isAfter(weekStart) && o.getCreatedAt().isBefore(weekEnd))
                        .count();

                salesData.add(AnalyticsDTO.SalesOverTime.builder()
                        .date("Week " + (week + 1))
                        .revenue(revenue)
                        .orders(orderCount)
                        .build());
            }
        } else if (days <= 90) {
            // Group by month for last 90 days
            for (int month = 0; month < 3; month++) {
                LocalDateTime monthStart = LocalDateTime.now().minusMonths(2 - month).withDayOfMonth(1);
                LocalDateTime monthEnd = monthStart.plusMonths(1);

                double revenue = orders.stream()
                        .filter(o -> o.getCreatedAt().isAfter(monthStart) && o.getCreatedAt().isBefore(monthEnd))
                        .mapToDouble(CustomerOrder::getTotalAmount)
                        .sum();

                int orderCount = (int) orders.stream()
                        .filter(o -> o.getCreatedAt().isAfter(monthStart) && o.getCreatedAt().isBefore(monthEnd))
                        .count();

                salesData.add(AnalyticsDTO.SalesOverTime.builder()
                        .date("Month " + (month + 1))
                        .revenue(revenue)
                        .orders(orderCount)
                        .build());
            }
        } else {
            // Group by quarter for last year
            for (int quarter = 0; quarter < 4; quarter++) {
                LocalDateTime quarterStart = LocalDateTime.now().minusMonths((3 - quarter) * 3);
                LocalDateTime quarterEnd = quarterStart.plusMonths(3);

                double revenue = orders.stream()
                        .filter(o -> o.getCreatedAt().isAfter(quarterStart) && o.getCreatedAt().isBefore(quarterEnd))
                        .mapToDouble(CustomerOrder::getTotalAmount)
                        .sum();

                int orderCount = (int) orders.stream()
                        .filter(o -> o.getCreatedAt().isAfter(quarterStart) && o.getCreatedAt().isBefore(quarterEnd))
                        .count();

                salesData.add(AnalyticsDTO.SalesOverTime.builder()
                        .date("Q" + (quarter + 1))
                        .revenue(revenue)
                        .orders(orderCount)
                        .build());
            }
        }

        return salesData;
    }

    private AnalyticsDTO.CustomerMetrics calculateCustomerMetrics(List<CustomerOrder> orders, List<User> users, LocalDateTime startDate) {
        // New customers (registered after start date)
        int newCustomers = users.size();

        // Returning customers (made more than 1 order)
        Map<String, Long> customerOrderCount = orders.stream()
                .filter(o -> o.getCustomerEmail() != null)
                .collect(Collectors.groupingBy(CustomerOrder::getCustomerEmail, Collectors.counting()));

        int returningCustomers = (int) customerOrderCount.values().stream()
                .filter(count -> count > 1)
                .count();

        // Average order value
        double avgOrderValue = orders.isEmpty() ? 0 :
                orders.stream().mapToDouble(CustomerOrder::getTotalAmount).average().orElse(0);

        // Calculate lifetime value (average revenue per customer)
        double totalRevenue = orders.stream().mapToDouble(CustomerOrder::getTotalAmount).sum();
        int uniqueCustomers = customerOrderCount.size();
        double lifetimeValue = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

        // Calculate churn and retention rates
        double churnRate = uniqueCustomers > 0 ? ((double) (uniqueCustomers - returningCustomers) / uniqueCustomers) * 100 : 0;
        double retentionRate = 100 - churnRate;

        return AnalyticsDTO.CustomerMetrics.builder()
                .newCustomers(newCustomers)
                .returningCustomers(returningCustomers)
                .avgOrderValue(Math.round(avgOrderValue * 100) / 100.0)
                .lifetimeValue(Math.round(lifetimeValue * 100) / 100.0)
                .churnRate(Math.round(churnRate * 10) / 10.0)
                .retentionRate(Math.round(retentionRate * 10) / 10.0)
                .build();
    }

    private List<AnalyticsDTO.StateMetrics> calculateStateMetrics(List<CustomerOrder> orders) {
        Map<String, StateData> stateDataMap = new HashMap<>();

        for (CustomerOrder order : orders) {
            String state = order.getState();
            if (state != null && !state.trim().isEmpty()) {
                stateDataMap.computeIfAbsent(state, k -> new StateData())
                        .addOrder(order.getTotalAmount(), order.getCustomerEmail());
            }
        }

        return stateDataMap.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue().revenue, e1.getValue().revenue))
                .limit(8)
                .map(entry -> AnalyticsDTO.StateMetrics.builder()
                        .state(entry.getKey())
                        .customers(entry.getValue().uniqueCustomers.size())
                        .revenue(Math.round(entry.getValue().revenue * 100) / 100.0)
                        .growth(Math.random() * 20 - 5) // Simulated growth since we don't have historical data
                        .build())
                .collect(Collectors.toList());
    }

    private List<AnalyticsDTO.ProductPerformance> calculateProductPerformance(List<CustomerOrder> orders, List<Product> products) {
        Map<Long, ProductStats> productStatsMap = new HashMap<>();

        // Calculate actual purchase data from orders
        for (CustomerOrder order : orders) {
            if (order.getItems() != null) {
                for (CustomerOrderItem item : order.getItems()) {
                    productStatsMap.computeIfAbsent(item.getProductId(), k -> new ProductStats())
                            .addPurchase(item.getQuantity());
                }
            }
        }

        // Build product performance list
        List<AnalyticsDTO.ProductPerformance> performance = new ArrayList<>();
        for (Product product : products) {
            ProductStats stats = productStatsMap.getOrDefault(product.getId(), new ProductStats());

            // Simulate view and cart data (since we don't track these yet)
            int views = stats.purchased * (10 + new Random().nextInt(20));
            int addToCart = stats.purchased * (2 + new Random().nextInt(3));
            double conversionRate = views > 0 ? (double) stats.purchased / views * 100 : 0;

            if (stats.purchased > 0) {
                performance.add(AnalyticsDTO.ProductPerformance.builder()
                        .product(product.getName())
                        .views(views)
                        .addToCart(addToCart)
                        .purchased(stats.purchased)
                        .conversionRate(Math.round(conversionRate * 100) / 100.0)
                        .build());
            }
        }

        // Sort by purchased count and limit to top 5
        return performance.stream()
                .sorted((p1, p2) -> Integer.compare(p2.getPurchased(), p1.getPurchased()))
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<AnalyticsDTO.TrafficSource> generateTrafficSources(int totalOrders) {
        // Simulated traffic sources since we don't track this yet
        List<AnalyticsDTO.TrafficSource> sources = new ArrayList<>();

        sources.add(AnalyticsDTO.TrafficSource.builder()
                .source("Direct")
                .sessions(totalOrders * 15)
                .conversion(3.2)
                .build());

        sources.add(AnalyticsDTO.TrafficSource.builder()
                .source("Google Search")
                .sessions(totalOrders * 12)
                .conversion(4.5)
                .build());

        sources.add(AnalyticsDTO.TrafficSource.builder()
                .source("Social Media")
                .sessions(totalOrders * 8)
                .conversion(2.8)
                .build());

        sources.add(AnalyticsDTO.TrafficSource.builder()
                .source("Email")
                .sessions(totalOrders * 4)
                .conversion(6.7)
                .build());

        sources.add(AnalyticsDTO.TrafficSource.builder()
                .source("Referral")
                .sessions(totalOrders * 3)
                .conversion(3.9)
                .build());

        return sources;
    }

    private static class StateData {
        double revenue = 0;
        Set<String> uniqueCustomers = new HashSet<>();

        void addOrder(double amount, String customerEmail) {
            this.revenue += amount;
            if (customerEmail != null) {
                this.uniqueCustomers.add(customerEmail);
            }
        }
    }

    private static class ProductStats {
        int purchased = 0;

        void addPurchase(int quantity) {
            this.purchased += quantity;
        }
    }
}