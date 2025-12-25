package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.CustomProductRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomProductRepository extends JpaRepository<CustomProductRequest, Long> {

    List<CustomProductRequest> findByStatus(String status);

    @Query(value = "SELECT * FROM custom_product_requests ORDER BY created_at DESC LIMIT :limit", nativeQuery = true)
    List<CustomProductRequest> findTopNByOrderByCreatedAtDesc(@Param("limit") int limit);

    List<CustomProductRequest> findByCustomerEmail(String email);

    @Query("SELECT c FROM CustomProductRequest c WHERE c.status IN :statuses")
    List<CustomProductRequest> findByStatusIn(@Param("statuses") List<String> statuses);

    long countByStatus(String status);
}