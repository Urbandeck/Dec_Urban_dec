package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.ReturnRequest;
import com.digitalframes.shop.entity.ReturnRequest.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    Optional<ReturnRequest> findByReturnId(String returnId);

    List<ReturnRequest> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);

    List<ReturnRequest> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    @Query("SELECT r FROM ReturnRequest r WHERE r.order.orderId = :orderId ORDER BY r.createdAt DESC")
    List<ReturnRequest> findByOrderOrderId(@Param("orderId") String orderId);

    List<ReturnRequest> findByStatusOrderByCreatedAtDesc(ReturnStatus status);

    List<ReturnRequest> findByStatusInOrderByCreatedAtDesc(List<ReturnStatus> statuses);

    @Query("SELECT r FROM ReturnRequest r ORDER BY r.createdAt DESC")
    List<ReturnRequest> findAllOrderByCreatedAtDesc();

    @Query("SELECT COUNT(r) FROM ReturnRequest r WHERE r.status = :status")
    long countByStatus(@Param("status") ReturnStatus status);

    @Query("SELECT r FROM ReturnRequest r WHERE r.order.id = :orderId AND r.productId = :productId")
    Optional<ReturnRequest> findByOrderIdAndProductId(@Param("orderId") Long orderId, @Param("productId") Long productId);

    boolean existsByOrderIdAndProductId(Long orderId, Long productId);
}
