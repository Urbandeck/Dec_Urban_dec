package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByCustomerEmailOrderByCreatedAtDesc(String email);
    List<CustomerOrder> findByPurchaserEmailOrderByCreatedAtDesc(String purchaserEmail);
    List<CustomerOrder> findByPurchaserEmailOrCustomerEmailOrderByCreatedAtDesc(String purchaserEmail, String customerEmail);
    Optional<CustomerOrder> findByOrderId(String orderId);
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
    Optional<CustomerOrder> findByAwbNumber(String awbNumber);
    Optional<CustomerOrder> findByShiprocketOrderId(String shiprocketOrderId);
}