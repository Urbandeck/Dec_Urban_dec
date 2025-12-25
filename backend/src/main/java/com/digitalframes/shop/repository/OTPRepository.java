package com.digitalframes.shop.repository;

import com.digitalframes.shop.model.OTP;
import com.digitalframes.shop.model.OTP.OTPType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {

    @Query("SELECT o FROM OTP o WHERE o.email = ?1 AND o.code = ?2 AND o.type = ?3 AND o.used = false AND o.expiresAt > ?4")
    Optional<OTP> findValidOTP(String email, String code, OTPType type, LocalDateTime now);

    @Query("SELECT o FROM OTP o WHERE o.email = ?1 AND o.type = ?2 AND o.used = false AND o.expiresAt > ?3 ORDER BY o.createdAt DESC")
    Optional<OTP> findLatestValidOTP(String email, OTPType type, LocalDateTime now);

    void deleteByEmailAndType(String email, OTPType type);

    @Query("DELETE FROM OTP o WHERE o.expiresAt < ?1")
    void deleteExpiredOTPs(LocalDateTime now);
}