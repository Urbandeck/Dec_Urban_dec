package com.digitalframes.shop.service;

import com.digitalframes.shop.entity.CustomProductRequest;
import com.digitalframes.shop.entity.CustomProductImage;
import com.digitalframes.shop.repository.CustomProductRepository;
import com.digitalframes.shop.repository.CustomProductImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CustomProductService {

    @Autowired
    private CustomProductRepository customProductRepository;

    @Autowired
    private CustomProductImageRepository customProductImageRepository;

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

        request.setStatus(status);
        if (notes != null) {
            request.setAdminNotes(notes);
        }
        request.setUpdatedAt(LocalDateTime.now());

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
}