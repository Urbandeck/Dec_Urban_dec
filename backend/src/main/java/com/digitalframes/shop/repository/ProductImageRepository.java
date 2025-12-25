package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    List<ProductImage> findByProductIdOrderByDisplayOrderAsc(Long productId);
    List<ProductImage> findByProductId(Long productId);
    Optional<ProductImage> findByProductIdAndIsPrimaryTrue(Long productId);
    void deleteByProductId(Long productId);
    int countByProductId(Long productId);
}