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
        
        CustomerOrder savedOrder = orderRepository.save(order);
        log.info("Order created successfully with ID: {}, Status: {}", savedOrder.getOrderId(), savedOrder.getStatus());

        // If order is PAID, create Shiprocket order immediately
        if ("PAID".equals(savedOrder.getStatus())) {
            try {
                log.info("Order is PAID, creating Shiprocket order for: {}", savedOrder.getOrderId());
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
                    log.info("Shiprocket order created successfully. Shiprocket Order ID: {}",
                        shiprocketResponse.get("order_id"));
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
}