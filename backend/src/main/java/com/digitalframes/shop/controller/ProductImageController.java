package com.digitalframes.shop.controller;

import com.digitalframes.shop.entity.ProductImage;
import com.digitalframes.shop.service.ProductImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductImageController {

    @Autowired
    private ProductImageService productImageService;

    /**
     * Upload a single image for a product
     */
    @PostMapping("/{productId}/images")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "isPrimary", defaultValue = "false") boolean isPrimary) {
        
        try {
            ProductImage savedImage = productImageService.storeImage(productId, file, altText, isPrimary);
            return ResponseEntity.ok(convertToDTO(savedImage));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Upload image from base64 data
     */
    @PostMapping("/{productId}/images/base64")
    public ResponseEntity<?> uploadBase64Image(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> request) {

        try {
            String base64Data = (String) request.get("base64Data");
            String fileName = (String) request.getOrDefault("fileName", "image.jpg");
            String altText = (String) request.getOrDefault("altText", "");
            Boolean isPrimary = (Boolean) request.getOrDefault("isPrimary", false);

            // Remove data URL prefix if present
            if (base64Data.contains(",")) {
                base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
            }

            ProductImage savedImage = productImageService.storeBase64Image(productId, base64Data, fileName, altText, isPrimary);
            return ResponseEntity.ok(convertToDTO(savedImage));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Upload multiple images for a product
     */
    @PostMapping("/{productId}/images/multiple")
    public ResponseEntity<?> uploadMultipleImages(
            @PathVariable Long productId,
            @RequestParam("files") List<MultipartFile> files) {
        
        try {
            List<ProductImage> savedImages = productImageService.storeImages(productId, files);
            List<Map<String, Object>> response = savedImages.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload images: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all images for a product
     */
    @GetMapping("/{productId}/images")
    public ResponseEntity<List<Map<String, Object>>> getProductImages(@PathVariable Long productId) {
        List<ProductImage> images = productImageService.getProductImages(productId);
        List<Map<String, Object>> response = images.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific image by ID (returns the actual image data)
     */
    @GetMapping("/images/{imageId}")
    public ResponseEntity<?> getImage(@PathVariable Long imageId) {
        return productImageService.getImage(imageId)
                .map(image -> {
                    // Check if image data exists
                    if (image.getImageData() == null || image.getImageData().length == 0) {
                        return ResponseEntity.notFound().build();
                    }

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.parseMediaType(image.getMimeType()));
                    headers.setContentLength(image.getImageData().length);
                    headers.setCacheControl(CacheControl.maxAge(3600, java.util.concurrent.TimeUnit.SECONDS));

                    return new ResponseEntity<>(image.getImageData(), headers, HttpStatus.OK);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get image metadata (without the binary data)
     */
    @GetMapping("/images/{imageId}/metadata")
    public ResponseEntity<?> getImageMetadata(@PathVariable Long imageId) {
        return productImageService.getImage(imageId)
                .map(image -> ResponseEntity.ok(convertToDTO(image)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update image details
     */
    @PutMapping("/images/{imageId}")
    public ResponseEntity<?> updateImageDetails(
            @PathVariable Long imageId,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        
        try {
            ProductImage updatedImage = productImageService.updateImageDetails(imageId, altText, isPrimary, displayOrder);
            return ResponseEntity.ok(convertToDTO(updatedImage));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Replace an existing image
     */
    @PutMapping("/images/{imageId}/replace")
    public ResponseEntity<?> replaceImage(
            @PathVariable Long imageId,
            @RequestParam("file") MultipartFile file) {
        
        try {
            ProductImage replacedImage = productImageService.replaceImage(imageId, file);
            return ResponseEntity.ok(convertToDTO(replacedImage));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to replace image: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete an image
     */
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable Long imageId) {
        try {
            productImageService.deleteImage(imageId);
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete image: " + e.getMessage()));
        }
    }

    /**
     * Delete all images for a product
     */
    @DeleteMapping("/{productId}/images")
    public ResponseEntity<?> deleteProductImages(@PathVariable Long productId) {
        try {
            productImageService.deleteProductImages(productId);
            return ResponseEntity.ok(Map.of("message", "All product images deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete images: " + e.getMessage()));
        }
    }

    /**
     * Update image display order
     */
    @PutMapping("/{productId}/images/{imageId}/order")
    public ResponseEntity<?> updateImageOrder(
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @RequestParam Integer newOrder) {
        try {
            ProductImage updatedImage = productImageService.updateImageOrder(imageId, newOrder);
            return ResponseEntity.ok(convertToDTO(updatedImage));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update image order: " + e.getMessage()));
        }
    }

    /**
     * Convert ProductImage entity to DTO (metadata only, no binary data)
     */
    private Map<String, Object> convertToDTO(ProductImage image) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", image.getId());
        dto.put("productId", image.getProduct().getId());
        dto.put("fileName", image.getFileName());
        dto.put("mimeType", image.getMimeType());
        dto.put("fileSize", image.getFileSize());
        dto.put("altText", image.getAltText());
        dto.put("isPrimary", image.getIsPrimary());
        dto.put("displayOrder", image.getDisplayOrder());
        dto.put("createdAt", image.getCreatedAt());
        dto.put("updatedAt", image.getUpdatedAt());

        // Return image URL instead of base64 data for better performance
        dto.put("imageUrl", "/api/products/images/" + image.getId());

        return dto;
    }
}