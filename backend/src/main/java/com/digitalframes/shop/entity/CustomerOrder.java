package com.digitalframes.shop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String orderId; // Razorpay payment ID
    
    @Column(nullable = false)
    private String customerEmail; // Delivery email (recipient)
    
    private String purchaserEmail; // Who placed the order (logged-in user)
    
    @Column(nullable = false)
    private String customerName;
    
    @Column(nullable = false)
    private String customerPhone;
    
    @Column(columnDefinition = "TEXT")
    private String shippingAddress;
    
    private String city;
    private String state;
    private String pincode;
    
    @Column(nullable = false)
    private Double subtotal;
    
    @Column(nullable = false)
    private Double tax;
    
    @Column(nullable = false)
    private Double totalAmount;
    
    @Column(nullable = false)
    private String status = "PENDING";
    
    private String paymentId;
    private String paymentStatus;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<CustomerOrderItem> items = new ArrayList<>();

    // Shiprocket integration fields
    private String shiprocketOrderId;
    private String shiprocketShipmentId;
    private String awbNumber;
    private String courierName;
    private String trackingUrl;
    private String shiprocketStatus;

    // Delivery tracking
    private LocalDateTime deliveredAt;

    // Cancellation/failure details
    @Column(columnDefinition = "TEXT")
    private String failureReason;
}