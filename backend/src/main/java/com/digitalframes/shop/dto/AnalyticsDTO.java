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
public class AnalyticsDTO {
    private List<SalesOverTime> salesOverTime;
    private CustomerMetrics customerMetrics;
    private List<StateMetrics> topStates;
    private List<ProductPerformance> productPerformance;
    private List<TrafficSource> trafficSources;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesOverTime {
        private String date;
        private Double revenue;
        private Integer orders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerMetrics {
        private Integer newCustomers;
        private Integer returningCustomers;
        private Double avgOrderValue;
        private Double lifetimeValue;
        private Double churnRate;
        private Double retentionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StateMetrics {
        private String state;
        private Integer customers;
        private Double revenue;
        private Double growth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductPerformance {
        private String product;
        private Integer views;
        private Integer addToCart;
        private Integer purchased;
        private Double conversionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrafficSource {
        private String source;
        private Integer sessions;
        private Double conversion;
    }
}