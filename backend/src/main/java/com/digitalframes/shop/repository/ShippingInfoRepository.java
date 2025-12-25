package com.digitalframes.shop.repository;

import com.digitalframes.shop.model.ShippingInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShippingInfoRepository extends JpaRepository<ShippingInfo, Long> {
    List<ShippingInfo> findByZone(String zone);
    List<ShippingInfo> findByActive(Boolean active);
}