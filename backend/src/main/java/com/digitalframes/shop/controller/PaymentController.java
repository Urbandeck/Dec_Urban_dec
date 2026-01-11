package com.digitalframes.shop.controller;

import com.digitalframes.shop.dto.PaymentResponseDto;
import com.digitalframes.shop.dto.PaymentVerificationDto;
import com.digitalframes.shop.entity.Order;
import com.digitalframes.shop.entity.Payment;
import com.digitalframes.shop.repository.OrderRepository;
import com.digitalframes.shop.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderRepository orderRepository;

    @PostMapping("/create-order/{orderId}")
    public ResponseEntity<PaymentResponseDto> createPaymentOrder(@PathVariable Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            
            PaymentResponseDto response = paymentService.createRazorpayOrder(order);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating payment order: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentResponseDto> verifyPayment(@RequestBody PaymentVerificationDto verificationDto) {
        try {
            PaymentResponseDto response = paymentService.verifyPayment(verificationDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Payment verification failed: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrder(@PathVariable Long orderId) {
        try {
            Payment payment = paymentService.getPaymentByOrderId(orderId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            log.error("Error fetching payment: ", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload,
                                                @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        try {
            log.info("Received webhook: {}", payload);
            paymentService.handleWebhook(payload);
            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            log.error("Webhook processing failed: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook processing failed");
        }
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createCustomProductOrder(@RequestBody Map<String, Object> request) {
        try {
            // Validate required parameters
            if (request.get("amount") == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Amount is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            java.math.BigDecimal amount = new java.math.BigDecimal(request.get("amount").toString());
            String currency = request.getOrDefault("currency", "INR").toString();
            String receipt = request.getOrDefault("receipt", "receipt_" + System.currentTimeMillis()).toString();

            @SuppressWarnings("unchecked")
            Map<String, Object> notes = (Map<String, Object>) request.get("notes");

            // Create Razorpay order directly for temporary custom products
            Map<String, Object> response = paymentService.createRazorpayOrderDirect(amount, currency, receipt, notes);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating custom product payment order: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/verify-custom")
    public ResponseEntity<Map<String, Object>> verifyCustomProductPayment(@RequestBody Map<String, Object> request) {
        try {
            String razorpayOrderId = (String) request.get("razorpay_order_id");
            String razorpayPaymentId = (String) request.get("razorpay_payment_id");
            String razorpaySignature = (String) request.get("razorpay_signature");
            Long customProductId = Long.parseLong(request.get("customProductId").toString());

            Map<String, Object> response = paymentService.verifyCustomProductPayment(
                customProductId,
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Custom product payment verification failed: ", e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("success", false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/refund/{orderId}")
    public ResponseEntity<Map<String, Object>> processRefund(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, Object> request) {
        try {
            String reason = request != null ? (String) request.get("reason") : null;
            Map<String, Object> response = paymentService.processRefund(orderId, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Refund processing failed for order {}: ", orderId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/can-refund/{orderId}")
    public ResponseEntity<Map<String, Object>> checkRefundEligibility(@PathVariable Long orderId) {
        try {
            boolean canRefund = paymentService.canRefund(orderId);
            Map<String, Object> response = new HashMap<>();
            response.put("canRefund", canRefund);
            response.put("orderId", orderId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking refund eligibility for order {}: ", orderId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}