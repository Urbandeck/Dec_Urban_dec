package com.digitalframes.shop.controller;

import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.entity.CustomerOrderItem;
import com.digitalframes.shop.entity.Product;
import com.digitalframes.shop.repository.CustomerOrderRepository;
import com.digitalframes.shop.repository.ProductRepository;
import com.digitalframes.shop.service.OrderService;
import com.digitalframes.shop.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class AdminOrderController {

    private final OrderService orderService;
    private final EmailService emailService;
    private final CustomerOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final com.digitalframes.shop.service.SmsService smsService;

    @GetMapping
    public ResponseEntity<List<CustomerOrder>> getAllOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            List<CustomerOrder> orders = orderService.getAllOrders();

            // Filter out custom orders (orders where all items have productId = 0)
            // Custom orders should only appear in admin custom products page
            orders = orders.stream()
                .filter(order -> {
                    if (order.getItems() == null || order.getItems().isEmpty()) {
                        return true; // Keep orders with no items
                    }
                    // Check if ANY item has a non-zero productId (i.e., it's a regular product)
                    return order.getItems().stream()
                        .anyMatch(item -> item.getProductId() != null && item.getProductId() != 0L);
                })
                .toList();

            // Apply filters if provided
            if (status != null && !status.isEmpty() && !status.equals("all")) {
                orders = orders.stream()
                    .filter(order -> order.getStatus().equalsIgnoreCase(status))
                    .toList();
            }

            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                orders = orders.stream()
                    .filter(order ->
                        order.getOrderId().toLowerCase().contains(searchLower) ||
                        order.getCustomerName().toLowerCase().contains(searchLower) ||
                        order.getCustomerEmail().toLowerCase().contains(searchLower))
                    .toList();
            }

            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("Error fetching all orders: ", e);
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

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Status is required"));
            }

            CustomerOrder order = orderService.updateOrderStatus(orderId, newStatus);

            return ResponseEntity.ok(Map.of(
                "orderId", order.getOrderId(),
                "status", order.getStatus(),
                "message", "Order status updated successfully"
            ));
        } catch (Exception e) {
            log.error("Error updating order status: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update order status: " + e.getMessage()));
        }
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

    @GetMapping("/stats")
    public ResponseEntity<?> getOrderStats() {
        try {
            List<CustomerOrder> orders = orderService.getAllOrders();

            // Filter out custom orders (orders where all items have productId = 0)
            orders = orders.stream()
                .filter(order -> {
                    if (order.getItems() == null || order.getItems().isEmpty()) {
                        return true;
                    }
                    return order.getItems().stream()
                        .anyMatch(item -> item.getProductId() != null && item.getProductId() != 0L);
                })
                .toList();

            long totalOrders = orders.size();
            long pendingOrders = orders.stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()))
                .count();
            long processingOrders = orders.stream()
                .filter(o -> "PROCESSING".equalsIgnoreCase(o.getStatus()) ||
                           "PAID".equalsIgnoreCase(o.getStatus()))
                .count();
            long shippedOrders = orders.stream()
                .filter(o -> "SHIPPED".equalsIgnoreCase(o.getStatus()))
                .count();
            long deliveredOrders = orders.stream()
                .filter(o -> "DELIVERED".equalsIgnoreCase(o.getStatus()))
                .count();
            long cancelledOrders = orders.stream()
                .filter(o -> "CANCELLED".equalsIgnoreCase(o.getStatus()))
                .count();

            double totalRevenue = orders.stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(CustomerOrder::getTotalAmount)
                .sum();

            return ResponseEntity.ok(Map.of(
                "totalOrders", totalOrders,
                "pendingOrders", pendingOrders,
                "processingOrders", processingOrders,
                "shippedOrders", shippedOrders,
                "deliveredOrders", deliveredOrders,
                "cancelledOrders", cancelledOrders,
                "totalRevenue", totalRevenue
            ));
        } catch (Exception e) {
            log.error("Error fetching order stats: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch order statistics"));
        }
    }

    /**
     * Sync order statuses from Shiprocket tracking data
     */
    @PostMapping("/sync-shiprocket")
    public ResponseEntity<?> syncShiprocketStatuses() {
        try {
            Map<String, Object> result = orderService.syncShiprocketStatuses();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error syncing Shiprocket statuses: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to sync: " + e.getMessage()));
        }
    }

    /**
     * Update all existing order items with product images from the database
     */
    @PostMapping("/update-images")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateOrderImages() {
        Map<String, Object> response = new HashMap<>();
        int updatedCount = 0;
        int totalItems = 0;

        try {
            // Get all orders
            List<CustomerOrder> orders = orderRepository.findAll();

            for (CustomerOrder order : orders) {
                for (CustomerOrderItem item : order.getItems()) {
                    totalItems++;

                    // Skip if image already set
                    if (item.getImageUrl() != null && !item.getImageUrl().isEmpty()) {
                        continue;
                    }

                    // Get product and its images
                    Product product = productRepository.findById(item.getProductId()).orElse(null);
                    if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
                        Long imageId = product.getImages().get(0).getId();
                        if (imageId != null) {
                            item.setImageUrl("/api/products/images/" + imageId);
                            updatedCount++;
                            log.info("Updated image for order item {} in order {}", item.getId(), order.getOrderId());
                        }
                    }
                }
            }

            // Save all changes
            orderRepository.saveAll(orders);

            response.put("success", true);
            response.put("totalItems", totalItems);
            response.put("updatedCount", updatedCount);
            response.put("message", String.format("Updated %d of %d order items with images", updatedCount, totalItems));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating order images: ", e);
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}