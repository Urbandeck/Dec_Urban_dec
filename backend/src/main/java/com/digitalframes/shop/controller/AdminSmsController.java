package com.digitalframes.shop.controller;

import com.digitalframes.shop.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class AdminSmsController {

    private final SmsService smsService;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    @PostMapping("/test-sms")
    public ResponseEntity<Map<String, Object>> testSms(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String phone = (String) request.get("phone");
            String type = (String) request.get("type");

            if (phone == null || phone.isEmpty()) {
                response.put("success", false);
                response.put("error", "Phone number is required");
                return ResponseEntity.badRequest().body(response);
            }

            boolean sent = false;

            if ("custom".equals(type) || type == null) {
                // Custom message
                String message = (String) request.get("message");
                if (message == null || message.isEmpty()) {
                    message = "Test SMS from Digital Frames Shop";
                }
                sent = smsService.sendSms(phone, message);
            } else {
                // Predefined messages
                String orderId = (String) request.getOrDefault("orderId", "TEST123");
                Double amount = Double.parseDouble(request.getOrDefault("amount", 1999.0).toString());
                String trackingNumber = (String) request.getOrDefault("trackingNumber", "TRACK123");

                switch (type) {
                    case "order_confirmation":
                        smsService.sendOrderConfirmationSms(phone, orderId, amount);
                        sent = true;
                        break;
                    case "shipping":
                        smsService.sendShippingSms(phone, orderId, trackingNumber);
                        sent = true;
                        break;
                    case "delivery":
                        smsService.sendDeliverySms(phone, orderId);
                        sent = true;
                        break;
                    default:
                        response.put("success", false);
                        response.put("error", "Invalid message type");
                        return ResponseEntity.badRequest().body(response);
                }
            }

            response.put("success", sent);
            if (sent) {
                response.put("message", "SMS sent successfully");
                log.info("Test SMS sent to: {}", phone);
            } else {
                response.put("error", "Failed to send SMS. Check Twilio configuration.");
                log.error("Failed to send test SMS to: {}", phone);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error sending test SMS: ", e);
            response.put("success", false);
            response.put("error", "Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/sms-status")
    public ResponseEntity<Map<String, Object>> getSmsStatus() {
        Map<String, Object> response = new HashMap<>();

        boolean configured = twilioPhoneNumber != null && !twilioPhoneNumber.isEmpty();

        response.put("configured", configured);
        response.put("status", configured ? "Ready" : "Not Configured");
        response.put("fromNumber", configured ? twilioPhoneNumber : null);

        if (!configured) {
            response.put("message", "Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables");
        }

        return ResponseEntity.ok(response);
    }
}