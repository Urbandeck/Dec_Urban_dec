package com.digitalframes.shop.controller;

import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.model.User;
import com.digitalframes.shop.service.EmailService;
import com.digitalframes.shop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/email")
@CrossOrigin
@RequiredArgsConstructor
public class EmailController {
    
    private final EmailService emailService;
    private final OrderService orderService;
    
    @PostMapping("/test/order-confirmation/{orderId}")
    public ResponseEntity<?> testOrderConfirmationEmail(@PathVariable String orderId) {
        try {
            Optional<CustomerOrder> orderOpt = orderService.getOrderByOrderId(orderId);
            if (orderOpt.isPresent()) {
                emailService.sendOrderConfirmationEmail(orderOpt.get());
                return ResponseEntity.ok(Map.of("message", "Order confirmation email sent successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Failed to send email: " + e.getMessage()));
        }
    }
    
    @PostMapping("/test/order-shipped/{orderId}")
    public ResponseEntity<?> testOrderShippedEmail(@PathVariable String orderId, @RequestBody Map<String, String> request) {
        try {
            String trackingNumber = request.getOrDefault("trackingNumber", "TRK123456789");
            Optional<CustomerOrder> orderOpt = orderService.getOrderByOrderId(orderId);
            if (orderOpt.isPresent()) {
                emailService.sendOrderShippedEmail(orderOpt.get(), trackingNumber);
                return ResponseEntity.ok(Map.of("message", "Order shipped email sent successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Failed to send email: " + e.getMessage()));
        }
    }
    
    @PostMapping("/test/welcome")
    public ResponseEntity<?> testWelcomeEmail(@RequestBody Map<String, String> request) {
        try {
            User testUser = new User();
            testUser.setEmail(request.get("email"));
            testUser.setName(request.getOrDefault("name", "Test User"));
            
            emailService.sendWelcomeEmail(testUser);
            return ResponseEntity.ok(Map.of("message", "Welcome email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Failed to send email: " + e.getMessage()));
        }
    }
    
    @PostMapping("/test/password-reset")
    public ResponseEntity<?> testPasswordResetEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String token = request.getOrDefault("token", "test-reset-token-123");
            
            emailService.sendPasswordResetEmail(email, token);
            return ResponseEntity.ok(Map.of("message", "Password reset email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Failed to send email: " + e.getMessage()));
        }
    }
}