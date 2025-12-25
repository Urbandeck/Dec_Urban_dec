package com.digitalframes.shop.controller;

import com.digitalframes.shop.dto.AddressDTO;
import com.digitalframes.shop.service.AddressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/user/addresses")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getUserAddresses(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<AddressDTO> addresses = addressService.getUserAddresses(principal.getName());
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            log.error("Error fetching user addresses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(
            @RequestBody AddressDTO addressDTO,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            AddressDTO createdAddress = addressService.createAddress(principal.getName(), addressDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAddress);
        } catch (Exception e) {
            log.error("Error creating address", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Long addressId,
            @RequestBody AddressDTO addressDTO,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            AddressDTO updatedAddress = addressService.updateAddress(principal.getName(), addressId, addressDTO);
            return ResponseEntity.ok(updatedAddress);
        } catch (Exception e) {
            log.error("Error updating address", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long addressId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            addressService.deleteAddress(principal.getName(), addressId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting address", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{addressId}/set-default")
    public ResponseEntity<AddressDTO> setDefaultAddress(
            @PathVariable Long addressId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            AddressDTO updatedAddress = addressService.setDefaultAddress(principal.getName(), addressId);
            return ResponseEntity.ok(updatedAddress);
        } catch (Exception e) {
            log.error("Error setting default address", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}