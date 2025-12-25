package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
    List<Product> findByActiveTrue();
    List<Product> findByCategory(String category);
    List<Product> findByBrand(String brand);
    List<Product> findByCategoryAndActiveTrue(String category);

    // Live status queries
    List<Product> findByActiveTrueAndIsLiveTrue();
    List<Product> findByIsLive(boolean isLive);
    List<Product> findByCategoryAndActiveTrueAndIsLiveTrue(String category);
    List<Product> findByBrandAndActiveTrueAndIsLiveTrue(String brand);
}