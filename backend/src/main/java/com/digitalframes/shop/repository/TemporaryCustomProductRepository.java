package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.TemporaryCustomProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface TemporaryCustomProductRepository extends JpaRepository<TemporaryCustomProduct, String> {

    @Modifying
    @Transactional
    @Query("DELETE FROM TemporaryCustomProduct t WHERE t.expiresAt < :now")
    void deleteExpired(LocalDateTime now);
}
