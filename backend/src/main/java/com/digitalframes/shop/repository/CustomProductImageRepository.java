package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.CustomProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomProductImageRepository extends JpaRepository<CustomProductImage, Long> {

    List<CustomProductImage> findByCustomProductRequestId(Long requestId);

    void deleteByCustomProductRequestId(Long requestId);
}