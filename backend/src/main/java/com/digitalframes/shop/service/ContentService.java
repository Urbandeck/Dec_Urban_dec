package com.digitalframes.shop.service;

import com.digitalframes.shop.model.*;
import com.digitalframes.shop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.*;

@Service
public class ContentService {

    @Autowired(required = false)
    private ContentPageRepository contentPageRepository;

    @Autowired(required = false)
    private CompanyInfoRepository companyInfoRepository;

    @Autowired(required = false)
    private FAQRepository faqRepository;

    @Autowired(required = false)
    private ShippingInfoRepository shippingInfoRepository;

    @PostConstruct
    public void initializeDefaultContent() {
        // Initialize default company info if not exists
        if (companyInfoRepository != null && companyInfoRepository.count() == 0) {
            CompanyInfo info = new CompanyInfo();
            info.setCompanyName("urbandec");
            info.setTagline("Your trusted source for premium digital photo frames");
            info.setEmail("support@digitalframes.shop");
            info.setSupportEmail("support@digitalframes.shop");
            info.setSalesEmail("sales@digitalframes.shop");
            info.setPrivacyEmail("privacy@digitalframes.shop");
            info.setPhone("+91 98765 43210");
            info.setAddress("123 Tech Park, Sector 5");
            info.setCity("Bangalore");
            info.setState("Karnataka");
            info.setCountry("India");
            info.setPincode("560001");
            info.setMissionStatement("Our mission is to bring your cherished memories to life through cutting-edge digital display technology.");
            info.setAboutUs("Welcome to urbandec, your premier destination for high-quality digital photo frames.");

            Map<String, Object> businessHours = new HashMap<>();
            businessHours.put("monday", "9:00 AM - 6:00 PM IST");
            businessHours.put("tuesday", "9:00 AM - 6:00 PM IST");
            businessHours.put("wednesday", "9:00 AM - 6:00 PM IST");
            businessHours.put("thursday", "9:00 AM - 6:00 PM IST");
            businessHours.put("friday", "9:00 AM - 6:00 PM IST");
            businessHours.put("saturday", "10:00 AM - 4:00 PM IST");
            businessHours.put("sunday", "Closed");
            info.setBusinessHours(businessHours);

            Map<String, Object> socialLinks = new HashMap<>();
            socialLinks.put("facebook", "https://facebook.com/digitalframes");
            socialLinks.put("twitter", "https://twitter.com/digitalframes");
            socialLinks.put("instagram", "https://instagram.com/digitalframes");
            info.setSocialLinks(socialLinks);

            companyInfoRepository.save(info);
        }

        // Initialize default FAQs if not exists
        if (faqRepository != null && faqRepository.count() == 0) {
            List<FAQ> faqs = Arrays.asList(
                createFAQ("General", "How do digital photo frames work?",
                    "Digital photo frames display your photos electronically on an LCD screen. You can upload photos via WiFi, USB, or memory card.", 1),
                createFAQ("General", "What file formats are supported?",
                    "Our frames support JPEG, PNG, GIF, and MP4 video formats up to 4K resolution.", 2),
                createFAQ("Shipping", "How long does shipping take?",
                    "Standard shipping takes 3-5 business days for metro cities and 5-7 days for other areas.", 3),
                createFAQ("Warranty", "What is the warranty period?",
                    "All our digital frames come with a 2-year manufacturer warranty covering defects and malfunctions.", 4),
                createFAQ("Returns", "Can I return my purchase?",
                    "Yes, we offer a 30-day return policy for all products in original condition.", 5)
            );
            faqRepository.saveAll(faqs);
        }

        // Initialize default shipping info if not exists
        if (shippingInfoRepository != null && shippingInfoRepository.count() == 0) {
            List<ShippingInfo> shippingInfos = Arrays.asList(
                createShippingInfo("Metro Cities", "2-3 business days", "Next day express",
                    new BigDecimal("999"), new BigDecimal("99"), new BigDecimal("199")),
                createShippingInfo("Tier 1 Cities", "3-5 business days", "2-3 days express",
                    new BigDecimal("1499"), new BigDecimal("149"), new BigDecimal("249")),
                createShippingInfo("Tier 2 & 3 Cities", "5-7 business days", "3-4 days express",
                    new BigDecimal("1999"), new BigDecimal("199"), new BigDecimal("299")),
                createShippingInfo("Remote Areas", "7-10 business days", "5-7 days express",
                    new BigDecimal("2499"), new BigDecimal("299"), new BigDecimal("399"))
            );
            shippingInfoRepository.saveAll(shippingInfos);
        }
    }

    private FAQ createFAQ(String category, String question, String answer, Integer order) {
        FAQ faq = new FAQ();
        faq.setCategory(category);
        faq.setQuestion(question);
        faq.setAnswer(answer);
        faq.setDisplayOrder(order);
        faq.setActive(true);
        return faq;
    }

    private ShippingInfo createShippingInfo(String zone, String deliveryTime, String expressDelivery,
                                           BigDecimal threshold, BigDecimal standard, BigDecimal express) {
        ShippingInfo info = new ShippingInfo();
        info.setZone(zone);
        info.setDeliveryTime(deliveryTime);
        info.setExpressDelivery(expressDelivery);
        info.setFreeShippingThreshold(threshold);
        info.setStandardRate(standard);
        info.setExpressRate(express);
        info.setActive(true);
        return info;
    }

    public ContentPage getPageBySlug(String slug) {
        if (contentPageRepository == null) {
            return createDefaultPage(slug);
        }
        return contentPageRepository.findBySlug(slug)
            .orElse(createDefaultPage(slug));
    }

    public CompanyInfo getCompanyInfo() {
        if (companyInfoRepository == null) {
            return new CompanyInfo();
        }
        return companyInfoRepository.findAll().stream().findFirst()
            .orElse(new CompanyInfo());
    }

    public List<FAQ> getFAQs(String category) {
        if (faqRepository == null) {
            return new ArrayList<>();
        }
        if (category != null) {
            return faqRepository.findByCategoryAndActiveOrderByDisplayOrder(category, true);
        }
        return faqRepository.findByActiveOrderByDisplayOrder(true);
    }

    public List<ShippingInfo> getShippingInfo() {
        if (shippingInfoRepository == null) {
            return new ArrayList<>();
        }
        return shippingInfoRepository.findByActive(true);
    }

    private ContentPage createDefaultPage(String slug) {
        ContentPage page = new ContentPage();
        page.setSlug(slug);
        page.setTitle(slug.replace("-", " ").toUpperCase());
        page.setContent("Default content for " + slug);
        page.setActive(true);
        return page;
    }
}