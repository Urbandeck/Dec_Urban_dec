package com.digitalframes.shop.service;

import com.digitalframes.shop.dto.*;
import com.digitalframes.shop.entity.Order;
import com.digitalframes.shop.entity.OrderItem;
import com.digitalframes.shop.entity.Address;
import com.digitalframes.shop.entity.Payment;
import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.entity.CustomProductRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShiprocketService {

    private static final Logger logger = LoggerFactory.getLogger(ShiprocketService.class);

    @Value("${shiprocket.email:}")
    private String shiprocketEmail;

    @Value("${shiprocket.password:}")
    private String shiprocketPassword;

    @Value("${shiprocket.api.base-url:https://apiv2.shiprocket.in/v1/external}")
    private String apiBaseUrl;

    @Value("${shiprocket.pickup-location:Primary}")
    private String defaultPickupLocation;

    @Value("${shiprocket.channel-id:}")
    private String channelId;

    @Autowired
    private ShiprocketServiceAdapter adapter;

    private String authToken;
    private RestTemplate restTemplate = new RestTemplate();
    private ObjectMapper objectMapper = new ObjectMapper();

    public String authenticateAndGetToken() {
        try {
            logger.info("Attempting to authenticate with Shiprocket using email: " + shiprocketEmail);
            if (shiprocketEmail.isEmpty() || shiprocketPassword.isEmpty()) {
                logger.error("Shiprocket credentials not configured");
                return null;
            }

            String authUrl = apiBaseUrl + "/auth/login";

            ShiprocketAuthRequest authRequest = new ShiprocketAuthRequest(shiprocketEmail, shiprocketPassword);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<ShiprocketAuthRequest> request = new HttpEntity<>(authRequest, headers);

            ResponseEntity<ShiprocketAuthResponse> response = restTemplate.exchange(
                authUrl,
                HttpMethod.POST,
                request,
                ShiprocketAuthResponse.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                authToken = response.getBody().getToken();
                logger.info("Successfully authenticated with Shiprocket");
                return authToken;
            }
        } catch (Exception e) {
            logger.error("Failed to authenticate with Shiprocket: " + e.getMessage(), e);
        }
        return null;
    }

    // Method for CustomerOrder
    public Map<String, Object> createShiprocketOrder(CustomerOrder order) {
        try {
            logger.info("Starting Shiprocket order creation for order: {}", order.getOrderId());
            logger.info("Shiprocket config - Email: {}, Channel ID: {}, Pickup Location: {}",
                shiprocketEmail, channelId, defaultPickupLocation);

            if (authToken == null) {
                logger.info("Auth token is null, attempting authentication...");
                authToken = authenticateAndGetToken();
            }

            if (authToken == null) {
                logger.error("Failed to get auth token - check Shiprocket credentials");
                return createErrorResponse("Authentication failed");
            }

            logger.info("Auth token obtained, converting order to Shiprocket format...");
            ShiprocketOrderRequest shiprocketOrder = adapter.convertCustomerOrderToShiprocketOrder(
                order, defaultPickupLocation, channelId);

            // Log the request being sent
            logger.info("Shiprocket order request: {}", objectMapper.writeValueAsString(shiprocketOrder));

            String createOrderUrl = apiBaseUrl + "/orders/create/adhoc";
            logger.info("Sending request to: {}", createOrderUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(authToken);

            HttpEntity<ShiprocketOrderRequest> request = new HttpEntity<>(shiprocketOrder, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                createOrderUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                logger.info("Shiprocket order created successfully for order ID: {}", order.getOrderId());
                logger.info("Shiprocket response: {}", response.getBody());
                return response.getBody();
            } else {
                logger.error("Shiprocket API returned status: {}, body: {}",
                    response.getStatusCode(), response.getBody());
            }

        } catch (Exception e) {
            logger.error("Failed to create Shiprocket order for order {}: {}",
                order.getOrderId(), e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }

        return createErrorResponse("Failed to create order in Shiprocket");
    }

    // Original method for Order entity (for backward compatibility)
    public Map<String, Object> createShiprocketOrder(Order order) {
        try {
            if (authToken == null) {
                authToken = authenticateAndGetToken();
            }

            if (authToken == null) {
                logger.error("Failed to get auth token");
                return createErrorResponse("Authentication failed");
            }

            ShiprocketOrderRequest shiprocketOrder = convertToShiprocketOrder(order);

            String createOrderUrl = apiBaseUrl + "/orders/create/adhoc";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(authToken);

            HttpEntity<ShiprocketOrderRequest> request = new HttpEntity<>(shiprocketOrder, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                createOrderUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                logger.info("Shiprocket order created successfully for order ID: {}", order.getOrderNumber());
                logger.info("Shiprocket response: {}", response.getBody());
                return response.getBody();
            } else {
                logger.error("Shiprocket API returned status: {}, body: {}",
                    response.getStatusCode(), response.getBody());
            }

        } catch (Exception e) {
            logger.error("Failed to create Shiprocket order for order {}: {}",
                order.getOrderNumber(), e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }

        return createErrorResponse("Failed to create order in Shiprocket");
    }

    public Map<String, Object> generateAWB(String shipmentId) {
        try {
            if (authToken == null) {
                authToken = authenticateAndGetToken();
            }

            String awbUrl = apiBaseUrl + "/courier/assign/awb";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(authToken);

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("shipment_id", shipmentId);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                awbUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                logger.info("AWB generated successfully for shipment ID: " + shipmentId);
                return response.getBody();
            }

        } catch (Exception e) {
            logger.error("Failed to generate AWB: " + e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }

        return createErrorResponse("Failed to generate AWB");
    }

    public Map<String, Object> trackShipment(String awb) {
        try {
            if (authToken == null) {
                authToken = authenticateAndGetToken();
            }

            String trackUrl = apiBaseUrl + "/courier/track/awb/" + awb;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(authToken);

            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                trackUrl,
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }

        } catch (Exception e) {
            logger.error("Failed to track shipment: " + e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }

        return createErrorResponse("Failed to track shipment");
    }

    /**
     * Get order details from Shiprocket by order ID
     * This is useful when AWB is not yet assigned
     */
    public Map<String, Object> getOrderDetails(String shiprocketOrderId) {
        try {
            if (authToken == null) {
                authToken = authenticateAndGetToken();
            }

            if (authToken == null) {
                logger.error("Failed to get auth token for order details");
                return createErrorResponse("Authentication failed");
            }

            String orderUrl = apiBaseUrl + "/orders/show/" + shiprocketOrderId;
            logger.info("Fetching order details from Shiprocket: {}", orderUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(authToken);

            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                orderUrl,
                HttpMethod.GET,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                logger.info("Order details fetched successfully for order ID: {}", shiprocketOrderId);
                return response.getBody();
            }

        } catch (Exception e) {
            logger.error("Failed to get order details for order {}: {}", shiprocketOrderId, e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }

        return createErrorResponse("Failed to get order details");
    }

    public Map<String, Object> cancelShipment(String awb) {
        try {
            if (authToken == null) {
                authToken = authenticateAndGetToken();
            }

            String cancelUrl = apiBaseUrl + "/orders/cancel";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(authToken);

            Map<String, Object> requestBody = new HashMap<>();
            List<String> awbList = new ArrayList<>();
            awbList.add(awb);
            requestBody.put("awbs", awbList);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                cancelUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                logger.info("Shipment cancelled successfully for AWB: " + awb);
                return response.getBody();
            }

        } catch (Exception e) {
            logger.error("Failed to cancel shipment: " + e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }

        return createErrorResponse("Failed to cancel shipment");
    }

    /**
     * Cancel order by Shiprocket Order ID (for orders without AWB assigned yet)
     */
    public Map<String, Object> cancelOrderById(String shiprocketOrderId) {
        try {
            if (authToken == null) {
                authToken = authenticateAndGetToken();
            }

            if (authToken == null) {
                logger.error("Failed to get auth token for order cancellation");
                return createErrorResponse("Authentication failed");
            }

            String cancelUrl = apiBaseUrl + "/orders/cancel";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(authToken);

            Map<String, Object> requestBody = new HashMap<>();
            List<Integer> idsList = new ArrayList<>();
            idsList.add(Integer.parseInt(shiprocketOrderId));
            requestBody.put("ids", idsList);

            logger.info("Cancelling Shiprocket order by ID: {}", shiprocketOrderId);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                cancelUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                logger.info("Order cancelled successfully in Shiprocket. Order ID: {}, Response: {}",
                    shiprocketOrderId, response.getBody());
                return response.getBody();
            }

        } catch (Exception e) {
            logger.error("Failed to cancel order by ID {}: {}", shiprocketOrderId, e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }

        return createErrorResponse("Failed to cancel order in Shiprocket");
    }

    private ShiprocketOrderRequest convertToShiprocketOrder(Order order) {
        ShiprocketOrderRequest request = new ShiprocketOrderRequest();

        request.setOrderId(order.getId().toString());
        // Convert LocalDateTime to Date
        request.setOrderDate(java.sql.Timestamp.valueOf(order.getCreatedAt()));
        request.setPickupLocation(defaultPickupLocation);
        request.setChannelId(channelId.isEmpty() ? "CUSTOM" : channelId);
        request.setComment("Order from Digital Frames Shop");

        // Get user details
        String customerName = order.getUser().getName();
        String customerEmail = order.getUser().getEmail();

        // Get shipping address details
        Address shippingAddr = order.getShippingAddress();
        String addressLine = shippingAddr != null ? shippingAddr.getLine1() : "";
        String city = shippingAddr != null ? shippingAddr.getCity() : "";
        String state = shippingAddr != null ? shippingAddr.getState() : "";
        String pincode = shippingAddr != null ? shippingAddr.getPincode() : "";
        String country = shippingAddr != null ? shippingAddr.getCountry() : "India";

        // Set billing details
        request.setBillingCustomerName(customerName);
        request.setBillingLastName("");
        request.setBillingAddress(addressLine);
        request.setBillingCity(city);
        request.setBillingPincode(pincode);
        request.setBillingState(state);
        request.setBillingCountry(country);
        request.setBillingEmail(customerEmail);
        request.setBillingPhone(""); // Phone field needs to be added to User model

        // Set shipping details (same as billing for now)
        request.setShippingIsBilling(true);
        request.setShippingCustomerName(customerName);
        request.setShippingAddress(addressLine);
        request.setShippingCity(city);
        request.setShippingPincode(pincode);
        request.setShippingState(state);
        request.setShippingCountry(country);
        request.setShippingEmail(customerEmail);
        request.setShippingPhone(""); // Phone field needs to be added to User model

        // Set order items
        List<ShiprocketOrderRequest.OrderItem> items = new ArrayList<>();
        for (OrderItem orderItem : order.getItems()) {
            ShiprocketOrderRequest.OrderItem item = new ShiprocketOrderRequest.OrderItem();
            item.setName(orderItem.getName());
            item.setSku(orderItem.getSku().getSkuCode());
            item.setUnits(orderItem.getQuantity());
            item.setSellingPrice(orderItem.getUnitPrice().doubleValue());
            item.setDiscount(0);
            item.setTax("18");
            item.setHsn("");
            items.add(item);
        }
        request.setOrderItems(items);

        // Set payment and pricing details
        String paymentMethod = "COD"; // Default to COD, can be updated based on payment status
        if (order.getPayment() != null && order.getPayment().getStatus() == Payment.PaymentStatus.SUCCESS) {
            paymentMethod = "Prepaid";
        }
        request.setPaymentMethod(paymentMethod);
        request.setShippingCharges(order.getShipping().doubleValue());
        request.setTotalDiscount(order.getDiscount().doubleValue());
        request.setSubTotal(order.getSubtotal().doubleValue());

        // Set package dimensions (default values, should be customized per product)
        request.setLength(30);
        request.setBreadth(20);
        request.setHeight(5);
        request.setWeight(0.5);

        return request;
    }

    public Map<String, Object> createShiprocketOrderForCustomProduct(CustomProductRequest customRequest) {
        try {
            logger.info("Starting Shiprocket order creation for custom product request: {}", customRequest.getId());
            logger.info("Shiprocket config - Email: {}, Channel ID: {}, Pickup Location: {}",
                shiprocketEmail, channelId, defaultPickupLocation);

            if (authToken == null) {
                logger.info("Auth token is null, attempting authentication...");
                authToken = authenticateAndGetToken();
            }

            if (authToken == null) {
                logger.error("Failed to get auth token - check Shiprocket credentials");
                return createErrorResponse("Authentication failed");
            }

            logger.info("Auth token obtained, converting custom product to Shiprocket format...");
            ShiprocketOrderRequest shiprocketOrder = adapter.convertCustomProductRequestToShiprocketOrder(
                customRequest, defaultPickupLocation, channelId);

            // Log the request being sent
            logger.info("Shiprocket order request: {}", objectMapper.writeValueAsString(shiprocketOrder));

            String createOrderUrl = apiBaseUrl + "/orders/create/adhoc";
            logger.info("Sending request to: {}", createOrderUrl);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(authToken);

            HttpEntity<ShiprocketOrderRequest> request = new HttpEntity<>(shiprocketOrder, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                createOrderUrl,
                HttpMethod.POST,
                request,
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                logger.info("Shiprocket order created successfully for custom product ID: {}", customRequest.getId());
                logger.info("Shiprocket response: {}", response.getBody());
                return response.getBody();
            } else {
                logger.error("Shiprocket API returned status: {}, body: {}",
                    response.getStatusCode(), response.getBody());
            }

        } catch (Exception e) {
            logger.error("Failed to create Shiprocket order for custom product {}: {}",
                customRequest.getId(), e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }

        return createErrorResponse("Failed to create order in Shiprocket");
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", message);
        return errorResponse;
    }
}