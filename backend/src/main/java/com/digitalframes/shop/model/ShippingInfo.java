package com.digitalframes.shop.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipping_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShippingInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String zone;

    private String deliveryTime;
    private String expressDelivery;

    @Column(precision = 10, scale = 2)
    private BigDecimal freeShippingThreshold;

    @Column(precision = 10, scale = 2)
    private BigDecimal standardRate;

    @Column(precision = 10, scale = 2)
    private BigDecimal expressRate;

    private String weightRange;

    private Boolean active = true;

    
    private LocalDateTime createdAt;

    
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}