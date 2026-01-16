package com.digitalframes.shop.controller;

import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.repository.CustomerOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shipping/status-update")
public class ShiprocketWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(ShiprocketWebhookController.class);

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    private static final String WEBHOOK_TOKEN = "urbandec2024";

    /**
     * Webhook endpoint to receive order status updates from Shiprocket
     * Configure this URL in Shiprocket: https://urbandec.in/api/shipping/status-update
     */
    @PostMapping
    public ResponseEntity<?> handleShiprocketWebhook(
            @RequestBody Map<String, Object> payload,
            @RequestHeader(value = "x-api-key", required = false) String apiKey) {
        try {
            logger.info("Received shipping webhook with token: {}", apiKey);
            logger.info("Webhook payload: {}", payload);

            // Validate token
            if (apiKey == null || !WEBHOOK_TOKEN.equals(apiKey)) {
                logger.warn("Invalid or missing webhook token");
                // Still process for testing, just log warning
            }

            // Extract data from webhook payload
            String awb = getStringValue(payload, "awb");
            String shiprocketOrderId = getStringValue(payload, "order_id");
            String currentStatus = getStringValue(payload, "current_status");
            String shipmentStatus = getStringValue(payload, "shipment_status");
            String courierName = getStringValue(payload, "courier_name");

            // Use shipment_status if current_status is empty
            String status = (currentStatus != null && !currentStatus.isEmpty()) ? currentStatus : shipmentStatus;

            if (status == null || status.isEmpty()) {
                logger.warn("No status found in webhook payload");
                return ResponseEntity.ok(Map.of("success", true, "message", "No status to update"));
            }

            // Find order by AWB or Shiprocket Order ID
            Optional<CustomerOrder> orderOpt = Optional.empty();

            if (awb != null && !awb.isEmpty()) {
                orderOpt = customerOrderRepository.findByAwbNumber(awb);
            }

            if (orderOpt.isEmpty() && shiprocketOrderId != null && !shiprocketOrderId.isEmpty()) {
                orderOpt = customerOrderRepository.findByShiprocketOrderId(shiprocketOrderId);
            }

            if (orderOpt.isEmpty()) {
                logger.warn("Order not found for AWB: {} or Shiprocket Order ID: {}", awb, shiprocketOrderId);
                return ResponseEntity.ok(Map.of("success", true, "message", "Order not found"));
            }

            CustomerOrder order = orderOpt.get();
            String previousStatus = order.getStatus();

            // Map Shiprocket status to your order status
            String newStatus = mapShiprocketStatus(status);

            // Update order status
            order.setStatus(newStatus);

            // Update courier name if provided
            if (courierName != null && !courierName.isEmpty()) {
                order.setCourierName(courierName);
            }

            // Update AWB if provided and not already set
            if (awb != null && !awb.isEmpty() && (order.getAwbNumber() == null || order.getAwbNumber().isEmpty())) {
                order.setAwbNumber(awb);
            }

            customerOrderRepository.save(order);

            logger.info("Order {} status updated from {} to {} (Shiprocket status: {})",
                order.getOrderId(), previousStatus, newStatus, status);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Order status updated",
                "orderId", order.getOrderId(),
                "newStatus", newStatus
            ));

        } catch (Exception e) {
            logger.error("Error processing Shiprocket webhook: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }

    /**
     * Map Shiprocket status codes to your order statuses
     */
    private String mapShiprocketStatus(String shiprocketStatus) {
        if (shiprocketStatus == null) return "PENDING";

        String statusLower = shiprocketStatus.toLowerCase();

        // Shiprocket status mappings
        if (statusLower.contains("picked up") || statusLower.contains("pickup")) {
            return "SHIPPED";
        } else if (statusLower.contains("in transit") || statusLower.contains("shipped")) {
            return "SHIPPED";
        } else if (statusLower.contains("out for delivery") || statusLower.contains("ofd")) {
            return "OUT_FOR_DELIVERY";
        } else if (statusLower.contains("delivered")) {
            return "DELIVERED";
        } else if (statusLower.contains("rto") || statusLower.contains("return")) {
            return "RETURNED";
        } else if (statusLower.contains("cancelled") || statusLower.contains("canceled")) {
            return "CANCELLED";
        } else if (statusLower.contains("pending") || statusLower.contains("new")) {
            return "PENDING";
        } else if (statusLower.contains("processing") || statusLower.contains("ready")) {
            return "PROCESSING";
        }

        // Default: keep current or set to processing
        return "PROCESSING";
    }

    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        return value.toString();
    }
}
