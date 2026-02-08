package com.digitalframes.shop.service;

import com.digitalframes.shop.entity.CustomProductRequest;
import com.digitalframes.shop.entity.CustomProductImage;
import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.repository.CustomProductRepository;
import com.digitalframes.shop.repository.CustomProductImageRepository;
import com.digitalframes.shop.repository.CustomerOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomProductService {

    private static final Logger logger = LoggerFactory.getLogger(CustomProductService.class);

    @Autowired
    private CustomProductRepository customProductRepository;

    @Autowired
    private CustomProductImageRepository customProductImageRepository;

    @Autowired
    private CustomerOrderRepository customerOrderRepository;

    @Autowired
    private ShiprocketService shiprocketService;

    @Transactional
    public CustomProductRequest createCustomProductRequest(
            MultipartFile[] images,
            String frameSize,
            String frameColor,
            Integer quantity,
            String specialInstructions,
            String customerName,
            String customerEmail,
            String customerPhone,
            String addressLine1,
            String addressLine2,
            String city,
            String state,
            String pincode,
            String country,
            java.math.BigDecimal totalAmount) throws IOException {

        // Create the custom product request
        CustomProductRequest request = new CustomProductRequest();
        request.setFrameSize(frameSize);
        request.setFrameColor(frameColor);
        request.setQuantity(quantity);
        request.setSpecialInstructions(specialInstructions);

        // Set customer information
        request.setCustomerName(customerName);
        request.setCustomerEmail(customerEmail);
        request.setCustomerPhone(customerPhone);

        // Set delivery address
        request.setAddressLine1(addressLine1);
        request.setAddressLine2(addressLine2);
        request.setCity(city);
        request.setState(state);
        request.setPincode(pincode);
        request.setCountry(country);

        // Set payment information
        request.setTotalAmount(totalAmount);
        request.setPaymentStatus("pending");

        request.setStatus("pending");
        request.setCreatedAt(LocalDateTime.now());

        // Save the request first
        request = customProductRepository.save(request);

        // Process and save images
        int displayOrder = 0;
        for (MultipartFile imageFile : images) {
            CustomProductImage image = new CustomProductImage();
            image.setFileName(imageFile.getOriginalFilename());
            image.setMimeType(imageFile.getContentType());
            image.setFileSize(imageFile.getSize());
            image.setImageData(imageFile.getBytes());
            image.setFilePath("custom-products/" + request.getId() + "/" + imageFile.getOriginalFilename());
            image.setDisplayOrder(displayOrder++);
            image.setCustomProductRequest(request);

            customProductImageRepository.save(image);
            request.getImages().add(image);
        }

        return request;
    }

    public List<CustomProductRequest> getAllCustomRequests() {
        return customProductRepository.findAll();
    }

    public Optional<CustomProductRequest> getCustomRequest(Long id) {
        return customProductRepository.findById(id);
    }

    @Transactional
    public CustomProductRequest updateRequestStatus(Long id, String status, String notes) {
        CustomProductRequest request = customProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom product request not found"));

        String oldStatus = request.getStatus();
        request.setStatus(status);
        if (notes != null) {
            request.setAdminNotes(notes);
        }
        request.setUpdatedAt(LocalDateTime.now());

        // Auto-create Shiprocket order when status changes to "shipped"
        if ("shipped".equalsIgnoreCase(status) && !"shipped".equalsIgnoreCase(oldStatus)) {
            logger.info("Status changed to shipped for custom product {}. Creating Shiprocket order...", id);

            try {
                Map<String, Object> shiprocketResponse = shiprocketService.createShiprocketOrderForCustomProduct(request);

                if (shiprocketResponse != null && shiprocketResponse.containsKey("order_id")) {
                    // Extract Shiprocket IDs from response
                    String shiprocketOrderId = shiprocketResponse.get("order_id").toString();
                    String shiprocketShipmentId = shiprocketResponse.get("shipment_id") != null
                        ? shiprocketResponse.get("shipment_id").toString() : null;

                    // Update request with Shiprocket details
                    request.setShiprocketOrderId(shiprocketOrderId);
                    request.setShiprocketShipmentId(shiprocketShipmentId);
                    request.setShiprocketStatus("NEW");
                    request.setStatus("shipped"); // Set to shipped when order is created in Shiprocket

                    logger.info("Shiprocket order created successfully. Order ID: {}, Shipment ID: {}",
                        shiprocketOrderId, shiprocketShipmentId);
                } else {
                    logger.error("Failed to create Shiprocket order. Response: {}", shiprocketResponse);
                    // Revert to processing if Shiprocket creation fails
                    request.setStatus("processing");
                    if (notes != null) {
                        request.setAdminNotes(notes + " | Shiprocket order creation failed");
                    } else {
                        request.setAdminNotes("Shiprocket order creation failed");
                    }
                }
            } catch (Exception e) {
                logger.error("Error creating Shiprocket order for custom product {}: {}", id, e.getMessage(), e);
                // Revert to processing if there's an error
                request.setStatus("processing");
                if (notes != null) {
                    request.setAdminNotes(notes + " | Shiprocket error: " + e.getMessage());
                } else {
                    request.setAdminNotes("Shiprocket error: " + e.getMessage());
                }
            }
        }

        // Auto-cancel Shiprocket order when status changes to "cancelled"
        if ("cancelled".equalsIgnoreCase(status) && !"cancelled".equalsIgnoreCase(oldStatus)) {
            if (request.getShiprocketOrderId() != null) {
                logger.info("Status changed to cancelled for custom product {}. Cancelling Shiprocket order...", id);

                try {
                    Map<String, Object> cancelResponse;

                    // Try to cancel by AWB first if available, otherwise by order ID
                    if (request.getAwbNumber() != null && !request.getAwbNumber().isEmpty()) {
                        logger.info("Cancelling Shiprocket order by AWB: {}", request.getAwbNumber());
                        cancelResponse = shiprocketService.cancelShipment(request.getAwbNumber());
                    } else {
                        logger.info("Cancelling Shiprocket order by Order ID: {}", request.getShiprocketOrderId());
                        cancelResponse = shiprocketService.cancelOrderById(request.getShiprocketOrderId());
                    }

                    if (cancelResponse != null && !cancelResponse.containsKey("error")) {
                        request.setShiprocketStatus("CANCELLED");
                        logger.info("Shiprocket order cancelled successfully for custom product {}", id);
                        if (notes != null) {
                            request.setAdminNotes(notes + " | Shiprocket order cancelled");
                        } else {
                            request.setAdminNotes("Shiprocket order cancelled");
                        }
                    } else {
                        logger.warn("Failed to cancel Shiprocket order. Response: {}", cancelResponse);
                        // Still proceed with local cancellation, but add note
                        if (notes != null) {
                            request.setAdminNotes(notes + " | Warning: Shiprocket cancellation may have failed");
                        } else {
                            request.setAdminNotes("Warning: Shiprocket cancellation may have failed");
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error cancelling Shiprocket order for custom product {}: {}", id, e.getMessage(), e);
                    // Still proceed with local cancellation, but add note
                    if (notes != null) {
                        request.setAdminNotes(notes + " | Shiprocket cancel error: " + e.getMessage());
                    } else {
                        request.setAdminNotes("Shiprocket cancel error: " + e.getMessage());
                    }
                }
            } else {
                logger.info("No Shiprocket order to cancel for custom product {}", id);
            }
        }

        // Sync status with associated CustomerOrder
        if (request.getCustomerOrderId() != null) {
            try {
                Optional<CustomerOrder> customerOrderOpt = customerOrderRepository.findByOrderId(request.getCustomerOrderId());
                if (customerOrderOpt.isPresent()) {
                    CustomerOrder customerOrder = customerOrderOpt.get();
                    customerOrder.setStatus(request.getStatus().toUpperCase());
                    customerOrderRepository.save(customerOrder);
                    logger.info("Synced status '{}' to CustomerOrder {}", request.getStatus(), request.getCustomerOrderId());
                }
            } catch (Exception e) {
                logger.error("Failed to sync status with CustomerOrder: {}", e.getMessage());
            }
        }

        return customProductRepository.save(request);
    }

    public List<CustomProductRequest> getRequestsByStatus(String status) {
        return customProductRepository.findByStatus(status);
    }

    public List<CustomProductRequest> getRecentRequests(int limit) {
        return customProductRepository.findTopNByOrderByCreatedAtDesc(limit);
    }

    @Transactional
    public boolean deleteCustomRequest(Long id) {
        if (customProductRepository.existsById(id)) {
            customProductRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<CustomProductImage> getImageById(Long imageId) {
        return customProductImageRepository.findById(imageId);
    }

    public long getPendingRequestsCount() {
        return customProductRepository.countByStatus("pending");
    }

    @Transactional
    public CustomProductRequest updateRequest(CustomProductRequest request) {
        request.setUpdatedAt(LocalDateTime.now());
        return customProductRepository.save(request);
    }

    @Transactional
    public CustomProductRequest syncShiprocketStatus(Long customProductId) {
        CustomProductRequest request = customProductRepository.findById(customProductId)
                .orElseThrow(() -> new RuntimeException("Custom product request not found"));

        if (request.getShiprocketOrderId() == null) {
            throw new RuntimeException("No Shiprocket order associated with this request");
        }

        try {
            String shiprocketOrderId = request.getShiprocketOrderId();

            // If AWB number exists, use it to track shipment
            if (request.getAwbNumber() != null && !request.getAwbNumber().isEmpty()) {
                Map<String, Object> trackingResponse = shiprocketService.trackShipment(request.getAwbNumber());

                if (trackingResponse != null && trackingResponse.containsKey("tracking_data")) {
                    Map<String, Object> trackingData = (Map<String, Object>) trackingResponse.get("tracking_data");

                    if (trackingData != null) {
                        // Update shipment status
                        if (trackingData.containsKey("shipment_status")) {
                            String shipmentStatus = trackingData.get("shipment_status").toString();
                            request.setShiprocketStatus(shipmentStatus);

                            // Map Shiprocket status to our status
                            String mappedStatus = mapShiprocketStatusToCustomStatus(shipmentStatus);
                            request.setStatus(mappedStatus);
                        }

                        // Update courier name if available
                        if (trackingData.containsKey("courier_name")) {
                            request.setCourierName(trackingData.get("courier_name").toString());
                        }

                        // Update tracking URL if available
                        if (trackingData.containsKey("track_url")) {
                            request.setTrackingUrl(trackingData.get("track_url").toString());
                        }
                    }
                }
            } else {
                // AWB not available yet, fetch order details from Shiprocket
                logger.info("AWB not available, fetching order details for Shiprocket Order ID: {}", shiprocketOrderId);
                Map<String, Object> orderDetails = shiprocketService.getOrderDetails(shiprocketOrderId);

                if (orderDetails != null && !orderDetails.containsKey("error")) {
                    // Extract data from order details response
                    Map<String, Object> data = (Map<String, Object>) orderDetails.get("data");
                    if (data != null) {
                        // Get order status
                        if (data.containsKey("status")) {
                            String status = data.get("status").toString();
                            request.setShiprocketStatus(status);
                            logger.info("Updated Shiprocket status to: {}", status);
                        }

                        // Get AWB if assigned
                        if (data.containsKey("awb_code") && data.get("awb_code") != null) {
                            String awb = data.get("awb_code").toString();
                            if (!awb.isEmpty() && !"null".equals(awb)) {
                                request.setAwbNumber(awb);
                                logger.info("Updated AWB to: {}", awb);
                            }
                        }

                        // Get courier name
                        if (data.containsKey("courier_name") && data.get("courier_name") != null) {
                            String courier = data.get("courier_name").toString();
                            if (!courier.isEmpty() && !"null".equals(courier)) {
                                request.setCourierName(courier);
                            }
                        }

                        // Check shipments array for more details
                        if (data.containsKey("shipments")) {
                            java.util.List<Map<String, Object>> shipments = (java.util.List<Map<String, Object>>) data.get("shipments");
                            if (shipments != null && !shipments.isEmpty()) {
                                Map<String, Object> shipment = shipments.get(0);

                                // Get AWB from shipment if not already set
                                if (request.getAwbNumber() == null && shipment.containsKey("awb")) {
                                    Object awbObj = shipment.get("awb");
                                    if (awbObj != null && !awbObj.toString().isEmpty()) {
                                        request.setAwbNumber(awbObj.toString());
                                        logger.info("Updated AWB from shipment: {}", awbObj);
                                    }
                                }

                                // Get courier from shipment
                                if (shipment.containsKey("courier_name") && shipment.get("courier_name") != null) {
                                    request.setCourierName(shipment.get("courier_name").toString());
                                }

                                // Get status from shipment
                                if (shipment.containsKey("status")) {
                                    String shipmentStatus = shipment.get("status").toString();
                                    request.setShiprocketStatus(shipmentStatus);
                                    request.setStatus(mapShiprocketStatusToCustomStatus(shipmentStatus));
                                }
                            }
                        }
                    }
                } else {
                    logger.warn("Failed to get order details from Shiprocket: {}", orderDetails);
                    throw new RuntimeException("Failed to fetch order details from Shiprocket");
                }
            }

            request.setUpdatedAt(LocalDateTime.now());

            // Sync status with linked CustomerOrder
            if (request.getCustomerOrderId() != null) {
                try {
                    Optional<CustomerOrder> customerOrderOpt = customerOrderRepository.findByOrderId(request.getCustomerOrderId());
                    if (customerOrderOpt.isPresent()) {
                        CustomerOrder customerOrder = customerOrderOpt.get();
                        customerOrder.setStatus(request.getStatus().toUpperCase());
                        if (request.getAwbNumber() != null) {
                            customerOrder.setAwbNumber(request.getAwbNumber());
                        }
                        if (request.getCourierName() != null) {
                            customerOrder.setCourierName(request.getCourierName());
                        }
                        customerOrderRepository.save(customerOrder);
                        logger.info("Synced status '{}' to CustomerOrder {}", request.getStatus(), request.getCustomerOrderId());
                    }
                } catch (Exception e) {
                    logger.error("Failed to sync status with CustomerOrder: {}", e.getMessage());
                }
            }

            return customProductRepository.save(request);

        } catch (Exception e) {
            logger.error("Error syncing Shiprocket status for custom product {}: {}", customProductId, e.getMessage(), e);
            throw new RuntimeException("Failed to sync Shiprocket status: " + e.getMessage(), e);
        }
    }

    private String mapShiprocketStatusToCustomStatus(String shiprocketStatus) {
        if (shiprocketStatus == null) return "shipped";

        switch (shiprocketStatus.toUpperCase()) {
            case "DELIVERED":
                return "delivered";
            case "CANCELLED":
                return "cancelled";
            default:
                // All other statuses (NEW, PICKUP_SCHEDULED, IN_TRANSIT, OUT_FOR_DELIVERY, etc.) map to "shipped"
                return "shipped";
        }
    }
}