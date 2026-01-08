package com.digitalframes.shop.controller;

import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.service.OrderService;
import com.digitalframes.shop.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class CustomerOrderController {

    private final OrderService orderService;
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> orderData) {
        try {
            CustomerOrder order = orderService.createOrder(orderData);
            
            return ResponseEntity.ok(Map.of(
                "orderId", order.getOrderId(),
                "id", order.getId(),
                "message", "Order created successfully",
                "status", order.getStatus()
            ));
        } catch (Exception e) {
            log.error("Error creating order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create order: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<CustomerOrder>> getOrdersByEmail(@RequestParam(required = true) String email) {
        try {
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            List<CustomerOrder> orders = orderService.getOrdersByEmail(email);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error fetching orders: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<CustomerOrder>> getMyOrders(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            java.security.Principal principal) {
        try {
            // Get email from authenticated session if available
            String email = null;
            if (principal != null && principal.getName() != null) {
                email = principal.getName(); // In Spring Security, this returns the username (which is email in our case)
            } else if (userEmail != null && !userEmail.isEmpty()) {
                email = userEmail; // Fallback to header if provided
            }

            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .build();
            }

            List<CustomerOrder> orders = orderService.getOrdersByEmail(email);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error fetching user orders: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerOrder> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-order-id/{orderId}")
    public ResponseEntity<CustomerOrder> getOrderByOrderId(@PathVariable String orderId) {
        return orderService.getOrderByOrderId(orderId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{orderId}/payment")
    public ResponseEntity<?> updateOrderPayment(
            @PathVariable String orderId,
            @RequestBody Map<String, String> paymentData) {
        try {
            String paymentId = paymentData.get("paymentId");
            String paymentStatus = paymentData.get("paymentStatus");
            
            CustomerOrder order = orderService.updateOrderPayment(orderId, paymentId, paymentStatus);
            
            return ResponseEntity.ok(Map.of(
                "orderId", order.getOrderId(),
                "status", order.getStatus(),
                "paymentStatus", order.getPaymentStatus(),
                "message", "Order payment updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating order payment: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update order payment: " + e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/send-invoice")
    public ResponseEntity<?> sendInvoice(
            @PathVariable String orderId,
            @RequestBody Map<String, String> emailData) {
        try {
            String recipientEmail = emailData.get("email");
            if (recipientEmail == null || recipientEmail.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email address is required"));
            }

            CustomerOrder order = orderService.getOrderByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

            emailService.sendInvoiceEmail(order, recipientEmail);

            return ResponseEntity.ok(Map.of(
                "message", "Invoice sent successfully to " + recipientEmail,
                "orderId", orderId
            ));
        } catch (Exception e) {
            log.error("Error sending invoice: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send invoice: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> processRefund(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String reason = request != null ? request.get("reason") : null;
            Map<String, Object> response = orderService.processRefund(id, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Refund processing failed for order {}: ", id, e);
            Map<String, Object> error = new java.util.HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{id}/can-refund")
    public ResponseEntity<?> checkRefundEligibility(@PathVariable Long id) {
        try {
            boolean canRefund = orderService.canRefund(id);
            return ResponseEntity.ok(Map.of(
                "canRefund", canRefund,
                "orderId", id
            ));
        } catch (Exception e) {
            log.error("Error checking refund eligibility for order {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        try {
            log.info("Received Razorpay webhook: {}", payload);
            orderService.handleWebhook(payload, signature);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            log.error("Webhook processing failed: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Webhook processing failed: " + e.getMessage());
        }
    }
}