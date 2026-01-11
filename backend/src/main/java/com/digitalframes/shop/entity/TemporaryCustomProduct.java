package com.digitalframes.shop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "temporary_custom_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemporaryCustomProduct {
    @Id
    private String tempId;

    private String frameSize;
    private String frameColor;
    private Integer quantity;

    @Column(columnDefinition = "TEXT")
    private String specialInstructions;

    private String customerName;
    private String customerEmail;
    private String customerPhone;

    @Column(columnDefinition = "TEXT")
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;
    private String country;

    private BigDecimal totalAmount;

    @OneToMany(mappedBy = "temporaryProduct", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<TemporaryCustomProductImage> images = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (expiresAt == null) {
            // Expire after 2 hours
            expiresAt = LocalDateTime.now().plusHours(2);
        }
    }
}
