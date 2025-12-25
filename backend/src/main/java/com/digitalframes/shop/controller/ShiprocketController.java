package com.digitalframes.shop.controller;

import com.digitalframes.shop.service.ShiprocketService;
import com.digitalframes.shop.service.OrderService;
import com.digitalframes.shop.entity.CustomerOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/shiprocket")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ShiprocketController {

    @Autowired
    private ShiprocketService shiprocketService;

    @Autowired
    private OrderService orderService;

    @PostMapping("/sync-order/{orderId}")
    public ResponseEntity<?> syncOrderToShiprocket(@PathVariable Long orderId) {
        try {
            Optional<CustomerOrder> orderOpt = orderService.getOrderById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            CustomerOrder order = orderOpt.get();

            Map<String, Object> response = shiprocketService.createShiprocketOrder(order);

            // Update order with Shiprocket details if successful
            if (response.get("order_id") != null) {
                order.setShiprocketOrderId(response.get("order_id").toString());
                if (response.get("shipment_id") != null) {
                    order.setShiprocketShipmentId(response.get("shipment_id").toString());
                }
                orderService.saveOrder(order);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to sync order: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/generate-awb/{orderId}")
    public ResponseEntity<?> generateAWB(@PathVariable Long orderId) {
        try {
            Optional<CustomerOrder> orderOpt = orderService.getOrderById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            CustomerOrder order = orderOpt.get();

            if (order.getShiprocketShipmentId() == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Order not synced with Shiprocket yet");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            Map<String, Object> response = shiprocketService.generateAWB(order.getShiprocketShipmentId());

            // Update order with AWB if successful
            if (response.get("awb_code") != null) {
                order.setAwbNumber(response.get("awb_code").toString());
                orderService.saveOrder(order);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to generate AWB: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/track/{awb}")
    public ResponseEntity<?> trackShipment(@PathVariable String awb) {
        try {
            Map<String, Object> response = shiprocketService.trackShipment(awb);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to track shipment: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/cancel/{awb}")
    public ResponseEntity<?> cancelShipment(@PathVariable String awb) {
        try {
            Map<String, Object> response = shiprocketService.cancelShipment(awb);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to cancel shipment: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuthentication() {
        try {
            String token = shiprocketService.authenticateAndGetToken();
            Map<String, Object> response = new HashMap<>();
            response.put("success", token != null);
            response.put("message", token != null ? "Authentication successful" : "Authentication failed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Authentication failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}