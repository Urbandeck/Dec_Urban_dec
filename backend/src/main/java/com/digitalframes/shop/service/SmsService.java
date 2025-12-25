package com.digitalframes.shop.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromNumber;

    private boolean initialized = false;

    private void initTwilio() {
        if (!initialized && !accountSid.isEmpty() && !authToken.isEmpty()) {
            Twilio.init(accountSid, authToken);
            initialized = true;
            log.info("Twilio SMS service initialized");
        }
    }

    public boolean sendSms(String toNumber, String messageText) {
        try {
            // Initialize Twilio if not already done
            initTwilio();

            if (!initialized) {
                log.warn("Twilio not configured. SMS not sent.");
                return false;
            }

            // Format the phone number (add country code if needed)
            String formattedNumber = formatPhoneNumber(toNumber);

            Message message = Message.creator(
                new PhoneNumber(formattedNumber),  // To number
                new PhoneNumber(fromNumber),         // From number (your Twilio number)
                messageText                          // Message body
            ).create();

            log.info("SMS sent successfully. Message SID: {}", message.getSid());
            return true;

        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", toNumber, e.getMessage());
            return false;
        }
    }

    public void sendOrderConfirmationSms(String customerPhone, String orderId, double amount) {
        String message = String.format(
            "Your order #%s has been confirmed! Amount: ₹%.2f. Track your order at: http://localhost:3000/track/%s",
            orderId, amount, orderId
        );
        sendSms(customerPhone, message);
    }

    public void sendShippingSms(String customerPhone, String orderId, String trackingNumber) {
        String message = String.format(
            "Good news! Your order #%s has been shipped. Tracking: %s",
            orderId, trackingNumber
        );
        sendSms(customerPhone, message);
    }

    public void sendDeliverySms(String customerPhone, String orderId) {
        String message = String.format(
            "Your order #%s has been delivered! Thank you for shopping with Digital Frames.",
            orderId
        );
        sendSms(customerPhone, message);
    }

    private String formatPhoneNumber(String phone) {
        // Remove all non-digits
        String cleaned = phone.replaceAll("[^0-9]", "");

        // If it's an Indian number without country code, add +91
        if (cleaned.length() == 10) {
            return "+91" + cleaned;
        }

        // If already has country code
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            return "+" + cleaned;
        }

        // If already properly formatted
        if (phone.startsWith("+")) {
            return phone;
        }

        // Default: add + if not present
        return "+" + cleaned;
    }
}