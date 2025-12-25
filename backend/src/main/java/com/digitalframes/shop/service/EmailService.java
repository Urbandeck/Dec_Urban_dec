package com.digitalframes.shop.service;

import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private PdfService pdfService;
    
    @Value("${spring.mail.username:support@urbandec.shop}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendOrderConfirmationEmail(CustomerOrder order) {
        try {
            // Log email configuration
            logger.info("Email configuration - Host: {}, Port: {}, Username: {}, Password: {}", 
                System.getenv("MAIL_HOST"), 
                System.getenv("MAIL_PORT"),
                System.getenv("MAIL_USERNAME"),
                System.getenv("MAIL_PASSWORD") != null ? "***SET***" : "NOT SET");
            
            // Get emails to send to
            String customerEmail = order.getCustomerEmail();
            String purchaserEmail = order.getPurchaserEmail();
            
            logger.info("Preparing to send order confirmation emails - Customer: {}, Purchaser: {}", 
                customerEmail, purchaserEmail);
            
            // Build the email content once
            String htmlContent = buildOrderConfirmationHtml(order);
            String subject = "Order Confirmation - Order #" + order.getOrderId();
            
            // Generate PDF invoice
            byte[] pdfBytes = pdfService.generateInvoicePdf(order);
            
            // Send to customer email (delivery address)
            if (customerEmail != null && !customerEmail.trim().isEmpty()) {
                sendEmailWithAttachment(customerEmail, subject, htmlContent, pdfBytes, order.getOrderId(), "customer");
                logger.info("Order confirmation email with PDF sent to customer: {}", customerEmail);
            }
            
            // Send to purchaser email if different from customer email
            if (purchaserEmail != null && !purchaserEmail.trim().isEmpty() && 
                !purchaserEmail.equalsIgnoreCase(customerEmail)) {
                sendEmailWithAttachment(purchaserEmail, subject, htmlContent, pdfBytes, order.getOrderId(), "purchaser");
                logger.info("Order confirmation email with PDF sent to purchaser: {}", purchaserEmail);
            }
            
        } catch (Exception e) {
            logger.error("Failed to send order confirmation email for order: {}", order.getOrderId(), e);
        }
    }
    
    private void sendEmailToRecipient(String email, String subject, String htmlContent, String recipientType) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "UrbanDec - Digital Frames Shop");
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Email sent to {} ({})", email, recipientType);
            
        } catch (Exception e) {
            logger.error("Failed to send email to {} ({}): {}", email, recipientType, e.getMessage());
        }
    }
    
    private void sendEmailWithAttachment(String email, String subject, String htmlContent, byte[] pdfBytes, String orderId, String recipientType) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "UrbanDec - Digital Frames Shop");
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            // Attach PDF if generated successfully
            if (pdfBytes != null && pdfBytes.length > 0) {
                ByteArrayResource pdfResource = new ByteArrayResource(pdfBytes);
                helper.addAttachment("Invoice_" + orderId + ".pdf", pdfResource);
                logger.info("PDF attachment added for order: {}", orderId);
            }
            
            mailSender.send(message);
            logger.info("Email with attachment sent to {} ({})", email, recipientType);
            
        } catch (Exception e) {
            logger.error("Failed to send email with attachment to {} ({}): {}", email, recipientType, e.getMessage());
        }
    }
    
    public void sendOrderShippedEmail(CustomerOrder order, String trackingNumber) {
        try {
            // Get emails to send to
            String customerEmail = order.getCustomerEmail();
            String purchaserEmail = order.getPurchaserEmail();
            
            // Build the email content once
            String htmlContent = buildOrderShippedHtml(order, trackingNumber);
            String subject = "Order Shipped - Order #" + order.getOrderId();
            
            // Send to customer email (delivery address)
            if (customerEmail != null && !customerEmail.trim().isEmpty()) {
                sendEmailToRecipient(customerEmail, subject, htmlContent, "customer");
                logger.info("Order shipped email sent to customer: {}", customerEmail);
            }
            
            // Send to purchaser email if different from customer email
            if (purchaserEmail != null && !purchaserEmail.trim().isEmpty() && 
                !purchaserEmail.equalsIgnoreCase(customerEmail)) {
                sendEmailToRecipient(purchaserEmail, subject, htmlContent, "purchaser");
                logger.info("Order shipped email sent to purchaser: {}", purchaserEmail);
            }
            
        } catch (Exception e) {
            logger.error("Failed to send order shipped email for order: {}", order.getOrderId(), e);
        }
    }
    
    public void sendWelcomeEmail(User user) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "UrbanDec - Digital Frames Shop");
            helper.setTo(user.getEmail());
            helper.setSubject("Welcome to UrbanDec - Digital Frames Shop");
            
            String htmlContent = buildWelcomeEmailHtml(user);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Welcome email sent to: {}", user.getEmail());
            
        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", user.getEmail(), e);
        }
    }
    
    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "UrbanDec - Digital Frames Shop");
            helper.setTo(email);
            helper.setSubject("Password Reset Request - UrbanDec");
            
            String htmlContent = buildPasswordResetHtml(resetToken);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("Password reset email sent to: {}", email);
            
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", email, e);
        }
    }
    
    public void sendInvoiceEmail(CustomerOrder order, String recipientEmail) {
        try {
            String subject = "Invoice - Order #" + order.getOrderId();
            String htmlContent = buildInvoiceEmailHtml(order);

            sendEmailToRecipient(recipientEmail, subject, htmlContent, "invoice");
            logger.info("Invoice email sent to: {}", recipientEmail);

        } catch (Exception e) {
            logger.error("Failed to send invoice email for order: {} to: {}", order.getOrderId(), recipientEmail, e);
        }
    }

    @Value("${app.email.enabled:true}")
    private boolean appEmailEnabled;

    public void sendEmail(String to, String subject, String text) {
        try {
            // Check if email is enabled
            if (!appEmailEnabled) {
                logger.info("Email Service (DEV MODE) - OTP Email:");
                logger.info("To: {}", to);
                logger.info("Subject: {}", subject);
                logger.info("Body: {}", text);
                logger.info("========================================");
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            mailSender.send(message);
            logger.info("OTP Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send OTP email to: " + to, e);
        }
    }
    
    private String buildOrderConfirmationHtml(CustomerOrder order) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<title>Order Confirmation</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }");
        html.append(".content { padding: 30px; }");
        html.append(".order-details { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }");
        html.append(".btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<h1>Order Confirmed!</h1>");
        html.append("<p>Thank you for your order. We're excited to get your digital frame to you!</p>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        html.append("<div class=\"order-details\">");
        html.append("<h2>Order Details</h2>");
        html.append("<p><strong>Order ID:</strong> ").append(order.getOrderId()).append("</p>");
        html.append("<p><strong>Order Date:</strong> ").append(order.getCreatedAt().format(dateFormat)).append("</p>");
        html.append("<p><strong>Customer:</strong> ").append(order.getCustomerName()).append("</p>");
        html.append("<p><strong>Email:</strong> ").append(order.getCustomerEmail()).append("</p>");
        html.append("</div>");
        html.append("<p><strong>Total Amount:</strong> ").append(currencyFormat.format(order.getTotalAmount())).append("</p>");
        html.append("<div style=\"text-align: center;\">");
        html.append("<a href=\"").append(frontendUrl).append("/orders\" class=\"btn\">Track Your Order</a>");
        html.append("</div>");
        html.append("<p>We'll send you another email when your order ships. If you have any questions, please contact our customer support team.</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    
    private String buildOrderShippedHtml(CustomerOrder order, String trackingNumber) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<title>Order Shipped</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }");
        html.append(".content { padding: 30px; }");
        html.append(".btn { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<h1>Order Shipped!</h1>");
        html.append("<p>Great news! Your order is on its way to you.</p>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        html.append("<h3>Shipping Information</h3>");
        html.append("<p><strong>Order ID:</strong> ").append(order.getOrderId()).append("</p>");
        html.append("<p><strong>Tracking Number:</strong> ").append(trackingNumber).append("</p>");
        html.append("<p><strong>Estimated Delivery:</strong> 3-5 business days</p>");
        html.append("<div style=\"text-align: center;\">");
        html.append("<a href=\"").append(frontendUrl).append("/orders\" class=\"btn\">Track Your Package</a>");
        html.append("</div>");
        html.append("<p>We'll notify you again when your order is delivered. Thank you for shopping with UrbanDec!</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    
    private String buildWelcomeEmailHtml(User user) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<title>Welcome to UrbanDec</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }");
        html.append(".content { padding: 30px; }");
        html.append(".btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<h1>Welcome to UrbanDec!</h1>");
        html.append("<p>We're excited to have you join our community of digital frame enthusiasts.</p>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        html.append("<p>Hello ").append(user.getName()).append(",</p>");
        html.append("<p>Thank you for creating an account with UrbanDec! We're your premier destination for high-quality digital photo frames.</p>");
        html.append("<div style=\"text-align: center;\">");
        html.append("<a href=\"").append(frontendUrl).append("/products\" class=\"btn\">Shop Digital Frames</a>");
        html.append("</div>");
        html.append("<p>Ready to find the perfect digital frame for your home? Browse our collection and discover the magic of bringing your photos to life!</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    
    private String buildPasswordResetHtml(String resetToken) {
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<title>Password Reset</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }");
        html.append(".content { padding: 30px; }");
        html.append(".btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<h1>Password Reset</h1>");
        html.append("<p>We received a request to reset your password.</p>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        html.append("<p>Someone requested a password reset for your UrbanDec account.</p>");
        html.append("<p>Click the button below to reset your password:</p>");
        html.append("<div style=\"text-align: center;\">");
        html.append("<a href=\"").append(resetUrl).append("\" class=\"btn\">Reset Password</a>");
        html.append("</div>");
        html.append("<p>This link will expire in 1 hour for security reasons. If you didn't request this reset, you can safely ignore this email.</p>");
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    
    private String buildInvoiceEmailHtml(CustomerOrder order) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<title>Invoice</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }");
        html.append(".content { padding: 30px; }");
        html.append(".invoice-details { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }");
        html.append(".items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        html.append(".items-table th { background: #f3f4f6; padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb; }");
        html.append(".items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }");
        html.append(".total-row { font-weight: bold; font-size: 1.1em; }");
        html.append(".btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<h1>Invoice</h1>");
        html.append("<p>UrbanDec - Digital Frames Shop</p>");
        html.append("</div>");
        html.append("<div class=\"content\">");
        
        // Invoice Details
        html.append("<div class=\"invoice-details\">");
        html.append("<h2>Invoice Details</h2>");
        html.append("<p><strong>Order ID:</strong> ").append(order.getOrderId()).append("</p>");
        html.append("<p><strong>Date:</strong> ").append(order.getCreatedAt().format(dateFormat)).append("</p>");
        html.append("<p><strong>Payment ID:</strong> ").append(order.getPaymentId()).append("</p>");
        html.append("<p><strong>Status:</strong> ").append(order.getStatus()).append("</p>");
        html.append("</div>");
        
        // Billing Details
        html.append("<div class=\"invoice-details\">");
        html.append("<h3>Billing To:</h3>");
        html.append("<p><strong>").append(order.getCustomerName()).append("</strong></p>");
        html.append("<p>").append(order.getShippingAddress()).append("</p>");
        html.append("<p>").append(order.getCity()).append(", ").append(order.getState()).append(" - ").append(order.getPincode()).append("</p>");
        html.append("<p>Phone: ").append(order.getCustomerPhone()).append("</p>");
        html.append("<p>Email: ").append(order.getCustomerEmail()).append("</p>");
        html.append("</div>");
        
        // Items Table
        html.append("<h3>Items</h3>");
        html.append("<table class=\"items-table\">");
        html.append("<thead>");
        html.append("<tr>");
        html.append("<th>Item</th>");
        html.append("<th>Qty</th>");
        html.append("<th>Price</th>");
        html.append("<th>Total</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");
        
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                html.append("<tr>");
                html.append("<td>").append(item.getProductName()).append("</td>");
                html.append("<td>").append(item.getQuantity()).append("</td>");
                html.append("<td>").append(currencyFormat.format(item.getPrice())).append("</td>");
                html.append("<td>").append(currencyFormat.format(item.getTotal())).append("</td>");
                html.append("</tr>");
            }
        }
        
        // Summary
        html.append("<tr>");
        html.append("<td colspan=\"3\" style=\"text-align: right;\">Subtotal:</td>");
        html.append("<td>").append(currencyFormat.format(order.getSubtotal())).append("</td>");
        html.append("</tr>");
        html.append("<tr>");
        html.append("<td colspan=\"3\" style=\"text-align: right;\">Tax (18% GST):</td>");
        html.append("<td>").append(currencyFormat.format(order.getTax())).append("</td>");
        html.append("</tr>");
        html.append("<tr class=\"total-row\">");
        html.append("<td colspan=\"3\" style=\"text-align: right;\">Total:</td>");
        html.append("<td>").append(currencyFormat.format(order.getTotalAmount())).append("</td>");
        html.append("</tr>");
        html.append("</tbody>");
        html.append("</table>");
        
        html.append("<div style=\"text-align: center; margin-top: 30px;\">");
        html.append("<p>Thank you for your business!</p>");
        html.append("<a href=\"").append(frontendUrl).append("/orders\" class=\"btn\">View Order Online</a>");
        html.append("</div>");
        
        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}