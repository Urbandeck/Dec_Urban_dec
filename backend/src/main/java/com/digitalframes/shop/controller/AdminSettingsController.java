package com.digitalframes.shop.controller;

import com.digitalframes.shop.dto.SettingsDTO;
import com.digitalframes.shop.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class AdminSettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<SettingsDTO> getSettings() {
        log.info("Fetching all settings");
        return ResponseEntity.ok(settingsService.getAllSettings());
    }

    @PutMapping
    public ResponseEntity<SettingsDTO> updateSettings(@RequestBody SettingsDTO settingsDTO) {
        log.info("Updating settings");
        return ResponseEntity.ok(settingsService.updateSettings(settingsDTO));
    }
}