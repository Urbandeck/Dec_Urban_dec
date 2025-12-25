package com.digitalframes.shop.service;

import com.digitalframes.shop.entity.Product;
import com.digitalframes.shop.entity.ProductImage;
import com.digitalframes.shop.repository.ProductImageRepository;
import com.digitalframes.shop.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductImageService {

    @Autowired
    private ProductImageRepository productImageRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Store image as binary data in database
     */
    public ProductImage storeImage(Long productId, MultipartFile file, String altText, boolean isPrimary) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        // If this is set as primary, unset any existing primary image
        if (isPrimary) {
            productImageRepository.findByProductIdAndIsPrimaryTrue(productId)
                    .ifPresent(existingPrimary -> {
                        existingPrimary.setIsPrimary(false);
                        productImageRepository.save(existingPrimary);
                    });
        }

        ProductImage productImage = new ProductImage();
        productImage.setProduct(product);
        productImage.setFileName(file.getOriginalFilename());
        productImage.setMimeType(file.getContentType());
        productImage.setImageData(file.getBytes()); // Store as byte array
        productImage.setFileSize(file.getSize());
        productImage.setAltText(altText);
        productImage.setIsPrimary(isPrimary);
        
        // Set display order based on existing images
        int imageCount = productImageRepository.countByProductId(productId);
        productImage.setDisplayOrder(imageCount + 1);

        return productImageRepository.save(productImage);
    }

    /**
     * Store image from base64 data
     */
    public ProductImage storeBase64Image(Long productId, String base64Data, String fileName, String altText, boolean isPrimary) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        // If this is set as primary, unset any existing primary image
        if (isPrimary) {
            productImageRepository.findByProductIdAndIsPrimaryTrue(productId)
                    .ifPresent(existingPrimary -> {
                        existingPrimary.setIsPrimary(false);
                        productImageRepository.save(existingPrimary);
                    });
        }

        // Decode base64 data
        byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);

        // Detect MIME type from file extension or default to jpeg
        String mimeType = "image/jpeg";
        if (fileName != null) {
            if (fileName.toLowerCase().endsWith(".png")) {
                mimeType = "image/png";
            } else if (fileName.toLowerCase().endsWith(".gif")) {
                mimeType = "image/gif";
            } else if (fileName.toLowerCase().endsWith(".webp")) {
                mimeType = "image/webp";
            }
        }

        ProductImage productImage = new ProductImage();
        productImage.setProduct(product);
        productImage.setFileName(fileName != null ? fileName : "image.jpg");
        productImage.setMimeType(mimeType);
        productImage.setImageData(imageBytes);
        productImage.setFileSize((long) imageBytes.length);
        productImage.setAltText(altText);
        productImage.setIsPrimary(isPrimary);

        // Set display order based on existing images
        int imageCount = productImageRepository.countByProductId(productId);
        productImage.setDisplayOrder(imageCount + 1);

        return productImageRepository.save(productImage);
    }

    /**
     * Store multiple images for a product
     */
    public List<ProductImage> storeImages(Long productId, List<MultipartFile> files) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        List<ProductImage> images = new java.util.ArrayList<>();
        int currentCount = productImageRepository.countByProductId(productId);
        
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            ProductImage productImage = new ProductImage();
            productImage.setProduct(product);
            productImage.setFileName(file.getOriginalFilename());
            productImage.setMimeType(file.getContentType());
            productImage.setImageData(file.getBytes());
            productImage.setFileSize(file.getSize());
            productImage.setIsPrimary(i == 0 && currentCount == 0); // First image is primary if no existing images
            productImage.setDisplayOrder(currentCount + i + 1);
            
            images.add(productImage);
        }
        
        return productImageRepository.saveAll(images);
    }

    /**
     * Get image by ID
     */
    public Optional<ProductImage> getImage(Long imageId) {
        return productImageRepository.findById(imageId);
    }

    /**
     * Get all images for a product
     */
    public List<ProductImage> getProductImages(Long productId) {
        return productImageRepository.findByProductIdOrderByDisplayOrderAsc(productId);
    }

    /**
     * Get primary image for a product
     */
    public Optional<ProductImage> getPrimaryImage(Long productId) {
        return productImageRepository.findByProductIdAndIsPrimaryTrue(productId);
    }

    /**
     * Update image details (not the binary data)
     */
    public ProductImage updateImageDetails(Long imageId, String altText, Boolean isPrimary, Integer displayOrder) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        if (altText != null) {
            image.setAltText(altText);
        }

        if (isPrimary != null && isPrimary) {
            // Unset any existing primary image for this product
            productImageRepository.findByProductIdAndIsPrimaryTrue(image.getProduct().getId())
                    .ifPresent(existingPrimary -> {
                        if (!existingPrimary.getId().equals(imageId)) {
                            existingPrimary.setIsPrimary(false);
                            productImageRepository.save(existingPrimary);
                        }
                    });
            image.setIsPrimary(true);
        } else if (isPrimary != null) {
            image.setIsPrimary(false);
        }

        if (displayOrder != null) {
            image.setDisplayOrder(displayOrder);
        }

        return productImageRepository.save(image);
    }

    /**
     * Delete an image
     */
    public void deleteImage(Long imageId) {
        productImageRepository.deleteById(imageId);
    }

    /**
     * Delete all images for a product
     */
    public void deleteProductImages(Long productId) {
        productImageRepository.deleteByProductId(productId);
    }

    /**
     * Update image display order
     */
    public ProductImage updateImageOrder(Long imageId, Integer newOrder) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        image.setDisplayOrder(newOrder);
        return productImageRepository.save(image);
    }

    /**
     * Replace an existing image with a new one
     */
    public ProductImage replaceImage(Long imageId, MultipartFile file) throws IOException {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        image.setFileName(file.getOriginalFilename());
        image.setMimeType(file.getContentType());
        image.setImageData(file.getBytes());
        image.setFileSize(file.getSize());

        return productImageRepository.save(image);
    }
}