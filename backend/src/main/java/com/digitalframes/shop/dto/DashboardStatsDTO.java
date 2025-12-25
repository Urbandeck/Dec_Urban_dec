package com.digitalframes.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Double totalRevenue;
    private Long totalOrders;
    private Long totalCustomers;
    private Double repeatCustomerRate;
    private List<TopSellingProduct> topSellingProducts;
    private List<RecentOrder> recentOrders;
    private List<SalesByState> salesByState;
    private Double revenueGrowth;
    private Double ordersGrowth;
    private Double customersGrowth;
    private Double repeatRateGrowth;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopSellingProduct {
        private String name;
        private Integer sold;
        private Double revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOrder {
        private String id;
        private String customer;
        private Double amount;
        private String status;
        private String date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesByState {
        private String state;
        private Long orders;
        private Double revenue;
    }
}