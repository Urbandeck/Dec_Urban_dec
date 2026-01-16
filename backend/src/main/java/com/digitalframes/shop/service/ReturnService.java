package com.digitalframes.shop.service;

import com.digitalframes.shop.dto.CreateReturnRequestDTO;
import com.digitalframes.shop.dto.ReturnRequestDTO;
import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.entity.CustomerOrderItem;
import com.digitalframes.shop.entity.ReturnRequest;
import com.digitalframes.shop.entity.ReturnRequest.ReturnStatus;
import com.digitalframes.shop.repository.CustomerOrderRepository;
import com.digitalframes.shop.repository.ReturnRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReturnService {

    private static final Logger logger = LoggerFactory.getLogger(ReturnService.class);
    private static final int RETURN_WINDOW_DAYS = 7;

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Check if an order is eligible for return
     */
    public boolean isEligibleForReturn(String orderId) {
        Optional<CustomerOrder> orderOpt = customerOrderRepository.findByOrderId(orderId);
        if (orderOpt.isEmpty()) {
            return false;
        }

        CustomerOrder order = orderOpt.get();

        // Must be delivered
        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            return false;
        }

        // Check if within return window (7 days from order creation for now)
        // In production, you'd track actual delivery date
        LocalDateTime orderDate = order.getCreatedAt();
        long daysSinceOrder = ChronoUnit.DAYS.between(orderDate, LocalDateTime.now());

        return daysSinceOrder <= RETURN_WINDOW_DAYS;
    }

    /**
     * Get remaining days for return eligibility
     */
    public int getRemainingReturnDays(String orderId) {
        Optional<CustomerOrder> orderOpt = customerOrderRepository.findByOrderId(orderId);
        if (orderOpt.isEmpty()) {
            return 0;
        }

        CustomerOrder order = orderOpt.get();
        LocalDateTime orderDate = order.getCreatedAt();
        long daysSinceOrder = ChronoUnit.DAYS.between(orderDate, LocalDateTime.now());
        int remaining = RETURN_WINDOW_DAYS - (int) daysSinceOrder;

        return Math.max(0, remaining);
    }

    /**
     * Create a new return request
     */
    @Transactional
    public ReturnRequestDTO createReturnRequest(CreateReturnRequestDTO request, String customerEmail) {
        // Find the order
        CustomerOrder order = customerOrderRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));

        // Check eligibility
        if (!isEligibleForReturn(request.getOrderId())) {
            throw new RuntimeException("Order is not eligible for return. Return window may have expired.");
        }

        // Check if custom product (not returnable)
        if (request.getProductId() == null || request.getProductId() == 0) {
            throw new RuntimeException("Custom products are not eligible for return.");
        }

        // Check if already requested return for this product
        if (returnRequestRepository.existsByOrderIdAndProductId(order.getId(), request.getProductId())) {
            throw new RuntimeException("Return already requested for this product.");
        }

        // Find the product in order items to get price
        BigDecimal refundAmount = BigDecimal.ZERO;
        String productImage = null;
        for (CustomerOrderItem item : order.getItems()) {
            if (item.getProductId() != null && item.getProductId().equals(request.getProductId())) {
                double price = item.getPrice() != null ? item.getPrice() : 0.0;
                int qty = request.getQuantity() != null ? request.getQuantity() : 1;
                refundAmount = BigDecimal.valueOf(price * qty);
                productImage = item.getImageUrl();
                break;
            }
        }

        // Create return request
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setCustomerEmail(customerEmail != null ? customerEmail : order.getCustomerEmail());
        returnRequest.setCustomerName(order.getCustomerName());
        returnRequest.setCustomerPhone(order.getCustomerPhone());
        returnRequest.setProductId(request.getProductId());
        returnRequest.setProductName(request.getProductName());
        returnRequest.setQuantity(request.getQuantity() != null ? request.getQuantity() : 1);
        returnRequest.setReason(request.getReason());
        returnRequest.setReasonDetails(request.getReasonDetails());
        returnRequest.setRefundAmount(refundAmount);
        returnRequest.setPickupAddress(buildPickupAddress(order));
        returnRequest.setStatus(ReturnStatus.REQUESTED);

        ReturnRequest saved = returnRequestRepository.save(returnRequest);
        logger.info("Return request created: {} for order: {}", saved.getReturnId(), order.getOrderId());

        // Send confirmation email
        try {
            sendReturnRequestEmail(saved, order);
        } catch (Exception e) {
            logger.error("Failed to send return request email", e);
        }

        return convertToDTO(saved, productImage);
    }

    /**
     * Get return requests for a customer
     */
    public List<ReturnRequestDTO> getReturnRequestsByEmail(String email) {
        return returnRequestRepository.findByCustomerEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(r -> convertToDTO(r, null))
                .collect(Collectors.toList());
    }

    /**
     * Get return requests for an order
     */
    public List<ReturnRequestDTO> getReturnRequestsByOrderId(String orderId) {
        return returnRequestRepository.findByOrderOrderId(orderId)
                .stream()
                .map(r -> convertToDTO(r, null))
                .collect(Collectors.toList());
    }

    /**
     * Get all return requests (for admin)
     */
    public List<ReturnRequestDTO> getAllReturnRequests() {
        return returnRequestRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(r -> convertToDTO(r, null))
                .collect(Collectors.toList());
    }

    /**
     * Get return requests by status (for admin)
     */
    public List<ReturnRequestDTO> getReturnRequestsByStatus(ReturnStatus status) {
        return returnRequestRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(r -> convertToDTO(r, null))
                .collect(Collectors.toList());
    }

    /**
     * Get pending return requests (for admin dashboard)
     */
    public List<ReturnRequestDTO> getPendingReturnRequests() {
        List<ReturnStatus> pendingStatuses = List.of(
                ReturnStatus.REQUESTED,
                ReturnStatus.APPROVED,
                ReturnStatus.PICKUP_SCHEDULED,
                ReturnStatus.PICKED_UP,
                ReturnStatus.RECEIVED,
                ReturnStatus.REFUND_INITIATED
        );
        return returnRequestRepository.findByStatusInOrderByCreatedAtDesc(pendingStatuses)
                .stream()
                .map(r -> convertToDTO(r, null))
                .collect(Collectors.toList());
    }

    /**
     * Get return request by ID
     */
    public ReturnRequestDTO getReturnRequestById(Long id) {
        return returnRequestRepository.findById(id)
                .map(r -> convertToDTO(r, null))
                .orElseThrow(() -> new RuntimeException("Return request not found"));
    }

    /**
     * Get return request by return ID
     */
    public ReturnRequestDTO getReturnRequestByReturnId(String returnId) {
        return returnRequestRepository.findByReturnId(returnId)
                .map(r -> convertToDTO(r, null))
                .orElseThrow(() -> new RuntimeException("Return request not found"));
    }

    /**
     * Update return request status (admin action)
     */
    @Transactional
    public ReturnRequestDTO updateReturnStatus(Long id, ReturnStatus newStatus, String adminNotes) {
        ReturnRequest returnRequest = returnRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Return request not found"));

        ReturnStatus oldStatus = returnRequest.getStatus();
        returnRequest.setStatus(newStatus);

        if (adminNotes != null && !adminNotes.isEmpty()) {
            String existingNotes = returnRequest.getAdminNotes();
            String timestamp = LocalDateTime.now().toString();
            String newNote = "[" + timestamp + "] " + adminNotes;
            returnRequest.setAdminNotes(existingNotes != null ? existingNotes + "\n" + newNote : newNote);
        }

        // Mark as resolved if final status
        if (newStatus == ReturnStatus.REFUNDED || newStatus == ReturnStatus.REJECTED || newStatus == ReturnStatus.CLOSED) {
            returnRequest.setResolvedAt(LocalDateTime.now());
        }

        ReturnRequest saved = returnRequestRepository.save(returnRequest);
        logger.info("Return request {} status updated from {} to {}", saved.getReturnId(), oldStatus, newStatus);

        // Send status update email to customer
        try {
            sendStatusUpdateEmail(saved, oldStatus, newStatus);
        } catch (Exception e) {
            logger.error("Failed to send status update email", e);
        }

        return convertToDTO(saved, null);
    }

    /**
     * Approve return request
     */
    @Transactional
    public ReturnRequestDTO approveReturn(Long id, String adminNotes) {
        return updateReturnStatus(id, ReturnStatus.APPROVED, adminNotes);
    }

    /**
     * Reject return request
     */
    @Transactional
    public ReturnRequestDTO rejectReturn(Long id, String reason) {
        return updateReturnStatus(id, ReturnStatus.REJECTED, reason);
    }

    /**
     * Get return statistics (for admin dashboard)
     */
    public ReturnStats getReturnStats() {
        ReturnStats stats = new ReturnStats();
        stats.setPending(returnRequestRepository.countByStatus(ReturnStatus.REQUESTED));
        stats.setApproved(returnRequestRepository.countByStatus(ReturnStatus.APPROVED));
        stats.setInProgress(
                returnRequestRepository.countByStatus(ReturnStatus.PICKUP_SCHEDULED) +
                        returnRequestRepository.countByStatus(ReturnStatus.PICKED_UP) +
                        returnRequestRepository.countByStatus(ReturnStatus.RECEIVED) +
                        returnRequestRepository.countByStatus(ReturnStatus.REFUND_INITIATED)
        );
        stats.setCompleted(returnRequestRepository.countByStatus(ReturnStatus.REFUNDED));
        stats.setRejected(returnRequestRepository.countByStatus(ReturnStatus.REJECTED));
        stats.setTotal(returnRequestRepository.count());
        return stats;
    }

    // Helper methods

    private String buildPickupAddress(CustomerOrder order) {
        StringBuilder sb = new StringBuilder();
        sb.append(order.getCustomerName()).append("\n");
        sb.append(order.getShippingAddress()).append("\n");
        sb.append(order.getCity()).append(", ").append(order.getState()).append(" ").append(order.getPincode()).append("\n");
        sb.append("Phone: ").append(order.getCustomerPhone());
        return sb.toString();
    }

    private ReturnRequestDTO convertToDTO(ReturnRequest entity, String productImage) {
        ReturnRequestDTO dto = new ReturnRequestDTO();
        dto.setId(entity.getId());
        dto.setReturnId(entity.getReturnId());
        dto.setOrderId(entity.getOrder().getOrderId());
        dto.setCustomerEmail(entity.getCustomerEmail());
        dto.setCustomerName(entity.getCustomerName());
        dto.setCustomerPhone(entity.getCustomerPhone());
        dto.setStatus(entity.getStatus());
        dto.setReason(entity.getReason());
        dto.setReasonDescription(entity.getReason() != null ? entity.getReason().getDescription() : null);
        dto.setReasonDetails(entity.getReasonDetails());
        dto.setProductId(entity.getProductId());
        dto.setProductName(entity.getProductName());
        dto.setProductImage(productImage);
        dto.setQuantity(entity.getQuantity());
        dto.setRefundAmount(entity.getRefundAmount());
        dto.setAdminNotes(entity.getAdminNotes());
        dto.setPickupAddress(entity.getPickupAddress());
        dto.setPickupScheduledDate(entity.getPickupScheduledDate());
        dto.setRefundTransactionId(entity.getRefundTransactionId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setResolvedAt(entity.getResolvedAt());
        return dto;
    }

    private void sendReturnRequestEmail(ReturnRequest returnRequest, CustomerOrder order) {
        String subject = "Return Request Received - " + returnRequest.getReturnId();
        String body = String.format(
                "Dear %s,\n\n" +
                        "We have received your return request for order %s.\n\n" +
                        "Return ID: %s\n" +
                        "Product: %s\n" +
                        "Reason: %s\n\n" +
                        "Our team will review your request and get back to you within 24-48 hours.\n\n" +
                        "Thank you for shopping with UrbanDec!\n\n" +
                        "Best regards,\n" +
                        "UrbanDec Team",
                returnRequest.getCustomerName(),
                order.getOrderId(),
                returnRequest.getReturnId(),
                returnRequest.getProductName(),
                returnRequest.getReason().getDescription()
        );
        emailService.sendEmail(returnRequest.getCustomerEmail(), subject, body);
    }

    private void sendStatusUpdateEmail(ReturnRequest returnRequest, ReturnStatus oldStatus, ReturnStatus newStatus) {
        String subject = "Return Request Update - " + returnRequest.getReturnId();
        String statusMessage = getStatusMessage(newStatus);
        String body = String.format(
                "Dear %s,\n\n" +
                        "Your return request %s has been updated.\n\n" +
                        "Product: %s\n" +
                        "Status: %s\n\n" +
                        "%s\n\n" +
                        "Thank you for your patience!\n\n" +
                        "Best regards,\n" +
                        "UrbanDec Team",
                returnRequest.getCustomerName(),
                returnRequest.getReturnId(),
                returnRequest.getProductName(),
                newStatus.name().replace("_", " "),
                statusMessage
        );
        emailService.sendEmail(returnRequest.getCustomerEmail(), subject, body);
    }

    private String getStatusMessage(ReturnStatus status) {
        return switch (status) {
            case APPROVED -> "Your return has been approved. We will schedule a pickup soon.";
            case REJECTED -> "Unfortunately, your return request has been rejected. Please contact support for more details.";
            case PICKUP_SCHEDULED -> "A pickup has been scheduled for your return. Please keep the product ready.";
            case PICKED_UP -> "Your product has been picked up successfully.";
            case RECEIVED -> "We have received your returned product and are inspecting it.";
            case REFUND_INITIATED -> "Your refund has been initiated. It may take 5-7 business days to reflect in your account.";
            case REFUNDED -> "Your refund has been processed successfully.";
            case CLOSED -> "Your return case has been closed.";
            default -> "Your return request status has been updated.";
        };
    }

    // Stats class
    public static class ReturnStats {
        private long pending;
        private long approved;
        private long inProgress;
        private long completed;
        private long rejected;
        private long total;

        // Getters and Setters
        public long getPending() { return pending; }
        public void setPending(long pending) { this.pending = pending; }
        public long getApproved() { return approved; }
        public void setApproved(long approved) { this.approved = approved; }
        public long getInProgress() { return inProgress; }
        public void setInProgress(long inProgress) { this.inProgress = inProgress; }
        public long getCompleted() { return completed; }
        public void setCompleted(long completed) { this.completed = completed; }
        public long getRejected() { return rejected; }
        public void setRejected(long rejected) { this.rejected = rejected; }
        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
    }
}
