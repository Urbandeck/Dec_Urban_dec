package com.digitalframes.shop.service;

import com.digitalframes.shop.dto.SettingsDTO;
import com.digitalframes.shop.entity.Settings;
import com.digitalframes.shop.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettingsService {

    private final SettingsRepository settingsRepository;

    public SettingsDTO getAllSettings() {
        List<Settings> allSettings = settingsRepository.findAll();
        Map<String, String> settingsMap = new HashMap<>();

        for (Settings setting : allSettings) {
            settingsMap.put(setting.getSettingKey(), setting.getSettingValue());
        }

        // Build DTO with defaults if settings don't exist
        return SettingsDTO.builder()
                // General Settings
                .storeName(settingsMap.getOrDefault("storeName", "urbandec"))
                .tagline(settingsMap.getOrDefault("tagline", "Your trusted source for premium digital photo frames"))
                .email(settingsMap.getOrDefault("email", "support@urbandec.com"))
                .phone(settingsMap.getOrDefault("phone", "+91 98765 43210"))
                .address(settingsMap.getOrDefault("address", "Mumbai, Maharashtra, India"))
                .currency(settingsMap.getOrDefault("currency", "INR"))
                .timezone(settingsMap.getOrDefault("timezone", "Asia/Kolkata"))

                // Payment Settings
                .razorpayEnabled(Boolean.parseBoolean(settingsMap.getOrDefault("razorpayEnabled", "true")))
                .codEnabled(Boolean.parseBoolean(settingsMap.getOrDefault("codEnabled", "true")))
                .minOrderValue(Integer.parseInt(settingsMap.getOrDefault("minOrderValue", "500")))
                .maxOrderValue(Integer.parseInt(settingsMap.getOrDefault("maxOrderValue", "100000")))
                .taxRate(Integer.parseInt(settingsMap.getOrDefault("taxRate", "18")))

                // Shipping Settings
                .freeShippingThreshold(Integer.parseInt(settingsMap.getOrDefault("freeShippingThreshold", "1000")))
                .standardShippingCost(Integer.parseInt(settingsMap.getOrDefault("standardShippingCost", "99")))
                .expressShippingCost(Integer.parseInt(settingsMap.getOrDefault("expressShippingCost", "199")))
                .estimatedDeliveryDays(Integer.parseInt(settingsMap.getOrDefault("estimatedDeliveryDays", "5")))

                // Email Settings
                .emailNotifications(Boolean.parseBoolean(settingsMap.getOrDefault("emailNotifications", "true")))
                .orderConfirmations(Boolean.parseBoolean(settingsMap.getOrDefault("orderConfirmations", "true")))
                .shipmentUpdates(Boolean.parseBoolean(settingsMap.getOrDefault("shipmentUpdates", "true")))
                .marketingEmails(Boolean.parseBoolean(settingsMap.getOrDefault("marketingEmails", "false")))

                // SEO Settings
                .metaTitle(settingsMap.getOrDefault("metaTitle", "urbandec - Premium Digital Photo Frames Online"))
                .metaDescription(settingsMap.getOrDefault("metaDescription", "Shop the best digital photo frames at urbandec. WiFi enabled, cloud storage, and premium displays."))
                .metaKeywords(settingsMap.getOrDefault("metaKeywords", "digital photo frames, wifi frames, smart frames, digital displays"))

                // Social Media
                .facebook(settingsMap.getOrDefault("facebook", "https://facebook.com/urbandec"))
                .instagram(settingsMap.getOrDefault("instagram", "https://instagram.com/urbandec"))
                .twitter(settingsMap.getOrDefault("twitter", "https://twitter.com/urbandec"))
                .youtube(settingsMap.getOrDefault("youtube", "https://youtube.com/urbandec"))
                .build();
    }

    @Transactional
    public SettingsDTO updateSettings(SettingsDTO settingsDTO) {
        // Update or create each setting
        updateOrCreateSetting("storeName", settingsDTO.getStoreName(), "general");
        updateOrCreateSetting("tagline", settingsDTO.getTagline(), "general");
        updateOrCreateSetting("email", settingsDTO.getEmail(), "general");
        updateOrCreateSetting("phone", settingsDTO.getPhone(), "general");
        updateOrCreateSetting("address", settingsDTO.getAddress(), "general");
        updateOrCreateSetting("currency", settingsDTO.getCurrency(), "general");
        updateOrCreateSetting("timezone", settingsDTO.getTimezone(), "general");

        updateOrCreateSetting("razorpayEnabled", String.valueOf(settingsDTO.getRazorpayEnabled()), "payment");
        updateOrCreateSetting("codEnabled", String.valueOf(settingsDTO.getCodEnabled()), "payment");
        updateOrCreateSetting("minOrderValue", String.valueOf(settingsDTO.getMinOrderValue()), "payment");
        updateOrCreateSetting("maxOrderValue", String.valueOf(settingsDTO.getMaxOrderValue()), "payment");
        updateOrCreateSetting("taxRate", String.valueOf(settingsDTO.getTaxRate()), "payment");

        updateOrCreateSetting("freeShippingThreshold", String.valueOf(settingsDTO.getFreeShippingThreshold()), "shipping");
        updateOrCreateSetting("standardShippingCost", String.valueOf(settingsDTO.getStandardShippingCost()), "shipping");
        updateOrCreateSetting("expressShippingCost", String.valueOf(settingsDTO.getExpressShippingCost()), "shipping");
        updateOrCreateSetting("estimatedDeliveryDays", String.valueOf(settingsDTO.getEstimatedDeliveryDays()), "shipping");

        updateOrCreateSetting("emailNotifications", String.valueOf(settingsDTO.getEmailNotifications()), "email");
        updateOrCreateSetting("orderConfirmations", String.valueOf(settingsDTO.getOrderConfirmations()), "email");
        updateOrCreateSetting("shipmentUpdates", String.valueOf(settingsDTO.getShipmentUpdates()), "email");
        updateOrCreateSetting("marketingEmails", String.valueOf(settingsDTO.getMarketingEmails()), "email");

        updateOrCreateSetting("metaTitle", settingsDTO.getMetaTitle(), "seo");
        updateOrCreateSetting("metaDescription", settingsDTO.getMetaDescription(), "seo");
        updateOrCreateSetting("metaKeywords", settingsDTO.getMetaKeywords(), "seo");

        updateOrCreateSetting("facebook", settingsDTO.getFacebook(), "social");
        updateOrCreateSetting("instagram", settingsDTO.getInstagram(), "social");
        updateOrCreateSetting("twitter", settingsDTO.getTwitter(), "social");
        updateOrCreateSetting("youtube", settingsDTO.getYoutube(), "social");

        return settingsDTO;
    }

    private void updateOrCreateSetting(String key, String value, String group) {
        Settings setting = settingsRepository.findBySettingKey(key)
                .orElse(Settings.builder()
                        .settingKey(key)
                        .settingGroup(group)
                        .build());

        setting.setSettingValue(value);
        settingsRepository.save(setting);
    }
}