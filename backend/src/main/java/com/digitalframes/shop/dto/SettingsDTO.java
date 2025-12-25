package com.digitalframes.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsDTO {
    // General Settings
    private String storeName;
    private String tagline;
    private String email;
    private String phone;
    private String address;
    private String currency;
    private String timezone;

    // Payment Settings
    private Boolean razorpayEnabled;
    private Boolean codEnabled;
    private Integer minOrderValue;
    private Integer maxOrderValue;
    private Integer taxRate;

    // Shipping Settings
    private Integer freeShippingThreshold;
    private Integer standardShippingCost;
    private Integer expressShippingCost;
    private Integer estimatedDeliveryDays;

    // Email Settings
    private Boolean emailNotifications;
    private Boolean orderConfirmations;
    private Boolean shipmentUpdates;
    private Boolean marketingEmails;

    // SEO Settings
    private String metaTitle;
    private String metaDescription;
    private String metaKeywords;

    // Social Media
    private String facebook;
    private String instagram;
    private String twitter;
    private String youtube;
}