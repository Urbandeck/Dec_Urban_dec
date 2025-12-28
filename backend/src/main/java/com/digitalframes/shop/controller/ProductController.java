package com.digitalframes.shop.controller;

import com.digitalframes.shop.entity.Product;
import com.digitalframes.shop.entity.ProductImage;
import com.digitalframes.shop.service.ProductService;
import com.digitalframes.shop.service.ProductImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// import jakarta.annotation.PostConstruct; // Removed - no longer using @PostConstruct
// import java.math.BigDecimal; // Removed - no longer creating sample products
// import java.time.LocalDateTime; // Removed - unused
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Base64;

@RestController
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductImageService productImageService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllProducts(
            @RequestParam(value = "admin", required = false, defaultValue = "false") boolean isAdmin) {
        // For admin, show all products; for customers, show only live products
        List<Product> products = isAdmin ? productService.getActiveProducts() : productService.getLiveProducts();

        // Convert products to DTOs including images
        List<Map<String, Object>> productDtos = products.stream()
            .map(this::convertProductToDto)
            .collect(Collectors.toList());

        return ResponseEntity.ok(productDtos);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Map<String, Object>> getProductBySlug(@PathVariable String slug) {
        Optional<Product> product = productService.getProductBySlug(slug);
        if (product.isPresent()) {
            return ResponseEntity.ok(convertProductToDto(product.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(p -> ResponseEntity.ok(convertProductToDto(p)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Helper method to convert Product entity to DTO including images
     */
    private Map<String, Object> convertProductToDto(Product product) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", product.getId());
        dto.put("name", product.getName());
        dto.put("slug", product.getSlug());
        dto.put("description", product.getDescription());
        dto.put("specsJson", product.getSpecsJson());
        dto.put("basePrice", product.getBasePrice());
        dto.put("active", product.isActive());
        dto.put("createdAt", product.getCreatedAt());
        dto.put("updatedAt", product.getUpdatedAt());
        dto.put("skus", product.getSkus());
        dto.put("category", product.getCategory());
        dto.put("brand", product.getBrand());
        dto.put("rating", product.getRating());
        dto.put("reviewCount", product.getReviewCount());
        dto.put("isLive", product.getIsLive());
        // Removed imageUrl - using byte arrays instead

        // Fetch and include images
        List<ProductImage> images = productImageService.getProductImages(product.getId());
        List<Map<String, Object>> imageDtos = images.stream()
            .map(this::convertImageToDto)
            .collect(Collectors.toList());
        dto.put("images", imageDtos);

        return dto;
    }

    /**
     * Helper method to convert ProductImage entity to DTO
     */
    private Map<String, Object> convertImageToDto(ProductImage image) {
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

        // Always include base64 data for displaying images
        if (image.getImageData() != null && image.getImageData().length > 0) {
            dto.put("base64Data", "data:" + image.getMimeType() + ";base64," +
                    Base64.getEncoder().encodeToString(image.getImageData()));
        }

        return dto;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Product product) {
        try {
            Product createdProduct = productService.createProduct(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertProductToDto(createdProduct));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        if (updatedProduct != null) {
            return ResponseEntity.ok(convertProductToDto(updatedProduct));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        boolean deleted = productService.deleteProduct(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getProductsByCategory(@PathVariable String category) {
        List<Product> products = productService.getProductsByCategory(category);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/brand/{brand}")
    public ResponseEntity<List<Product>> getProductsByBrand(@PathVariable String brand) {
        List<Product> products = productService.getProductsByBrand(brand);
        return ResponseEntity.ok(products);
    }

    // Initialize with sample data if database is empty
    // Commented out to prevent automatic recreation of products after deletion
    /* @PostConstruct
    public void initializeProducts() {
        List<Product> existingProducts = productService.getAllProducts();
        if (existingProducts.isEmpty()) {
            // Add sample products
            createSampleProduct(
                "Premium 10-inch Digital Frame - Black",
                "High-resolution 10-inch digital photo frame with WiFi connectivity in elegant black finish",
                new BigDecimal("12999"),
                "Digital Frames",
                "FrameTech",
                "/images/products/frame-10inch-black.jpg",
                4.5,
                125
            );

            createSampleProduct(
                "Smart 15-inch Ultra HD Display",
                "Large 15-inch smart digital frame with 4K display perfect for living rooms",
                new BigDecimal("24999"),
                "Digital Frames",
                "FrameTech Pro",
                "/images/products/frame-15inch-ultra.jpg",
                4.8,
                89
            );

            createSampleProduct(
                "Classic 10-inch White Frame",
                "Beautiful 10-inch digital frame in pristine white, perfect for modern homes",
                new BigDecimal("11999"),
                "Digital Frames",
                "FrameTech",
                "/images/products/frame-10inch-white.jpg",
                4.3,
                67
            );

            createSampleProduct(
                "Portable 7-inch Compact Frame",
                "Compact 7-inch digital frame, perfect for desks and small spaces",
                new BigDecimal("6999"),
                "Compact Frames",
                "FrameTech Mini",
                "/images/products/frame-7inch-portable.jpg",
                4.2,
                203
            );

            createSampleProduct(
                "Premium 15-inch Professional Display",
                "Professional-grade 15-inch display with advanced color accuracy",
                new BigDecimal("29999"),
                "Professional",
                "FrameTech Pro",
                "/images/products/frame-15inch-premium.jpg",
                4.9,
                45
            );

            createSampleProduct(
                "Wooden Style 12-inch Frame",
                "12-inch digital frame with elegant wooden finish for a classic look",
                new BigDecimal("16999"),
                "Designer Frames",
                "FrameTech Elegance",
                "/images/products/frame-12inch-wood.jpg",
                4.6,
                98
            );

            createSampleProduct(
                "Slim 10-inch Modern Frame",
                "Ultra-slim 10-inch frame with minimalist design and edge-to-edge display",
                new BigDecimal("13999"),
                "Modern Frames",
                "FrameTech Slim",
                "/images/products/frame-10inch-slim.jpg",
                4.4,
                156
            );

            createSampleProduct(
                "Smart 13-inch Connected Frame",
                "13-inch smart frame with cloud sync and mobile app control",
                new BigDecimal("19999"),
                "Smart Frames",
                "FrameTech Smart",
                "/images/products/frame-13inch-smart.jpg",
                4.7,
                112
            );
        }
    }

    private void createSampleProduct(String name, String description, BigDecimal price,
                                    String category, String brand, String imageUrl,
                                    double rating, int reviewCount) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setBasePrice(price);
        product.setCategory(category);
        product.setBrand(brand);
        product.setImageUrl(imageUrl);
        product.setRating(rating);
        product.setReviewCount(reviewCount);
        product.setActive(true);
        productService.createProduct(product);
    } */
}