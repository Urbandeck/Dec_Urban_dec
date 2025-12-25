package com.digitalframes.shop.service;

import com.digitalframes.shop.dto.ShiprocketOrderRequest;
import com.digitalframes.shop.entity.CustomerOrder;
import com.digitalframes.shop.entity.CustomerOrderItem;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class ShiprocketServiceAdapter {

    public ShiprocketOrderRequest convertCustomerOrderToShiprocketOrder(
            CustomerOrder order, String defaultPickupLocation, String channelId) {

        ShiprocketOrderRequest request = new ShiprocketOrderRequest();

        request.setOrderId(order.getId().toString());
        request.setOrderDate(Timestamp.valueOf(order.getCreatedAt()));
        request.setPickupLocation(defaultPickupLocation);
        request.setChannelId(channelId.isEmpty() ? "CUSTOM" : channelId);
        request.setComment("Order from Digital Frames Shop");

        // Set billing and shipping details
        request.setBillingCustomerName(order.getCustomerName());
        request.setBillingLastName("");
        request.setBillingAddress(order.getShippingAddress());
        request.setBillingAddress2(""); // Set to empty string instead of null
        request.setBillingCity(order.getCity());
        request.setBillingPincode(order.getPincode());
        request.setBillingState(order.getState());
        request.setBillingCountry("India");
        request.setBillingEmail(order.getCustomerEmail());
        request.setBillingPhone(order.getCustomerPhone());

        // Set shipping details (same as billing)
        request.setShippingIsBilling(true);
        request.setShippingCustomerName(order.getCustomerName());
        request.setShippingLastName(""); // Set to empty string instead of null
        request.setShippingAddress(order.getShippingAddress());
        request.setShippingAddress2(""); // Set to empty string instead of null
        request.setShippingCity(order.getCity());
        request.setShippingPincode(order.getPincode());
        request.setShippingState(order.getState());
        request.setShippingCountry("India");
        request.setShippingEmail(order.getCustomerEmail());
        request.setShippingPhone(order.getCustomerPhone());

        // Set order items
        List<ShiprocketOrderRequest.OrderItem> items = new ArrayList<>();
        for (CustomerOrderItem orderItem : order.getItems()) {
            ShiprocketOrderRequest.OrderItem item = new ShiprocketOrderRequest.OrderItem();
            item.setName(orderItem.getProductName());
            item.setSku(orderItem.getProductId().toString());
            item.setUnits(orderItem.getQuantity());
            item.setSellingPrice(orderItem.getPrice());
            item.setDiscount(0);
            item.setTax("18");
            item.setHsn("");
            items.add(item);
        }
        request.setOrderItems(items);

        // Set payment and pricing details
        String paymentMethod = "COD"; // Default
        if (order.getPaymentStatus() != null && "SUCCESS".equalsIgnoreCase(order.getPaymentStatus())) {
            paymentMethod = "Prepaid";
        }
        request.setPaymentMethod(paymentMethod);

        // Calculate shipping (you can adjust this based on business logic)
        double shippingCharges = 50.0; // Default shipping charge
        request.setShippingCharges(shippingCharges);
        request.setTotalDiscount(0);
        request.setSubTotal(order.getSubtotal());

        // Set package dimensions (default values, should be customized per product)
        request.setLength(30);
        request.setBreadth(20);
        request.setHeight(5);
        request.setWeight(0.5);

        return request;
    }
}