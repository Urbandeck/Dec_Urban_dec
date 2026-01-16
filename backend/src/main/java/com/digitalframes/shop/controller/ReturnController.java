package com.digitalframes.shop.controller;

import com.digitalframes.shop.dto.CreateReturnRequestDTO;
import com.digitalframes.shop.dto.ReturnRequestDTO;
import com.digitalframes.shop.entity.ReturnRequest.ReturnStatus;
import com.digitalframes.shop.service.ReturnService;
import com.digitalframes.shop.service.ReturnService.ReturnStats;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/returns")
@CrossOrigin(origins = "*")
public class ReturnController {

    private static final Logger logger = LoggerFactory.getLogger(ReturnController.class);

    @Autowired
    private ReturnService returnService;

    /**
     * Create a new return request
     */
    @PostMapping
    public ResponseEntity<?> createReturnRequest(
            @RequestBody CreateReturnRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String email = userDetails != null ? userDetails.getUsername() : null;
            ReturnRequestDTO result = returnService.createReturnRequest(request, email);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            logger.error("Failed to create return request", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if order is eligible for return
     */
    @GetMapping("/eligibility/{orderId}")
    public ResponseEntity<?> checkEligibility(@PathVariable String orderId) {
        try {
            boolean eligible = returnService.isEligibleForReturn(orderId);
            int remainingDays = returnService.getRemainingReturnDays(orderId);
            return ResponseEntity.ok(Map.of(
                    "eligible", eligible,
                    "remainingDays", remainingDays
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get return requests for current user
     */
    @GetMapping("/my-returns")
    public ResponseEntity<?> getMyReturns(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        List<ReturnRequestDTO> returns = returnService.getReturnRequestsByEmail(userDetails.getUsername());
        return ResponseEntity.ok(returns);
    }

    /**
     * Get return requests by email (for guest users)
     */
    @GetMapping
    public ResponseEntity<?> getReturnsByEmail(@RequestParam String email) {
        List<ReturnRequestDTO> returns = returnService.getReturnRequestsByEmail(email);
        return ResponseEntity.ok(returns);
    }

    /**
     * Get return requests for a specific order
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getReturnsByOrder(@PathVariable String orderId) {
        List<ReturnRequestDTO> returns = returnService.getReturnRequestsByOrderId(orderId);
        return ResponseEntity.ok(returns);
    }

    /**
     * Get return request by return ID
     */
    @GetMapping("/{returnId}")
    public ResponseEntity<?> getReturnRequest(@PathVariable String returnId) {
        try {
            ReturnRequestDTO result = returnService.getReturnRequestByReturnId(returnId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ========== Admin Endpoints ==========

    /**
     * Get all return requests (admin)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllReturns() {
        List<ReturnRequestDTO> returns = returnService.getAllReturnRequests();
        return ResponseEntity.ok(returns);
    }

    /**
     * Get pending return requests (admin)
     */
    @GetMapping("/admin/pending")
    public ResponseEntity<?> getPendingReturns() {
        List<ReturnRequestDTO> returns = returnService.getPendingReturnRequests();
        return ResponseEntity.ok(returns);
    }

    /**
     * Get return requests by status (admin)
     */
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<?> getReturnsByStatus(@PathVariable String status) {
        try {
            ReturnStatus returnStatus = ReturnStatus.valueOf(status.toUpperCase());
            List<ReturnRequestDTO> returns = returnService.getReturnRequestsByStatus(returnStatus);
            return ResponseEntity.ok(returns);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status: " + status));
        }
    }

    /**
     * Get return statistics (admin dashboard)
     */
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getReturnStats() {
        ReturnStats stats = returnService.getReturnStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Update return status (admin)
     */
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> updateReturnStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String statusStr = body.get("status");
            String notes = body.get("notes");

            if (statusStr == null || statusStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            ReturnStatus newStatus = ReturnStatus.valueOf(statusStr.toUpperCase());
            ReturnRequestDTO result = returnService.updateReturnStatus(id, newStatus, notes);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Approve return request (admin)
     */
    @PutMapping("/admin/{id}/approve")
    public ResponseEntity<?> approveReturn(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String notes = body != null ? body.get("notes") : null;
            ReturnRequestDTO result = returnService.approveReturn(id, notes);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reject return request (admin)
     */
    @PutMapping("/admin/{id}/reject")
    public ResponseEntity<?> rejectReturn(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String reason = body.get("reason");
            if (reason == null || reason.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Rejection reason is required"));
            }
            ReturnRequestDTO result = returnService.rejectReturn(id, reason);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
