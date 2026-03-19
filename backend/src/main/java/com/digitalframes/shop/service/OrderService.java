package com.digitalframes.shop.service;

import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.entity.CustomerOrderItem;
import com.digitalframes.shop.entity.Product;
import com.digitalframes.shop.repository.CustomerOrderRepository;
import com.digitalframes.shop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ShiprocketService shiprocketService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final com.razorpay.RazorpayClient razorpayClient;
    
    @Transactional
    public CustomerOrder createOrder(Map<String, Object> orderData) {
        CustomerOrder order = new CustomerOrder();
        
        // Set customer details
        Map<String, String> customerDetails = (Map<String, String>) orderData.get("customerDetails");
        if (customerDetails != null) {
            order.setCustomerName(customerDetails.get("fullName"));
            order.setCustomerEmail(customerDetails.get("email")); // Delivery email
            order.setCustomerPhone(customerDetails.get("phone"));
            order.setShippingAddress(customerDetails.get("address"));
            order.setCity(customerDetails.get("city"));
            order.setState(customerDetails.get("state"));
            order.setPincode(customerDetails.get("pincode"));
        }
        
        // Set purchaser email (who placed the order)
        if (orderData.containsKey("purchaserEmail")) {
            order.setPurchaserEmail((String) orderData.get("purchaserEmail"));
        } else {
            // Fallback to customer email if purchaser not specified
            order.setPurchaserEmail(order.getCustomerEmail());
        }
        
        // Set order amounts
        order.setSubtotal(Double.parseDouble(orderData.getOrDefault("subtotal", "0").toString()));
        order.setTax(Double.parseDouble(orderData.getOrDefault("tax", "0").toString()));
        order.setTotalAmount(Double.parseDouble(orderData.get("totalAmount").toString()));
        
        // Check if payment info is included
        if (orderData.containsKey("paymentId")) {
            order.setPaymentId((String) orderData.get("paymentId"));
            order.setPaymentStatus((String) orderData.getOrDefault("paymentStatus", "PENDING"));
            order.setStatus((String) orderData.getOrDefault("status", "PAID"));
        } else {
            order.setStatus("PENDING");
        }
        
        order.setCreatedAt(LocalDateTime.now());
        
        // Generate order ID
        order.setOrderId("ORD" + System.currentTimeMillis());
        
        // Create order items
        List<Map<String, Object>> items = (List<Map<String, Object>>) orderData.get("items");
        List<CustomerOrderItem> orderItems = new ArrayList<>();
        
        if (items != null) {
            for (Map<String, Object> item : items) {
                CustomerOrderItem orderItem = new CustomerOrderItem();
                Long productId = Long.parseLong(item.getOrDefault("productId", "0").toString());
                orderItem.setProductId(productId);
                orderItem.setProductName(item.getOrDefault("name", "Product").toString());
                orderItem.setProductAttributes(item.getOrDefault("attributes", "").toString());
                orderItem.setQuantity(Integer.parseInt(item.get("quantity").toString()));
                orderItem.setPrice(Double.parseDouble(item.get("price").toString()));
                orderItem.setTotal(orderItem.getPrice() * orderItem.getQuantity());

                // Fetch product image from database
                try {
                    Product product = productRepository.findById(productId).orElse(null);
                    if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
                        // Get the first image's ID from product
                        Long imageId = product.getImages().get(0).getId();
                        // Construct backend API URL format
                        if (imageId != null) {
                            orderItem.setImageUrl("/api/products/images/" + imageId);
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not fetch product image for product ID: {}", productId, e);
                }

                orderItem.setOrder(order);
                orderItems.add(orderItem);
            }
        }
        
        order.setItems(orderItems);

        // Decrement stock for each ordered product
        for (CustomerOrderItem orderItem : orderItems) {
            Long productId = orderItem.getProductId();
            if (productId != null && productId > 0) {
                Optional<Product> productOpt = productRepository.findById(productId);
                if (productOpt.isPresent()) {
                    Product product = productOpt.get();
                    int currentStock = product.getStock() != null ? product.getStock() : 0;
                    int newStock = Math.max(0, currentStock - orderItem.getQuantity());
                    product.setStock(newStock);
                    productRepository.save(product);
                    log.info("Stock decremented for product {}: {} -> {}", productId, currentStock, newStock);
                }
            }
        }

        CustomerOrder savedOrder = orderRepository.save(order);
        log.info("Order created successfully with ID: {}, Status: {}", savedOrder.getOrderId(), savedOrder.getStatus());

        // Check if order should be sent to Shiprocket (prepaid OR COD orders)
        boolean isCODOrder = savedOrder.getPaymentId() != null && savedOrder.getPaymentId().startsWith("COD_");
        boolean shouldCreateShiprocketOrder = "PAID".equals(savedOrder.getStatus()) ||
                                              ("PENDING".equals(savedOrder.getStatus()) && isCODOrder);

        // Create Shiprocket order for both prepaid and COD orders
        if (shouldCreateShiprocketOrder) {
            try {
                String orderType = isCODOrder ? "COD" : "Prepaid";
                log.info("Order is {} ({}), creating Shiprocket order for: {}",
                    savedOrder.getStatus(), orderType, savedOrder.getOrderId());
                Map<String, Object> shiprocketResponse = shiprocketService.createShiprocketOrder(savedOrder);

                if (shiprocketResponse != null && shiprocketResponse.get("order_id") != null) {
                    savedOrder.setShiprocketOrderId(shiprocketResponse.get("order_id").toString());
                    if (shiprocketResponse.get("shipment_id") != null) {
                        savedOrder.setShiprocketShipmentId(shiprocketResponse.get("shipment_id").toString());
                    }
                    if (shiprocketResponse.get("awb") != null) {
                        savedOrder.setAwbNumber(shiprocketResponse.get("awb").toString());
                    }
                    savedOrder = orderRepository.save(savedOrder);
                    log.info("Shiprocket order created successfully for {} order. Shiprocket Order ID: {}",
                        orderType, shiprocketResponse.get("order_id"));
                } else {
                    log.error("Failed to create Shiprocket order - no order_id in response");
                }
            } catch (Exception e) {
                log.error("Error creating Shiprocket order for order {}: {}", savedOrder.getOrderId(), e.getMessage(), e);
                // Don't fail the order creation if Shiprocket fails
            }
        }

        // Send order confirmation email
        try {
            emailService.sendOrderConfirmationEmail(savedOrder);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order: {}", savedOrder.getOrderId(), e);
        }

        // Send order confirmation SMS
        try {
            if (savedOrder.getCustomerPhone() != null && !savedOrder.getCustomerPhone().isEmpty()) {
                smsService.sendOrderConfirmationSms(
                    savedOrder.getCustomerPhone(),
                    savedOrder.getOrderId(),
                    savedOrder.getTotalAmount()
                );
                log.info("Order confirmation SMS sent to: {}", savedOrder.getCustomerPhone());
            }
        } catch (Exception e) {
            log.error("Failed to send order confirmation SMS for order: {}", savedOrder.getOrderId(), e);
        }

        return savedOrder;
    }
    
    @Transactional
    public CustomerOrder updateOrderPayment(String orderId, String paymentId, String paymentStatus) {
        Optional<CustomerOrder> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            CustomerOrder order = orderOpt.get();
            order.setPaymentId(paymentId);
            order.setPaymentStatus(paymentStatus);
            if ("SUCCESS".equals(paymentStatus)) {
                order.setStatus("PAID");

                // Automatically create Shiprocket order when payment is successful
                try {
                    log.info("Creating Shiprocket order for order ID: {}", orderId);
                    Map<String, Object> shiprocketResponse = shiprocketService.createShiprocketOrder(order);

                    if (shiprocketResponse != null && shiprocketResponse.get("order_id") != null) {
                        order.setShiprocketOrderId(shiprocketResponse.get("order_id").toString());
                        if (shiprocketResponse.get("shipment_id") != null) {
                            order.setShiprocketShipmentId(shiprocketResponse.get("shipment_id").toString());
                        }
                        if (shiprocketResponse.get("awb") != null) {
                            order.setAwbNumber(shiprocketResponse.get("awb").toString());
                        }
                        log.info("Shiprocket order created successfully. Shiprocket Order ID: {}",
                            shiprocketResponse.get("order_id"));
                    } else {
                        log.error("Failed to create Shiprocket order - no order_id in response");
                    }
                } catch (Exception e) {
                    log.error("Error creating Shiprocket order for order {}: {}", orderId, e.getMessage(), e);
                    // Don't fail the payment update if Shiprocket fails
                    // Order can be manually synced later
                }
            }
            return orderRepository.save(order);
        }
        throw new RuntimeException("Order not found: " + orderId);
    }
    
    public List<CustomerOrder> getOrdersByEmail(String email) {
        // Find orders where the user is either the purchaser OR the recipient
        return orderRepository.findByPurchaserEmailOrCustomerEmailOrderByCreatedAtDesc(email, email);
    }
    
    public List<CustomerOrder> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public Optional<CustomerOrder> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    public Optional<CustomerOrder> getOrderByOrderId(String orderId) {
        return orderRepository.findByOrderId(orderId);
    }

    @Transactional
    public CustomerOrder updateOrderStatus(String orderId, String newStatus) {
        Optional<CustomerOrder> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            CustomerOrder order = orderOpt.get();
            String oldStatus = order.getStatus();
            order.setStatus(newStatus.toUpperCase());

            // Record delivery timestamp
            if ("DELIVERED".equalsIgnoreCase(newStatus)) {
                order.setDeliveredAt(LocalDateTime.now());
            }

            CustomerOrder savedOrder = orderRepository.save(order);

            // Send SMS notification for status updates
            try {
                if (savedOrder.getCustomerPhone() != null && !savedOrder.getCustomerPhone().isEmpty()) {
                    String upperStatus = newStatus.toUpperCase();

                    // Send different SMS based on status
                    if ("SHIPPED".equals(upperStatus)) {
                        // Generate a tracking number if not present
                        String trackingNumber = savedOrder.getAwbNumber() != null ?
                            savedOrder.getAwbNumber() : "TRACK" + System.currentTimeMillis();
                        smsService.sendShippingSms(
                            savedOrder.getCustomerPhone(),
                            savedOrder.getOrderId(),
                            trackingNumber
                        );
                        log.info("Shipping SMS sent for order: {}", orderId);
                    } else if ("DELIVERED".equals(upperStatus)) {
                        smsService.sendDeliverySms(
                            savedOrder.getCustomerPhone(),
                            savedOrder.getOrderId()
                        );
                        log.info("Delivery SMS sent for order: {}", orderId);
                    } else if ("CANCELLED".equals(upperStatus)) {
                        String message = String.format(
                            "Your order #%s has been cancelled. If you have any questions, please contact support.",
                            savedOrder.getOrderId()
                        );
                        smsService.sendSms(savedOrder.getCustomerPhone(), message);
                        log.info("Cancellation SMS sent for order: {}", orderId);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to send status update SMS for order {}: {}", orderId, e.getMessage());
            }

            return savedOrder;
        }
        throw new RuntimeException("Order not found: " + orderId);
    }

    @Transactional
    public CustomerOrder saveOrder(CustomerOrder order) {
        return orderRepository.save(order);
    }

    @Transactional
    public Map<String, Object> cancelOrder(String orderId, String reason) {
        try {
            // Try to find order by string orderId first, then by numeric id
            Optional<CustomerOrder> orderOpt = orderRepository.findByOrderId(orderId);
            if (!orderOpt.isPresent()) {
                // Try to parse as numeric ID
                try {
                    Long numericId = Long.parseLong(orderId);
                    orderOpt = orderRepository.findById(numericId);
                } catch (NumberFormatException e) {
                    // Not a numeric ID, ignore
                }
            }
            if (!orderOpt.isPresent()) {
                throw new RuntimeException("Order not found: " + orderId);
            }

            CustomerOrder order = orderOpt.get();
            String currentStatus = order.getStatus();

            // Check if order can be cancelled
            if ("CANCELLED".equals(currentStatus)) {
                throw new RuntimeException("Order is already cancelled");
            }
            if ("DELIVERED".equals(currentStatus)) {
                throw new RuntimeException("Cannot cancel a delivered order");
            }

            // Cancel Shiprocket shipment if AWB exists
            boolean shiprocketCancelled = false;
            String shiprocketMessage = null;
            if (order.getAwbNumber() != null && !order.getAwbNumber().isEmpty()) {
                try {
                    log.info("Cancelling Shiprocket shipment for AWB: {}", order.getAwbNumber());
                    Map<String, Object> shiprocketResponse = shiprocketService.cancelShipment(order.getAwbNumber());
                    if (shiprocketResponse != null && !Boolean.FALSE.equals(shiprocketResponse.get("success"))) {
                        shiprocketCancelled = true;
                        log.info("Shiprocket shipment cancelled successfully for order: {}", orderId);
                    } else {
                        shiprocketMessage = "Shiprocket cancellation may have failed: " + shiprocketResponse;
                        log.warn(shiprocketMessage);
                    }
                } catch (Exception e) {
                    shiprocketMessage = "Failed to cancel Shiprocket shipment: " + e.getMessage();
                    log.error(shiprocketMessage, e);
                    // Continue with order cancellation even if Shiprocket fails
                }
            } else if (order.getShiprocketOrderId() != null && !order.getShiprocketOrderId().isEmpty()) {
                // Cancel by Shiprocket order ID when AWB is not yet assigned
                try {
                    log.info("No AWB found, cancelling by Shiprocket Order ID: {}", order.getShiprocketOrderId());
                    Map<String, Object> shiprocketResponse = shiprocketService.cancelOrderById(order.getShiprocketOrderId());
                    if (shiprocketResponse != null && !Boolean.FALSE.equals(shiprocketResponse.get("success"))) {
                        shiprocketCancelled = true;
                        shiprocketMessage = "Order cancelled in Shiprocket using Order ID";
                        log.info("Shiprocket order cancelled successfully using Order ID for order: {}", orderId);
                    } else {
                        shiprocketMessage = "Shiprocket cancellation may have failed: " + shiprocketResponse;
                        log.warn(shiprocketMessage);
                    }
                } catch (Exception e) {
                    shiprocketMessage = "Failed to cancel in Shiprocket: " + e.getMessage();
                    log.error(shiprocketMessage, e);
                    // Continue with order cancellation even if Shiprocket fails
                }
            }

            // Restore stock for each item in the cancelled order
            if (order.getItems() != null) {
                for (CustomerOrderItem item : order.getItems()) {
                    Long productId = item.getProductId();
                    if (productId != null && productId > 0) {
                        Optional<Product> productOpt = productRepository.findById(productId);
                        if (productOpt.isPresent()) {
                            Product product = productOpt.get();
                            int currentStock = product.getStock() != null ? product.getStock() : 0;
                            int restoredStock = currentStock + item.getQuantity();
                            product.setStock(restoredStock);
                            productRepository.save(product);
                            log.info("Stock restored for product {}: {} -> {}", productId, currentStock, restoredStock);
                        }
                    }
                }
            }

            // Update order status
            order.setStatus("CANCELLED");
            if (reason != null && !reason.isEmpty()) {
                order.setFailureReason(reason);
            } else {
                order.setFailureReason("Cancelled by customer");
            }
            order = orderRepository.save(order);

            // Send cancellation notification
            try {
                if (order.getCustomerPhone() != null && !order.getCustomerPhone().isEmpty()) {
                    String message = String.format(
                        "Your order #%s has been cancelled. If you have any questions, please contact support.",
                        order.getOrderId()
                    );
                    smsService.sendSms(order.getCustomerPhone(), message);
                    log.info("Cancellation SMS sent for order: {}", orderId);
                }
            } catch (Exception e) {
                log.error("Failed to send cancellation SMS for order {}: {}", orderId, e.getMessage());
            }

            // Prepare response
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("message", "Order cancelled successfully");
            response.put("orderId", orderId);
            response.put("status", "CANCELLED");
            response.put("shiprocketCancelled", shiprocketCancelled);
            if (shiprocketMessage != null) {
                response.put("shiprocketMessage", shiprocketMessage);
            }

            // Check if refund is needed for prepaid orders
            boolean isCOD = order.getPaymentId() != null && order.getPaymentId().startsWith("COD_");
            if (!isCOD && "SUCCESS".equals(order.getPaymentStatus())) {
                response.put("refundEligible", true);
                response.put("refundMessage", "This is a prepaid order. Refund can be processed separately.");
            }

            log.info("Order {} cancelled successfully", orderId);
            return response;

        } catch (Exception e) {
            log.error("Error cancelling order {}: ", orderId, e);
            throw new RuntimeException("Failed to cancel order: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Map<String, Object> processRefund(Long orderId, String reason) {
        try {
            // Get the customer order
            CustomerOrder order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            // Check if payment exists and is successful
            if (order.getPaymentId() == null || order.getPaymentId().isEmpty()) {
                throw new RuntimeException("No payment found for this order");
            }

            if (!"SUCCESS".equals(order.getPaymentStatus())) {
                throw new RuntimeException("Cannot refund - payment status is: " + order.getPaymentStatus());
            }

            if ("REFUNDED".equals(order.getPaymentStatus())) {
                throw new RuntimeException("Payment has already been refunded");
            }

            // First, check payment status and capture if needed
            com.razorpay.Payment razorpayPayment = razorpayClient.payments.fetch(order.getPaymentId());
            String paymentStatus = razorpayPayment.get("status");

            log.info("Payment {} status: {}", order.getPaymentId(), paymentStatus);

            // If payment is authorized but not captured, capture it first
            if ("authorized".equals(paymentStatus)) {
                log.info("Payment is authorized but not captured. Capturing payment first...");
                org.json.JSONObject captureRequest = new org.json.JSONObject();
                captureRequest.put("amount", (int)(order.getTotalAmount() * 100)); // Amount in paise
                razorpayPayment = razorpayClient.payments.capture(order.getPaymentId(), captureRequest);
                log.info("Payment captured successfully");
            } else if (!"captured".equals(paymentStatus)) {
                throw new RuntimeException("Payment status is '" + paymentStatus + "'. Can only refund captured payments.");
            }

            // Create refund request
            org.json.JSONObject refundRequest = new org.json.JSONObject();
            refundRequest.put("amount", (int)(order.getTotalAmount() * 100)); // Convert to paise
            if (reason != null && !reason.isEmpty()) {
                org.json.JSONObject notes = new org.json.JSONObject();
                notes.put("reason", reason);
                refundRequest.put("notes", notes);
            }

            // Call Razorpay refund API
            com.razorpay.Refund refund = razorpayClient.payments.refund(order.getPaymentId(), refundRequest);

            // Update order payment status
            order.setPaymentStatus("REFUNDED");
            orderRepository.save(order);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("success", true);
            response.put("message", "Refund processed successfully");
            response.put("refundId", refund.get("id"));
            response.put("amount", order.getTotalAmount());
            response.put("status", refund.get("status"));
            response.put("orderId", orderId);

            log.info("Refund processed successfully for order {} with refund ID {}", orderId, refund.get("id"));

            return response;

        } catch (com.razorpay.RazorpayException e) {
            log.error("Error processing refund for order {}: ", orderId, e);
            throw new RuntimeException("Failed to process refund: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error processing refund for order {}: ", orderId, e);
            throw new RuntimeException("Failed to process refund: " + e.getMessage(), e);
        }
    }

    public boolean canRefund(Long orderId) {
        try {
            CustomerOrder order = orderRepository.findById(orderId).orElse(null);

            if (order == null) {
                return false;
            }

            // Can only refund if payment exists, is successful and not already refunded
            return order.getPaymentId() != null &&
                   "SUCCESS".equals(order.getPaymentStatus()) &&
                   !"REFUNDED".equals(order.getPaymentStatus());
        } catch (Exception e) {
            log.error("Error checking refund eligibility for order {}: ", orderId, e);
            return false;
        }
    }

    @Transactional
    public void handleWebhook(Map<String, Object> payload, String signature) {
        try {
            String event = (String) payload.get("event");
            log.info("Processing webhook event: {}", event);

            // Handle payment events
            if (event.startsWith("payment.")) {
                handlePaymentWebhook(event, payload);
            }
            // Handle refund events
            else if (event.startsWith("refund.")) {
                handleRefundWebhook(event, payload);
            }
            else {
                log.info("Unhandled webhook event type: {}", event);
            }

        } catch (Exception e) {
            log.error("Error handling webhook: ", e);
            throw new RuntimeException("Webhook processing failed", e);
        }
    }

    private void handlePaymentWebhook(String event, Map<String, Object> payload) {
        try {
            Map<String, Object> payloadEntity = (Map<String, Object>) payload.get("payload");
            Map<String, Object> paymentEntity = (Map<String, Object>) payloadEntity.get("payment");
            Map<String, Object> entity = (Map<String, Object>) paymentEntity.get("entity");

            String paymentId = (String) entity.get("id");
            String status = (String) entity.get("status");

            log.info("Payment webhook - ID: {}, Status: {}, Event: {}", paymentId, status, event);

            // Find order by payment ID
            List<CustomerOrder> orders = orderRepository.findAll();
            CustomerOrder order = orders.stream()
                .filter(o -> paymentId.equals(o.getPaymentId()))
                .findFirst()
                .orElse(null);

            if (order == null) {
                log.warn("No order found for payment ID: {}", paymentId);
                return;
            }

            switch (event) {
                case "payment.captured":
                    order.setPaymentStatus("SUCCESS");
                    order.setStatus("PAID");
                    log.info("Payment captured for order: {}", order.getOrderId());
                    break;
                case "payment.failed":
                    order.setPaymentStatus("FAILED");
                    order.setStatus("FAILED");
                    log.info("Payment failed for order: {}", order.getOrderId());
                    break;
                case "payment.authorized":
                    order.setPaymentStatus("AUTHORIZED");
                    log.info("Payment authorized for order: {}", order.getOrderId());
                    break;
                default:
                    log.info("Unhandled payment event: {}", event);
                    return;
            }

            orderRepository.save(order);

        } catch (Exception e) {
            log.error("Error handling payment webhook: ", e);
        }
    }

    /**
     * Sync order statuses from Shiprocket tracking data.
     * Maps Shiprocket statuses to internal order statuses.
     */
    @Transactional
    public Map<String, Object> syncShiprocketStatuses() {
        int synced = 0;
        int failed = 0;
        int skipped = 0;

        // Only sync orders that are in active states (not DELIVERED, CANCELLED, FAILED)
        List<CustomerOrder> activeOrders = orderRepository.findAll().stream()
            .filter(o -> o.getAwbNumber() != null && !o.getAwbNumber().isEmpty())
            .filter(o -> {
                String status = o.getStatus();
                return !"DELIVERED".equals(status) && !"CANCELLED".equals(status) && !"FAILED".equals(status);
            })
            .toList();

        log.info("Syncing Shiprocket statuses for {} active orders", activeOrders.size());

        for (CustomerOrder order : activeOrders) {
            try {
                Map<String, Object> trackingData = shiprocketService.trackShipment(order.getAwbNumber());
                if (trackingData == null || Boolean.FALSE.equals(trackingData.get("success"))) {
                    skipped++;
                    continue;
                }

                // Extract current status from Shiprocket tracking response
                String shiprocketStatus = extractShiprocketStatus(trackingData);
                if (shiprocketStatus == null) {
                    skipped++;
                    continue;
                }

                // Save the raw Shiprocket status
                order.setShiprocketStatus(shiprocketStatus);

                // Map Shiprocket status to internal status
                String mappedStatus = mapShiprocketToInternalStatus(shiprocketStatus);
                if (mappedStatus != null && !mappedStatus.equals(order.getStatus())) {
                    String oldStatus = order.getStatus();
                    order.setStatus(mappedStatus);

                    // Set deliveredAt timestamp
                    if ("DELIVERED".equals(mappedStatus)) {
                        order.setDeliveredAt(LocalDateTime.now());
                    }

                    orderRepository.save(order);
                    log.info("Order {} status synced: {} -> {} (Shiprocket: {})",
                        order.getOrderId(), oldStatus, mappedStatus, shiprocketStatus);

                    // Send SMS notifications
                    try {
                        if (order.getCustomerPhone() != null && !order.getCustomerPhone().isEmpty()) {
                            if ("SHIPPED".equals(mappedStatus)) {
                                smsService.sendShippingSms(order.getCustomerPhone(), order.getOrderId(),
                                    order.getAwbNumber() != null ? order.getAwbNumber() : "");
                            } else if ("DELIVERED".equals(mappedStatus)) {
                                smsService.sendDeliverySms(order.getCustomerPhone(), order.getOrderId());
                            }
                        }
                    } catch (Exception e) {
                        log.error("Failed to send SMS for order {} during sync: {}", order.getOrderId(), e.getMessage());
                    }

                    synced++;
                } else {
                    skipped++;
                }
            } catch (Exception e) {
                log.error("Failed to sync order {}: {}", order.getOrderId(), e.getMessage());
                failed++;
            }
        }

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("synced", synced);
        result.put("failed", failed);
        result.put("skipped", skipped);
        result.put("total", activeOrders.size());
        log.info("Shiprocket sync complete: synced={}, failed={}, skipped={}", synced, failed, skipped);
        return result;
    }

    private String extractShiprocketStatus(Map<String, Object> trackingData) {
        try {
            // Shiprocket tracking response structure varies
            // Try common paths for current status
            if (trackingData.containsKey("tracking_data")) {
                Map<String, Object> td = (Map<String, Object>) trackingData.get("tracking_data");
                if (td.containsKey("track_status")) {
                    return String.valueOf(((Number) td.get("track_status")).intValue());
                }
                if (td.containsKey("shipment_track")) {
                    List<Map<String, Object>> tracks = (List<Map<String, Object>>) td.get("shipment_track");
                    if (tracks != null && !tracks.isEmpty()) {
                        Map<String, Object> latest = tracks.get(0);
                        if (latest.containsKey("current_status")) {
                            return (String) latest.get("current_status");
                        }
                    }
                }
            }
            if (trackingData.containsKey("current_status")) {
                return (String) trackingData.get("current_status");
            }
        } catch (Exception e) {
            log.error("Failed to extract Shiprocket status: {}", e.getMessage());
        }
        return null;
    }

    private String mapShiprocketToInternalStatus(String shiprocketStatus) {
        if (shiprocketStatus == null) return null;
        String status = shiprocketStatus.toLowerCase().trim();

        // Shiprocket status codes/strings mapping
        if (status.contains("delivered")) return "DELIVERED";
        if (status.contains("out for delivery") || status.equals("7")) return "OUT_FOR_DELIVERY";
        if (status.contains("in transit") || status.contains("shipped") || status.equals("6")) return "SHIPPED";
        if (status.contains("picked up") || status.equals("5")) return "SHIPPED";
        if (status.contains("cancelled") || status.contains("rto")) return "CANCELLED";

        return null;
    }

    private void handleRefundWebhook(String event, Map<String, Object> payload) {
        try {
            Map<String, Object> payloadEntity = (Map<String, Object>) payload.get("payload");
            Map<String, Object> refundEntity = (Map<String, Object>) payloadEntity.get("refund");
            Map<String, Object> entity = (Map<String, Object>) refundEntity.get("entity");

            String refundId = (String) entity.get("id");
            String paymentId = (String) entity.get("payment_id");
            String status = (String) entity.get("status");

            log.info("Refund webhook - Refund ID: {}, Payment ID: {}, Status: {}, Event: {}",
                refundId, paymentId, status, event);

            // Find order by payment ID
            List<CustomerOrder> orders = orderRepository.findAll();
            CustomerOrder order = orders.stream()
                .filter(o -> paymentId.equals(o.getPaymentId()))
                .findFirst()
                .orElse(null);

            if (order == null) {
                log.warn("No order found for payment ID: {}", paymentId);
                return;
            }

            switch (event) {
                case "refund.processed":
                    order.setPaymentStatus("REFUNDED");
                    log.info("Refund processed for order: {} - Refund ID: {}", order.getOrderId(), refundId);
                    break;
                case "refund.failed":
                    log.error("Refund failed for order: {} - Refund ID: {}", order.getOrderId(), refundId);
                    break;
                case "refund.created":
                    log.info("Refund created for order: {} - Refund ID: {}", order.getOrderId(), refundId);
                    break;
                default:
                    log.info("Unhandled refund event: {}", event);
                    return;
            }

            orderRepository.save(order);

        } catch (Exception e) {
            log.error("Error handling refund webhook: ", e);
        }
    }
}