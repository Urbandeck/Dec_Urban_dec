package com.digitalframes.shop.service;

import com.digitalframes.shop.entity.CustomerOrder;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class PdfService {
    
    private static final Logger logger = LoggerFactory.getLogger(PdfService.class);
    
    public byte[] generateInvoicePdf(CustomerOrder order) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            String htmlContent = buildInvoiceHtml(order);
            HtmlConverter.convertToPdf(htmlContent, baos);
            return baos.toByteArray();
        } catch (Exception e) {
            logger.error("Failed to generate PDF for order: {}", order.getOrderId(), e);
            return null;
        }
    }
    
    private String buildInvoiceHtml(CustomerOrder order) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
        
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset=\"UTF-8\">");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; margin: 20px; }");
        html.append("h1 { color: #2563eb; }");
        html.append(".header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }");
        html.append(".company-info { text-align: right; }");
        html.append(".invoice-details { background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 5px; }");
        html.append(".items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }");
        html.append(".items-table th { background: #e5e7eb; padding: 10px; text-align: left; }");
        html.append(".items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }");
        html.append(".total-row { font-weight: bold; font-size: 1.1em; }");
        html.append(".footer { margin-top: 40px; text-align: center; color: #666; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        
        // Header
        html.append("<div class=\"header\">");
        html.append("<table width=\"100%\">");
        html.append("<tr>");
        html.append("<td>");
        html.append("<h1>INVOICE</h1>");
        html.append("<p>Invoice #: ").append(order.getOrderId()).append("</p>");
        html.append("<p>Date: ").append(order.getCreatedAt().format(dateFormat)).append("</p>");
        html.append("</td>");
        html.append("<td class=\"company-info\">");
        html.append("<h2>urbandec</h2>");
        html.append("<p>Digital Frames Shop</p>");
        html.append("<p>support@urbandec.shop</p>");
        html.append("</td>");
        html.append("</tr>");
        html.append("</table>");
        html.append("</div>");
        
        // Billing Details
        html.append("<div class=\"invoice-details\">");
        html.append("<h3>Bill To:</h3>");
        html.append("<p><strong>").append(order.getCustomerName()).append("</strong></p>");
        html.append("<p>").append(order.getShippingAddress()).append("</p>");
        html.append("<p>").append(order.getCity()).append(", ").append(order.getState()).append(" - ").append(order.getPincode()).append("</p>");
        html.append("<p>Phone: ").append(order.getCustomerPhone()).append("</p>");
        html.append("<p>Email: ").append(order.getCustomerEmail()).append("</p>");
        html.append("</div>");
        
        // Payment Info
        if (order.getPaymentId() != null) {
            html.append("<div class=\"invoice-details\">");
            html.append("<h3>Payment Information:</h3>");
            html.append("<p>Payment ID: ").append(order.getPaymentId()).append("</p>");
            html.append("<p>Status: ").append(order.getStatus()).append("</p>");
            html.append("</div>");
        }
        
        // Items Table
        html.append("<h3>Order Details</h3>");
        html.append("<table class=\"items-table\">");
        html.append("<thead>");
        html.append("<tr>");
        html.append("<th>Item</th>");
        html.append("<th>Qty</th>");
        html.append("<th>Unit Price</th>");
        html.append("<th>Total</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");
        
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                html.append("<tr>");
                html.append("<td>").append(item.getProductName());
                if (item.getProductAttributes() != null && !item.getProductAttributes().isEmpty()) {
                    html.append("<br><small>").append(item.getProductAttributes()).append("</small>");
                }
                html.append("</td>");
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
        html.append("<tr>");
        html.append("<td colspan=\"3\" style=\"text-align: right;\">Shipping:</td>");
        html.append("<td>Free</td>");
        html.append("</tr>");
        html.append("<tr class=\"total-row\">");
        html.append("<td colspan=\"3\" style=\"text-align: right;\">Total Amount:</td>");
        html.append("<td>").append(currencyFormat.format(order.getTotalAmount())).append("</td>");
        html.append("</tr>");
        html.append("</tbody>");
        html.append("</table>");
        
        // Footer
        html.append("<div class=\"footer\">");
        html.append("<p>Thank you for your business!</p>");
        html.append("<p>This is a computer generated invoice and does not require a signature.</p>");
        html.append("</div>");
        
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
}