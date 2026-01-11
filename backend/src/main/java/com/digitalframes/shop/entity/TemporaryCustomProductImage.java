package com.digitalframes.shop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "temporary_custom_product_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemporaryCustomProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "temp_id", nullable = false)
    private TemporaryCustomProduct temporaryProduct;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String mimeType;

    @Column(nullable = false)
    private Long fileSize;

    @Lob
    @Column(nullable = false, columnDefinition = "BYTEA")
    private byte[] imageData;

    private Integer displayOrder;
}
