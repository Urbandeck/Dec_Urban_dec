package com.digitalframes.shop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class OTPEmailService {

    private static final Logger logger = LoggerFactory.getLogger(OTPEmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:urbandec.in@gmail.com}")
    private String fromEmail;

    @Value("${app.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendOTPEmail(String to, String otp, String type, int expiryMinutes) {
        try {
            // Log the attempt
            logger.info("Attempting to send OTP email to: {}", to);
            logger.debug("Email enabled: {}, From email: {}", emailEnabled, fromEmail);

            if (!emailEnabled) {
                logger.info("Email Service (DEV MODE) - OTP Email:");
                logger.info("To: {}", to);
                logger.info("OTP Code: {}", otp);
                logger.info("Type: {}", type);
                logger.info("========================================");
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "urbandec Digital Frames");
            helper.setTo(to);

            String subject = getSubject(type);
            String htmlContent = buildOTPEmailHtml(otp, type, expiryMinutes, to);

            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Professional OTP email sent successfully to: {}", to);

        } catch (Exception e) {
            logger.error("Failed to send OTP email to: " + to, e);
            // Re-throw to propagate the error
            throw new RuntimeException("Failed to send OTP email. Please check your email address and try again.", e);
        }
    }

    private String getSubject(String type) {
        switch (type.toUpperCase()) {
            case "SIGNUP":
                return "Welcome to urbandec - Verify Your Email";
            case "LOGIN":
                return "urbandec - Login Verification Code";
            case "PASSWORD_RESET":
                return "urbandec - Password Reset Code";
            default:
                return "urbandec - Verification Code";
        }
    }

    private String buildOTPEmailHtml(String otp, String type, int expiryMinutes, String email) {
        String title = getEmailTitle(type);
        String description = getEmailDescription(type, email);
        String actionText = getActionText(type);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html lang='en'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
        html.append("<title>").append(title).append("</title>");
        html.append("<style>");
        html.append("@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');");
        html.append("* { margin: 0; padding: 0; box-sizing: border-box; }");
        html.append("body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #1a1a1a; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }");
        html.append(".container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }");
        html.append(".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }");
        html.append(".logo { font-size: 32px; font-weight: 700; color: #ffffff; text-decoration: none; display: inline-block; margin-bottom: 10px; }");
        html.append(".tagline { color: rgba(255,255,255,0.9); font-size: 14px; font-weight: 500; }");
        html.append(".content { padding: 40px 30px; background: #ffffff; }");
        html.append(".greeting { font-size: 24px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; }");
        html.append(".message { font-size: 16px; color: #4a5568; margin-bottom: 30px; line-height: 1.7; }");
        html.append(".otp-container { background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }");
        html.append(".otp-label { font-size: 14px; color: #718096; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }");
        html.append(".otp-code { font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; padding: 15px 20px; background: #ffffff; border-radius: 8px; display: inline-block; border: 2px dashed #667eea; margin: 10px 0; font-family: 'Courier New', monospace; }");
        html.append(".expiry-notice { font-size: 13px; color: #e53e3e; margin-top: 15px; font-weight: 500; }");
        html.append(".icon { font-size: 20px; margin-right: 5px; vertical-align: middle; }");
        html.append(".features { margin: 30px 0; padding: 20px; background: #f7fafc; border-radius: 8px; }");
        html.append(".feature-item { display: flex; align-items: center; margin: 15px 0; font-size: 14px; color: #4a5568; }");
        html.append(".feature-icon { width: 24px; height: 24px; margin-right: 12px; color: #667eea; }");
        html.append(".divider { height: 1px; background: linear-gradient(90deg, transparent, #e2e8f0, transparent); margin: 30px 0; }");
        html.append(".footer { background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }");
        html.append(".footer-text { font-size: 13px; color: #718096; margin: 5px 0; }");
        html.append(".footer-links { margin-top: 20px; }");
        html.append(".footer-link { color: #667eea; text-decoration: none; margin: 0 15px; font-size: 13px; font-weight: 500; }");
        html.append(".footer-link:hover { text-decoration: underline; }");
        html.append(".social-links { margin-top: 20px; }");
        html.append(".social-link { display: inline-block; margin: 0 10px; width: 32px; height: 32px; background: #667eea; border-radius: 50%; text-align: center; line-height: 32px; color: white; text-decoration: none; }");
        html.append(".warning-box { background: #fff5f5; border-left: 4px solid #fc8181; padding: 15px; margin: 20px 0; border-radius: 4px; }");
        html.append(".warning-text { color: #c53030; font-size: 14px; }");
        html.append(".success-badge { background: #48bb78; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; display: inline-block; margin-left: 10px; }");
        html.append("@media only screen and (max-width: 600px) {");
        html.append("  .container { margin: 0; border-radius: 0; }");
        html.append("  .content { padding: 30px 20px; }");
        html.append("  .otp-code { font-size: 28px; letter-spacing: 4px; }");
        html.append("}");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");

        // Header
        html.append("<div class='header'>");
        html.append("<div style='text-align: center;'>");
        html.append("<div style='display: inline-flex; align-items: center; gap: 10px;'>");
        // SVG Logo - same as website
        html.append("<svg width='36' height='36' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'>");
        html.append("<path stroke-linecap='round' stroke-linejoin='round' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />");
        html.append("</svg>");
        html.append("<span class='logo'>urbandec</span>");
        html.append("</div>");
        html.append("</div>");
        html.append("<div class='tagline'>Premium Digital Photo Frames</div>");
        html.append("</div>");

        // Content
        html.append("<div class='content'>");
        html.append("<h2 class='greeting'>").append(title).append("</h2>");
        html.append("<p class='message'>").append(description).append("</p>");

        // OTP Box
        html.append("<div class='otp-container'>");
        html.append("<div class='otp-label'>Your Verification Code</div>");
        html.append("<div class='otp-code'>").append(otp).append("</div>");
        html.append("<div class='expiry-notice'>");
        html.append("<span class='icon'>⏰</span>");
        html.append("This code expires in ").append(expiryMinutes).append(" minutes");
        html.append("</div>");
        html.append("</div>");

        // Instructions based on type
        if (type.equalsIgnoreCase("SIGNUP")) {
            html.append("<div class='features'>");
            html.append("<h3 style='font-size: 16px; margin-bottom: 15px; color: #2d3748;'>What happens next?</h3>");
            html.append("<div class='feature-item'>");
            html.append("<span class='feature-icon'>✅</span>");
            html.append("<span>Enter this code to verify your email address</span>");
            html.append("</div>");
            html.append("<div class='feature-item'>");
            html.append("<span class='feature-icon'>🛍️</span>");
            html.append("<span>Browse our premium collection of digital frames</span>");
            html.append("</div>");
            html.append("<div class='feature-item'>");
            html.append("<span class='feature-icon'>🚚</span>");
            html.append("<span>Enjoy fast & free shipping on orders over ₹999</span>");
            html.append("</div>");
            html.append("<div class='feature-item'>");
            html.append("<span class='feature-icon'>💯</span>");
            html.append("<span>30-day money-back guarantee</span>");
            html.append("</div>");
            html.append("</div>");
        }

        // Warning box
        html.append("<div class='warning-box'>");
        html.append("<p class='warning-text'>");
        html.append("<strong>🔒 Security Notice:</strong> ");
        html.append("Never share this code with anyone. urbandec staff will never ask for your verification code.");
        html.append("</p>");
        html.append("</div>");

        html.append("<div class='divider'></div>");

        // Help text
        html.append("<p style='font-size: 14px; color: #718096; text-align: center;'>");
        html.append("Having trouble? ");
        html.append("<a href='mailto:support@urbandec.com' style='color: #667eea; text-decoration: none; font-weight: 500;'>Contact Support</a>");
        html.append("</p>");

        html.append("</div>");

        // Footer
        html.append("<div class='footer'>");
        html.append("<p class='footer-text'>© 2025 urbandec Digital Frames. All rights reserved.</p>");
        html.append("<p class='footer-text'>📍 Mumbai, Maharashtra, India</p>");

        html.append("<div class='footer-links'>");
        html.append("<a href='").append(frontendUrl).append("/privacy' class='footer-link'>Privacy Policy</a>");
        html.append("<a href='").append(frontendUrl).append("/terms' class='footer-link'>Terms of Service</a>");
        html.append("<a href='").append(frontendUrl).append("/contact' class='footer-link'>Contact Us</a>");
        html.append("</div>");

        html.append("<div class='social-links'>");
        html.append("<a href='https://facebook.com/urbandec' class='social-link' title='Facebook' style='font-family: Arial; font-weight: bold;'>f</a>");
        html.append("<a href='https://twitter.com/urbandec' class='social-link' title='Twitter' style='font-family: Arial; font-weight: bold;'>X</a>");
        html.append("<a href='https://instagram.com/urbandec' class='social-link' title='Instagram' style='font-family: Arial; font-weight: bold;'>ig</a>");
        html.append("</div>");

        html.append("<p class='footer-text' style='margin-top: 20px; font-size: 11px; color: #a0aec0;'>");
        html.append("You received this email because you requested a verification code for urbandec.<br>");
        html.append("If you didn't request this, please ignore this email.");
        html.append("</p>");
        html.append("</div>");

        html.append("</div>");
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    private String getEmailTitle(String type) {
        switch (type.toUpperCase()) {
            case "SIGNUP":
                return "Welcome to urbandec! 🎉";
            case "LOGIN":
                return "Your Login Code";
            case "PASSWORD_RESET":
                return "Reset Your Password";
            default:
                return "Verification Required";
        }
    }

    private String getEmailDescription(String type, String email) {
        switch (type.toUpperCase()) {
            case "SIGNUP":
                return "Thank you for joining urbandec! We're excited to have you as part of our community. To complete your registration and unlock access to our premium digital frames collection, please verify your email address using the code below.";
            case "LOGIN":
                return "A login attempt was made to your urbandec account. To complete the login process, please enter the verification code below.";
            case "PASSWORD_RESET":
                return "We received a request to reset your password for " + email + ". Enter the code below to create a new password.";
            default:
                return "Please use the verification code below to continue.";
        }
    }

    private String getActionText(String type) {
        switch (type.toUpperCase()) {
            case "SIGNUP":
                return "Complete Registration";
            case "LOGIN":
                return "Verify Login";
            case "PASSWORD_RESET":
                return "Reset Password";
            default:
                return "Verify";
        }
    }
}