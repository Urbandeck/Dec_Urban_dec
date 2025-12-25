package com.digitalframes.shop.service;

import com.digitalframes.shop.model.OTP;
import com.digitalframes.shop.model.OTP.OTPType;
import com.digitalframes.shop.repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OTPService {

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OTPEmailService otpEmailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public OTP generateOTP(String email, OTPType type) {
        // Check if there's a valid OTP that hasn't expired yet
        Optional<OTP> existingValidOTP = otpRepository.findLatestValidOTP(
            email, type, LocalDateTime.now()
        );

        if (existingValidOTP.isPresent()) {
            OTP existing = existingValidOTP.get();
            LocalDateTime createdAt = existing.getCreatedAt();

            // If OTP was created within last minute, prevent spam
            if (createdAt.isAfter(LocalDateTime.now().minusMinutes(1))) {
                long secondsLeft = 60 - java.time.Duration.between(createdAt, LocalDateTime.now()).getSeconds();
                throw new RuntimeException("Please wait " + secondsLeft + " seconds before requesting a new OTP");
            }

            // If OTP is still valid (within 10 minutes) but older than 1 minute, allow resend
            // This gives user ability to resend if they didn't receive it
        }

        // Delete any existing OTPs for this email and type
        otpRepository.deleteByEmailAndType(email, type);

        // Generate new OTP
        OTP otp = new OTP();
        otp.setEmail(email);
        otp.setCode(generateOTPCode());
        otp.setType(type);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otp.setUsed(false);

        OTP savedOTP = otpRepository.save(otp);

        // Send OTP via email
        sendOTPEmail(email, savedOTP.getCode(), type);

        return savedOTP;
    }

    @Transactional
    public boolean verifyOTP(String email, String code, OTPType type) {
        Optional<OTP> otpOptional = otpRepository.findValidOTP(
            email, code, type, LocalDateTime.now()
        );

        if (otpOptional.isPresent()) {
            OTP otp = otpOptional.get();
            otp.setUsed(true);
            otpRepository.save(otp);
            return true;
        }

        return false;
    }

    @Transactional
    public OTP resendOTP(String email, OTPType type) {
        // Check if there's a recent OTP (sent within last minute)
        Optional<OTP> recentOTP = otpRepository.findLatestValidOTP(
            email, type, LocalDateTime.now()
        );

        if (recentOTP.isPresent() &&
            recentOTP.get().getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(1))) {
            throw new RuntimeException("Please wait 1 minute before requesting a new OTP");
        }

        return generateOTP(email, type);
    }

    private String generateOTPCode() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    private void sendOTPEmail(String email, String code, OTPType type) {
        // Use the professional OTP email service
        otpEmailService.sendOTPEmail(email, code, type.toString(), OTP_EXPIRY_MINUTES);

        // Fallback to simple email if needed
        // emailService.sendEmail(email, subject, message);
    }

    @Transactional
    public void cleanupExpiredOTPs() {
        otpRepository.deleteExpiredOTPs(LocalDateTime.now());
    }
}