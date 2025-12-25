package com.digitalframes.shop.controller;

import com.digitalframes.shop.dto.AnalyticsDTO;
import com.digitalframes.shop.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsDTO> getAnalytics(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getAnalytics(days));
    }
}