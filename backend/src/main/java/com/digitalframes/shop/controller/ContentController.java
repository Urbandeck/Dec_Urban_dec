package com.digitalframes.shop.controller;

import com.digitalframes.shop.model.*;
import com.digitalframes.shop.repository.*;
import com.digitalframes.shop.service.ContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ContentController {

    @Autowired
    private ContentService contentService;

    @GetMapping("/page/{slug}")
    public ResponseEntity<?> getPageContent(@PathVariable String slug) {
        return ResponseEntity.ok(contentService.getPageBySlug(slug));
    }

    @GetMapping("/company-info")
    public ResponseEntity<?> getCompanyInfo() {
        return ResponseEntity.ok(contentService.getCompanyInfo());
    }

    @GetMapping("/faqs")
    public ResponseEntity<?> getFAQs(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(contentService.getFAQs(category));
    }

    @GetMapping("/shipping-info")
    public ResponseEntity<?> getShippingInfo() {
        return ResponseEntity.ok(contentService.getShippingInfo());
    }

    @GetMapping("/warranty-info")
    public ResponseEntity<?> getWarrantyInfo() {
        Map<String, Object> warrantyInfo = new HashMap<>();

        warrantyInfo.put("standard", Map.of(
            "period", "2 years",
            "coverage", List.of(
                "Manufacturing defects",
                "Display issues",
                "Software malfunction",
                "Power adapter issues",
                "Frame damage during shipping"
            ),
            "notCovered", List.of(
                "Physical damage from misuse",
                "Water damage",
                "Unauthorized modifications",
                "Normal wear and tear",
                "Accessories not included"
            )
        ));

        warrantyInfo.put("extended", List.of(
            Map.of(
                "name", "1 Year Extension",
                "originalPrice", 2999,
                "salePrice", 1999,
                "features", List.of(
                    "Extends warranty to 3 years total",
                    "Priority customer support",
                    "Free annual maintenance check"
                )
            ),
            Map.of(
                "name", "2 Year Extension",
                "originalPrice", 4999,
                "salePrice", 3499,
                "popular", true,
                "features", List.of(
                    "Extends warranty to 4 years total",
                    "Priority customer support",
                    "Free bi-annual maintenance",
                    "Accidental damage coverage"
                )
            ),
            Map.of(
                "name", "3 Year Extension",
                "originalPrice", 6999,
                "salePrice", 4999,
                "features", List.of(
                    "Extends warranty to 5 years total",
                    "VIP customer support",
                    "Quarterly maintenance checks",
                    "Full accidental damage coverage",
                    "Free replacement option"
                )
            )
        ));

        warrantyInfo.put("claimProcess", List.of(
            Map.of("step", 1, "title", "Contact Support", "description", "Reach out via phone or email with your order details"),
            Map.of("step", 2, "title", "Describe Issue", "description", "Provide details about the problem you're experiencing"),
            Map.of("step", 3, "title", "Get Approval", "description", "Receive warranty claim approval and shipping instructions"),
            Map.of("step", 4, "title", "Ship Product", "description", "Send the product to our service center for repair/replacement")
        ));

        return ResponseEntity.ok(warrantyInfo);
    }

    @GetMapping("/return-policy")
    public ResponseEntity<?> getReturnPolicy() {
        Map<String, Object> returnPolicy = new HashMap<>();

        returnPolicy.put("window", "30 days");
        returnPolicy.put("condition", "Product must be in original condition with all accessories");
        returnPolicy.put("shipping", "Free return shipping on defective items");

        returnPolicy.put("eligible", List.of(
            "Defective or damaged products",
            "Wrong item delivered",
            "Product not matching description",
            "Missing accessories",
            "Within 30-day return window"
        ));

        returnPolicy.put("notEligible", List.of(
            "Products damaged due to misuse",
            "Items without original packaging",
            "Products used beyond trial period",
            "Customized or personalized items",
            "Products marked as final sale"
        ));

        returnPolicy.put("process", List.of(
            Map.of("step", 1, "title", "Initiate Return", "description", "Contact us within 30 days of delivery"),
            Map.of("step", 2, "title", "Get RMA Number", "description", "Receive Return Merchandise Authorization"),
            Map.of("step", 3, "title", "Pack Securely", "description", "Use original packaging if available"),
            Map.of("step", 4, "title", "Ship Back", "description", "Drop off at nearest courier center"),
            Map.of("step", 5, "title", "Receive Refund", "description", "Refund processed within 7-10 business days")
        ));

        returnPolicy.put("refundTimeline", Map.of(
            "inspection", "2-3 business days",
            "processing", "3-5 business days",
            "credit", "2-7 business days depending on payment method"
        ));

        return ResponseEntity.ok(returnPolicy);
    }

    @GetMapping("/help-topics")
    public ResponseEntity<?> getHelpTopics() {
        Map<String, List<Map<String, String>>> helpTopics = new HashMap<>();

        helpTopics.put("Getting Started", List.of(
            Map.of("title", "Setting up your digital frame", "link", "/help/setup"),
            Map.of("title", "Connecting to WiFi", "link", "/help/wifi"),
            Map.of("title", "Uploading photos", "link", "/help/upload"),
            Map.of("title", "Using the mobile app", "link", "/help/app")
        ));

        helpTopics.put("Orders & Shipping", List.of(
            Map.of("title", "Track your order", "link", "/help/tracking"),
            Map.of("title", "Shipping options", "link", "/help/shipping"),
            Map.of("title", "International shipping", "link", "/help/international"),
            Map.of("title", "Order cancellation", "link", "/help/cancel")
        ));

        helpTopics.put("Account & Billing", List.of(
            Map.of("title", "Creating an account", "link", "/help/account"),
            Map.of("title", "Payment methods", "link", "/help/payment"),
            Map.of("title", "Billing issues", "link", "/help/billing"),
            Map.of("title", "Updating profile", "link", "/help/profile")
        ));

        helpTopics.put("Product Support", List.of(
            Map.of("title", "Troubleshooting guide", "link", "/help/troubleshoot"),
            Map.of("title", "Firmware updates", "link", "/help/firmware"),
            Map.of("title", "Technical specifications", "link", "/help/specs"),
            Map.of("title", "Maintenance tips", "link", "/help/maintenance")
        ));

        helpTopics.put("Returns & Refunds", List.of(
            Map.of("title", "Return policy", "link", "/help/returns"),
            Map.of("title", "How to return", "link", "/help/return-process"),
            Map.of("title", "Refund timeline", "link", "/help/refunds"),
            Map.of("title", "Exchange process", "link", "/help/exchange")
        ));

        helpTopics.put("Privacy & Security", List.of(
            Map.of("title", "Privacy policy", "link", "/privacy"),
            Map.of("title", "Data security", "link", "/help/security"),
            Map.of("title", "Account security", "link", "/help/account-security"),
            Map.of("title", "Cookie policy", "link", "/help/cookies")
        ));

        return ResponseEntity.ok(helpTopics);
    }

    @GetMapping("/site-config")
    public ResponseEntity<?> getSiteConfig() {
        Map<String, Object> config = new HashMap<>();

        config.put("siteName", "Digital Frames Shop");
        config.put("companyName", "urbandec");
        config.put("tagline", "Transform Your Memories into Stunning Displays");
        config.put("description", "Your trusted source for premium digital photo frames");

        config.put("contact", Map.of(
            "email", "support@digitalframes.shop",
            "phone", "+91 98765 43210",
            "supportEmail", "support@digitalframes.shop",
            "salesEmail", "sales@digitalframes.shop",
            "privacyEmail", "privacy@digitalframes.shop"
        ));

        config.put("address", Map.of(
            "street", "123 Tech Park, Sector 5",
            "city", "Bangalore",
            "state", "Karnataka",
            "country", "India",
            "pincode", "560001"
        ));

        config.put("businessHours", Map.of(
            "monday", "9:00 AM - 6:00 PM IST",
            "tuesday", "9:00 AM - 6:00 PM IST",
            "wednesday", "9:00 AM - 6:00 PM IST",
            "thursday", "9:00 AM - 6:00 PM IST",
            "friday", "9:00 AM - 6:00 PM IST",
            "saturday", "10:00 AM - 4:00 PM IST",
            "sunday", "Closed"
        ));

        config.put("socialLinks", Map.of(
            "facebook", "https://facebook.com/digitalframes",
            "twitter", "https://twitter.com/digitalframes",
            "instagram", "https://instagram.com/digitalframes",
            "linkedin", "https://linkedin.com/company/digitalframes"
        ));

        config.put("features", List.of(
            Map.of("title", "Premium Quality", "description", "We partner with leading manufacturers to bring you the best quality digital frames"),
            Map.of("title", "Expert Support", "description", "Our dedicated support team is here to help you every step of the way"),
            Map.of("title", "Secure Shopping", "description", "Shop with confidence knowing your transactions are protected"),
            Map.of("title", "Fast Delivery", "description", "We ensure quick and safe delivery of your products")
        ));

        config.put("policies", Map.of(
            "freeShipping", "Free shipping on orders over ₹999",
            "returnWindow", "30-day easy returns",
            "warranty", "2-year manufacturer warranty",
            "support", "24/7 customer support"
        ));

        return ResponseEntity.ok(config);
    }
}