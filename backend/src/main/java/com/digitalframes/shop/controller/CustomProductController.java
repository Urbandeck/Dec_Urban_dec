package com.digitalframes.shop.controller;

import com.digitalframes.shop.entity.CustomProductRequest;
import com.digitalframes.shop.entity.CustomProductImage;
import com.digitalframes.shop.service.CustomProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/custom-products")
@CrossOrigin
public class CustomProductController {

    @Autowired
    private CustomProductService customProductService;

    // Temporary storage for custom product data pending payment
    private final Map<String, Map<String, Object>> temporaryStorage = new ConcurrentHashMap<>();

    // New endpoint for temporary upload (before payment)
    @PostMapping(value = "/temporary", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> uploadTemporary(
            @RequestParam("images") MultipartFile[] images,
            @RequestParam("frameSize") String frameSize,
            @RequestParam("frameColor") String frameColor,
            @RequestParam("quantity") Integer quantity,
            @RequestParam(value = "specialInstructions", required = false) String specialInstructions,
            @RequestParam(value = "customerName", required = false) String customerName,
            @RequestParam(value = "customerEmail", required = false) String customerEmail,
            @RequestParam(value = "customerPhone", required = false) String customerPhone,
            @RequestParam(value = "addressLine1", required = false) String addressLine1,
            @RequestParam(value = "addressLine2", required = false) String addressLine2,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "pincode", required = false) String pincode,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "totalAmount", required = false) String totalAmount) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Validate images
            if (images == null || images.length == 0) {
                response.put("success", false);
                response.put("message", "No images provided");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file sizes and types
            List<String> errors = new ArrayList<>();
            for (MultipartFile image : images) {
                if (image.getSize() > 10 * 1024 * 1024) { // 10MB limit
                    errors.add(image.getOriginalFilename() + " exceeds 10MB size limit");
                }
                if (!image.getContentType().startsWith("image/")) {
                    errors.add(image.getOriginalFilename() + " is not an image file");
                }
            }

            if (!errors.isEmpty()) {
                response.put("success", false);
                response.put("errors", errors);
                return ResponseEntity.badRequest().body(response);
            }

            // Generate temporary ID
            String tempId = UUID.randomUUID().toString();

            // Store data temporarily
            Map<String, Object> tempData = new HashMap<>();
            tempData.put("images", images);
            tempData.put("frameSize", frameSize);
            tempData.put("frameColor", frameColor);
            tempData.put("quantity", quantity);
            tempData.put("specialInstructions", specialInstructions);
            tempData.put("customerName", customerName);
            tempData.put("customerEmail", customerEmail);
            tempData.put("customerPhone", customerPhone);
            tempData.put("addressLine1", addressLine1);
            tempData.put("addressLine2", addressLine2);
            tempData.put("city", city);
            tempData.put("state", state);
            tempData.put("pincode", pincode);
            tempData.put("country", country);
            tempData.put("totalAmount", totalAmount);
            tempData.put("timestamp", System.currentTimeMillis());

            temporaryStorage.put(tempId, tempData);

            // Clean up old temporary data (older than 1 hour)
            cleanupOldTemporaryData();

            response.put("success", true);
            response.put("message", "Data uploaded temporarily");
            response.put("tempId", tempId);
            response.put("status", "PENDING_PAYMENT");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to process temporary upload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint to create actual product request after payment
    @PostMapping("/confirm-payment")
    public ResponseEntity<Map<String, Object>> confirmPaymentAndCreateRequest(
            @RequestParam("tempId") String tempId,
            @RequestParam("paymentId") String paymentId,
            @RequestParam("orderId") String orderId) {

        Map<String, Object> response = new HashMap<>();

        try {
            Map<String, Object> tempData = temporaryStorage.get(tempId);

            if (tempData == null) {
                response.put("success", false);
                response.put("message", "Temporary data not found or expired");
                return ResponseEntity.badRequest().body(response);
            }

            // Extract data from temporary storage
            MultipartFile[] images = (MultipartFile[]) tempData.get("images");
            String frameSize = (String) tempData.get("frameSize");
            String frameColor = (String) tempData.get("frameColor");
            Integer quantity = (Integer) tempData.get("quantity");
            String specialInstructions = (String) tempData.get("specialInstructions");
            String customerName = (String) tempData.get("customerName");
            String customerEmail = (String) tempData.get("customerEmail");
            String customerPhone = (String) tempData.get("customerPhone");
            String addressLine1 = (String) tempData.get("addressLine1");
            String addressLine2 = (String) tempData.get("addressLine2");
            String city = (String) tempData.get("city");
            String state = (String) tempData.get("state");
            String pincode = (String) tempData.get("pincode");
            String country = (String) tempData.get("country");
            String totalAmount = (String) tempData.get("totalAmount");

            // Create the actual product request
            CustomProductRequest request = customProductService.createCustomProductRequest(
                images,
                frameSize,
                frameColor,
                quantity,
                specialInstructions,
                customerName,
                customerEmail,
                customerPhone,
                addressLine1,
                addressLine2,
                city,
                state,
                pincode,
                country,
                totalAmount != null ? new java.math.BigDecimal(totalAmount) : null
            );

            // Update request with payment info
            request.setPaymentId(paymentId);
            request.setOrderId(orderId);
            request.setStatus("PAID");
            customProductService.updateRequest(request);

            // Remove temporary data
            temporaryStorage.remove(tempId);

            response.put("success", true);
            response.put("message", "Custom product request created successfully");
            response.put("requestId", request.getId());
            response.put("status", request.getStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create product request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private void cleanupOldTemporaryData() {
        long oneHourAgo = System.currentTimeMillis() - (60 * 60 * 1000);
        temporaryStorage.entrySet().removeIf(entry -> {
            Map<String, Object> data = entry.getValue();
            Long timestamp = (Long) data.get("timestamp");
            return timestamp != null && timestamp < oneHourAgo;
        });
    }

    // Original endpoint - now deprecated but kept for backward compatibility
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> createCustomProductRequest(
            @RequestParam("images") MultipartFile[] images,
            @RequestParam("frameSize") String frameSize,
            @RequestParam("frameColor") String frameColor,
            @RequestParam("quantity") Integer quantity,
            @RequestParam(value = "specialInstructions", required = false) String specialInstructions,
            @RequestParam(value = "customerName", required = false) String customerName,
            @RequestParam(value = "customerEmail", required = false) String customerEmail,
            @RequestParam(value = "customerPhone", required = false) String customerPhone,
            @RequestParam(value = "addressLine1", required = false) String addressLine1,
            @RequestParam(value = "addressLine2", required = false) String addressLine2,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "pincode", required = false) String pincode,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "totalAmount", required = false) String totalAmount) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Validate images
            if (images == null || images.length == 0) {
                response.put("success", false);
                response.put("message", "No images provided");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file sizes and types
            List<String> errors = new ArrayList<>();
            for (MultipartFile image : images) {
                if (image.getSize() > 10 * 1024 * 1024) { // 10MB limit
                    errors.add(image.getOriginalFilename() + " exceeds 10MB size limit");
                }
                if (!image.getContentType().startsWith("image/")) {
                    errors.add(image.getOriginalFilename() + " is not an image file");
                }
            }

            if (!errors.isEmpty()) {
                response.put("success", false);
                response.put("errors", errors);
                return ResponseEntity.badRequest().body(response);
            }

            // Create custom product request with all details
            CustomProductRequest request = customProductService.createCustomProductRequest(
                images,
                frameSize,
                frameColor,
                quantity,
                specialInstructions,
                customerName,
                customerEmail,
                customerPhone,
                addressLine1,
                addressLine2,
                city,
                state,
                pincode,
                country,
                totalAmount != null ? new java.math.BigDecimal(totalAmount) : null
            );

            response.put("success", true);
            response.put("message", "Custom product request created successfully");
            response.put("requestId", request.getId());
            response.put("status", request.getStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to process custom product request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/pending-count")
    public ResponseEntity<Map<String, Object>> getPendingRequestsCount() {
        long count = customProductService.getPendingRequestsCount();
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCustomRequests() {
        List<CustomProductRequest> requests = customProductService.getAllCustomRequests();
        List<Map<String, Object>> response = new ArrayList<>();

        for (CustomProductRequest request : requests) {
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("id", request.getId());
            requestData.put("frameSize", request.getFrameSize());
            requestData.put("frameColor", request.getFrameColor());
            requestData.put("quantity", request.getQuantity());
            requestData.put("specialInstructions", request.getSpecialInstructions());
            requestData.put("status", request.getStatus());
            requestData.put("adminNotes", request.getAdminNotes());
            requestData.put("customerEmail", request.getCustomerEmail());
            requestData.put("customerPhone", request.getCustomerPhone());
            requestData.put("createdAt", request.getCreatedAt());
            requestData.put("updatedAt", request.getUpdatedAt());

            // Convert images to base64
            List<Map<String, Object>> imagesList = new ArrayList<>();
            for (CustomProductImage image : request.getImages()) {
                Map<String, Object> imageData = new HashMap<>();
                imageData.put("id", image.getId());
                imageData.put("fileName", image.getFileName());
                imageData.put("mimeType", image.getMimeType());
                imageData.put("fileSize", image.getFileSize());
                imageData.put("displayOrder", image.getDisplayOrder());

                // Convert byte[] to Base64
                if (image.getImageData() != null) {
                    String base64Image = java.util.Base64.getEncoder().encodeToString(image.getImageData());
                    imageData.put("imageData", base64Image);
                }

                imagesList.add(imageData);
            }
            requestData.put("images", imagesList);

            response.add(requestData);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getCustomRequest(@PathVariable Long id) {
        return customProductService.getCustomRequest(id)
                .map(request -> {
                    Map<String, Object> requestData = new HashMap<>();
                    requestData.put("id", request.getId());
                    requestData.put("frameSize", request.getFrameSize());
                    requestData.put("frameColor", request.getFrameColor());
                    requestData.put("quantity", request.getQuantity());
                    requestData.put("specialInstructions", request.getSpecialInstructions());
                    requestData.put("status", request.getStatus());
                    requestData.put("adminNotes", request.getAdminNotes());
                    requestData.put("customerEmail", request.getCustomerEmail());
                    requestData.put("customerPhone", request.getCustomerPhone());
                    requestData.put("createdAt", request.getCreatedAt());
                    requestData.put("updatedAt", request.getUpdatedAt());

                    // Convert images to base64
                    List<Map<String, Object>> imagesList = new ArrayList<>();
                    for (CustomProductImage image : request.getImages()) {
                        Map<String, Object> imageData = new HashMap<>();
                        imageData.put("id", image.getId());
                        imageData.put("fileName", image.getFileName());
                        imageData.put("mimeType", image.getMimeType());
                        imageData.put("fileSize", image.getFileSize());
                        imageData.put("displayOrder", image.getDisplayOrder());

                        // Convert byte[] to Base64
                        if (image.getImageData() != null) {
                            String base64Image = java.util.Base64.getEncoder().encodeToString(image.getImageData());
                            imageData.put("imageData", base64Image);
                        }

                        imagesList.add(imageData);
                    }
                    requestData.put("images", imagesList);

                    return ResponseEntity.ok(requestData);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateRequestStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "notes", required = false) String notes) {

        Map<String, Object> response = new HashMap<>();

        try {
            CustomProductRequest request = customProductService.updateRequestStatus(id, status, notes);

            response.put("success", true);
            response.put("message", "Request status updated successfully");
            response.put("status", request.getStatus());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update request status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/image/{imageId}/download")
    public ResponseEntity<byte[]> downloadImage(@PathVariable Long imageId) {
        Optional<CustomProductImage> imageOpt = customProductService.getImageById(imageId);

        if (imageOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        CustomProductImage image = imageOpt.get();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(image.getMimeType()));
        headers.setContentDispositionFormData("attachment", image.getFileName());
        headers.setContentLength(image.getFileSize());

        return ResponseEntity.ok()
                .headers(headers)
                .body(image.getImageData());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCustomRequest(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            boolean deleted = customProductService.deleteCustomRequest(id);

            if (deleted) {
                response.put("success", true);
                response.put("message", "Custom product request deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Custom product request not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete custom product request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}