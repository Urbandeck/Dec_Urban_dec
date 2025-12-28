package com.digitalframes.shop.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.internet.MimeMessage;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "https://frontend-tawny-psi-67.vercel.app", "https://www.urbandec.in", "https://urbandec.in"})
public class ContactController {

    private static final Logger logger = LoggerFactory.getLogger(ContactController.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:urbandec.in@gmail.com}")
    private String fromEmail;

    // The email address to receive contact form messages
    private static final String CONTACT_EMAIL = "urbandec.in@gmail.com";

    @PostMapping
    public ResponseEntity<?> submitContactForm(@RequestBody ContactRequest request) {
        try {
            // Validate request
            if (request.name == null || request.name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Name is required"));
            }
            if (request.email == null || request.email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required"));
            }
            if (request.subject == null || request.subject.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Subject is required"));
            }
            if (request.message == null || request.message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Message is required"));
            }

            // Send email to admin
            sendContactEmail(request);

            logger.info("Contact form submitted successfully from: {}", request.email);
            return ResponseEntity.ok(Map.of("success", true, "message", "Your message has been sent successfully. We'll get back to you soon!"));

        } catch (Exception e) {
            logger.error("Failed to process contact form submission", e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Failed to send message. Please try again later."));
        }
    }

    private void sendContactEmail(ContactRequest request) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, "Urbandec Contact Form");
        helper.setTo(CONTACT_EMAIL);
        helper.setReplyTo(request.email);
        helper.setSubject("Contact Form: " + request.subject);

        String htmlContent = buildContactEmailHtml(request);
        helper.setText(htmlContent, true);

        mailSender.send(message);
        logger.info("Contact email sent to {} from {}", CONTACT_EMAIL, request.email);
    }

    private String buildContactEmailHtml(ContactRequest request) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<title>Contact Form Submission</title>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }");
        html.append(".container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }");
        html.append(".header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }");
        html.append(".content { padding: 30px; }");
        html.append(".field { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }");
        html.append(".field:last-child { border-bottom: none; }");
        html.append(".label { font-weight: bold; color: #555; margin-bottom: 5px; }");
        html.append(".value { color: #333; }");
        html.append(".message-box { background: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #2563eb; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class=\"container\">");
        html.append("<div class=\"header\">");
        html.append("<h1>New Contact Form Submission</h1>");
        html.append("<p>You have received a new message from the website</p>");
        html.append("</div>");
        html.append("<div class=\"content\">");

        html.append("<div class=\"field\">");
        html.append("<div class=\"label\">From:</div>");
        html.append("<div class=\"value\">").append(escapeHtml(request.name)).append("</div>");
        html.append("</div>");

        html.append("<div class=\"field\">");
        html.append("<div class=\"label\">Email:</div>");
        html.append("<div class=\"value\"><a href=\"mailto:").append(escapeHtml(request.email)).append("\">").append(escapeHtml(request.email)).append("</a></div>");
        html.append("</div>");

        html.append("<div class=\"field\">");
        html.append("<div class=\"label\">Subject:</div>");
        html.append("<div class=\"value\">").append(escapeHtml(request.subject)).append("</div>");
        html.append("</div>");

        html.append("<div class=\"field\">");
        html.append("<div class=\"label\">Message:</div>");
        html.append("<div class=\"message-box\">").append(escapeHtml(request.message).replace("\n", "<br>")).append("</div>");
        html.append("</div>");

        html.append("<p style=\"margin-top: 20px; color: #666; font-size: 12px;\">You can reply directly to this email to respond to the customer.</p>");

        html.append("</div>");
        html.append("</div>");
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }

    static class ContactRequest {
        public String name;
        public String email;
        public String subject;
        public String message;
    }
}
