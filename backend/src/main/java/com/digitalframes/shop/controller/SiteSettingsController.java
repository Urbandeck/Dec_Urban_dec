package com.digitalframes.shop.controller;

import com.digitalframes.shop.entity.CTAVideo;
import com.digitalframes.shop.service.CTAVideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/site-settings")
@CrossOrigin
public class SiteSettingsController {

    @Autowired
    private CTAVideoService ctaVideoService;

    // Get all CTA videos (for admin)
    @GetMapping("/cta-videos")
    public ResponseEntity<List<CTAVideo>> getAllVideos() {
        List<CTAVideo> videos = ctaVideoService.getAllVideos();
        return ResponseEntity.ok(videos);
    }

    // Get active CTA video (for frontend)
    @GetMapping("/cta-video")
    public ResponseEntity<CTAVideo> getActiveVideo() {
        return ctaVideoService.getActiveVideo()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // Get specific video by ID
    @GetMapping("/cta-video/{id}")
    public ResponseEntity<CTAVideo> getVideoById(@PathVariable Long id) {
        return ctaVideoService.getVideoById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create new CTA video
    @PostMapping("/cta-video")
    public ResponseEntity<CTAVideo> createVideo(@RequestBody CTAVideo video) {
        try {
            CTAVideo createdVideo = ctaVideoService.createVideo(video);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVideo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update existing CTA video
    @PutMapping("/cta-video/{id}")
    public ResponseEntity<CTAVideo> updateVideo(
            @PathVariable Long id,
            @RequestBody CTAVideo videoDetails) {
        try {
            CTAVideo updatedVideo = ctaVideoService.updateVideo(id, videoDetails);
            return ResponseEntity.ok(updatedVideo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Toggle video active status
    @PutMapping("/cta-video/{id}/toggle")
    public ResponseEntity<CTAVideo> toggleVideoStatus(@PathVariable Long id) {
        try {
            CTAVideo updatedVideo = ctaVideoService.toggleVideoStatus(id);
            return ResponseEntity.ok(updatedVideo);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete CTA video
    @DeleteMapping("/cta-video/{id}")
    public ResponseEntity<Map<String, String>> deleteVideo(@PathVariable Long id) {
        try {
            ctaVideoService.deleteVideo(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Video deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete video");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}