package com.digitalframes.shop.service;

import com.digitalframes.shop.config.RazorpayConfig;
import com.digitalframes.shop.dto.CreateOrderDto;
import com.digitalframes.shop.dto.PaymentResponseDto;
import com.digitalframes.shop.dto.PaymentVerificationDto;
import com.digitalframes.shop.entity.CustomProductRequest;
import com.digitalframes.shop.entity.Order;
import com.digitalframes.shop.entity.Payment;
import com.digitalframes.shop.repository.CustomProductRepository;
import com.digitalframes.shop.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;
    private final CustomProductRepository customProductRepository;

    @Transactional
    public PaymentResponseDto createRazorpayOrder(Order order) throws RazorpayException {
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", order.getTotal().multiply(new BigDecimal("100")).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "order_" + order.getId());
            
            JSONObject notes = new JSONObject();
            notes.put("orderId", order.getId());
            orderRequest.put("notes", notes);

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setProviderOrderId(razorpayOrder.get("id"));
            payment.setAmount(order.getTotal());
            payment.setCurrency("INR");
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setPayloadJson(razorpayOrder.toString());
            
            payment = paymentRepository.save(payment);
            
            return PaymentResponseDto.builder()
                    .paymentId(payment.getId())
                    .orderId(order.getId())
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(order.getTotal())
                    .currency("INR")
                    .status(payment.getStatus().toString())
                    .razorpayKeyId(razorpayConfig.getKeyId())
                    .createdAt(payment.getCreatedAt())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error creating Razorpay order: ", e);
            throw new RuntimeException("Failed to create payment order", e);
        }
    }

    @Transactional
    public PaymentResponseDto verifyPayment(PaymentVerificationDto verificationDto) {
        try {
            Payment payment = paymentRepository.findByProviderOrderId(verificationDto.getRazorpayOrderId())
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            boolean isSignatureValid = verifySignature(
                    verificationDto.getRazorpayOrderId(),
                    verificationDto.getRazorpayPaymentId(),
                    verificationDto.getRazorpaySignature()
            );
            
            if (isSignatureValid) {
                payment.setProviderPaymentId(verificationDto.getRazorpayPaymentId());
                payment.setSignature(verificationDto.getRazorpaySignature());
                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                payment.setUpdatedAt(LocalDateTime.now());
                
                Order order = payment.getOrder();
                order.setStatus(Order.OrderStatus.PAID);
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setUpdatedAt(LocalDateTime.now());
                throw new RuntimeException("Payment signature verification failed");
            }
            
            payment = paymentRepository.save(payment);
            
            return PaymentResponseDto.builder()
                    .paymentId(payment.getId())
                    .orderId(payment.getOrder().getId())
                    .razorpayOrderId(payment.getProviderOrderId())
                    .razorpayPaymentId(payment.getProviderPaymentId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .status(payment.getStatus().toString())
                    .createdAt(payment.getCreatedAt())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error verifying payment: ", e);
            throw new RuntimeException("Payment verification failed", e);
        }
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            return Utils.verifySignature(payload, signature, razorpayConfig.getKeySecret());
        } catch (RazorpayException e) {
            log.error("Signature verification failed: ", e);
            return false;
        }
    }

    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
    }

    @Transactional
    public void handleWebhook(Map<String, Object> payload) {
        try {
            String event = (String) payload.get("event");
            Map<String, Object> payloadEntity = (Map<String, Object>) payload.get("payload");
            Map<String, Object> paymentEntity = (Map<String, Object>) payloadEntity.get("payment");
            Map<String, Object> entity = (Map<String, Object>) paymentEntity.get("entity");

            String paymentId = (String) entity.get("id");
            String orderId = (String) entity.get("order_id");
            String status = (String) entity.get("status");

            Payment payment = paymentRepository.findByProviderOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));

            switch (event) {
                case "payment.captured":
                    payment.setStatus(Payment.PaymentStatus.SUCCESS);
                    payment.setProviderPaymentId(paymentId);
                    break;
                case "payment.failed":
                    payment.setStatus(Payment.PaymentStatus.FAILED);
                    break;
                default:
                    log.info("Unhandled webhook event: {}", event);
            }

            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

        } catch (Exception e) {
            log.error("Error handling webhook: ", e);
            throw new RuntimeException("Webhook processing failed", e);
        }
    }

    @Transactional
    public Map<String, Object> createRazorpayOrderForCustomProduct(Long customProductId, BigDecimal amount) throws RazorpayException {
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "custom_product_" + customProductId);

            JSONObject notes = new JSONObject();
            notes.put("customProductId", customProductId);
            notes.put("type", "custom_product");
            orderRequest.put("notes", notes);

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", razorpayOrder.get("id"));
            response.put("amount", amount);
            response.put("currency", "INR");
            response.put("keyId", razorpayConfig.getKeyId());
            response.put("customProductId", customProductId);

            return response;

        } catch (Exception e) {
            log.error("Error creating Razorpay order for custom product: ", e);
            throw new RuntimeException("Failed to create payment order", e);
        }
    }

    @Transactional
    public Map<String, Object> verifyCustomProductPayment(Long customProductId, String razorpayOrderId,
                                                          String razorpayPaymentId, String razorpaySignature) {
        try {
            boolean isSignatureValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

            Map<String, Object> response = new HashMap<>();

            if (isSignatureValid) {
                // Update custom product request payment status
                updateCustomProductPaymentStatus(customProductId, razorpayPaymentId, "completed");

                response.put("success", true);
                response.put("message", "Payment verified successfully");
                response.put("paymentId", razorpayPaymentId);
                response.put("customProductId", customProductId);
            } else {
                updateCustomProductPaymentStatus(customProductId, razorpayPaymentId, "failed");

                response.put("success", false);
                response.put("message", "Payment signature verification failed");
            }

            return response;

        } catch (Exception e) {
            log.error("Error verifying custom product payment: ", e);
            throw new RuntimeException("Payment verification failed", e);
        }
    }

    private void updateCustomProductPaymentStatus(Long customProductId, String paymentId, String status) {
        CustomProductRequest request = customProductRepository.findById(customProductId)
                .orElseThrow(() -> new RuntimeException("Custom product request not found"));

        request.setPaymentStatus(status);
        request.setPaymentId(paymentId);
        request.setUpdatedAt(LocalDateTime.now());

        if ("completed".equals(status)) {
            request.setStatus("confirmed");
        }

        customProductRepository.save(request);

        log.info("Updated custom product {} payment status to {} with payment ID {}",
                customProductId, status, paymentId);
    }
}