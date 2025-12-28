package com.digitalframes.shop.controller;

import com.digitalframes.shop.entity.CarouselImage;
import com.digitalframes.shop.service.CarouselImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carousel")
@CrossOrigin
public class CarouselController {

    @Autowired
    private CarouselImageService carouselImageService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllImages() {
        List<CarouselImage> images = carouselImageService.getAllImages();
        List<Map<String, Object>> imageDtos = images.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(imageDtos);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveImages() {
        List<CarouselImage> images = carouselImageService.getActiveImages();
        List<Map<String, Object>> imageDtos = images.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(imageDtos);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        try {
            CarouselImage image = carouselImageService.uploadImage(file, displayOrder);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDto(image));
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleActive(@PathVariable Long id) {
        CarouselImage image = carouselImageService.toggleActive(id);
        if (image != null) {
            return ResponseEntity.ok(convertToDto(image));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/order")
    public ResponseEntity<Map<String, Object>> updateDisplayOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer displayOrder = body.get("displayOrder");
        CarouselImage image = carouselImageService.updateDisplayOrder(id, displayOrder);
        if (image != null) {
            return ResponseEntity.ok(convertToDto(image));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        if (carouselImageService.deleteImage(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private Map<String, Object> convertToDto(CarouselImage image) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", image.getId());
        dto.put("fileName", image.getFileName());
        dto.put("mimeType", image.getMimeType());
        dto.put("fileSize", image.getFileSize());
        dto.put("displayOrder", image.getDisplayOrder());
        dto.put("isActive", image.getIsActive());
        dto.put("createdAt", image.getCreatedAt());
        dto.put("updatedAt", image.getUpdatedAt());

        // Convert image data to base64
        if (image.getImageData() != null && image.getImageData().length > 0) {
            dto.put("base64Data", "data:" + image.getMimeType() + ";base64," +
                    Base64.getEncoder().encodeToString(image.getImageData()));
        }

        return dto;
    }
}
