package com.digitalframes.shop.service;

import com.digitalframes.shop.dto.AddressDTO;
import com.digitalframes.shop.model.UserAddress;
import com.digitalframes.shop.model.User;
import com.digitalframes.shop.repository.AddressRepository;
import com.digitalframes.shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    private static final int MAX_ADDRESSES_PER_USER = 10;

    public List<AddressDTO> getUserAddresses(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<UserAddress> addresses = addressRepository.findByUserOrderByIsDefaultDescCreatedAtDesc(user);
        return addresses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressDTO createAddress(String userEmail, AddressDTO addressDTO) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user has reached max addresses limit
        long addressCount = addressRepository.countByUser(user);
        if (addressCount >= MAX_ADDRESSES_PER_USER) {
            throw new RuntimeException("Maximum number of addresses reached");
        }

        UserAddress address = new UserAddress();
        address.setUser(user);
        address.setLabel(addressDTO.getLabel());
        address.setAddressLine1(addressDTO.getAddressLine1());
        address.setAddressLine2(addressDTO.getAddressLine2());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPincode(addressDTO.getPincode());
        address.setCountry(addressDTO.getCountry() != null ? addressDTO.getCountry() : "India");

        // If this is the first address or marked as default, set it as default
        if (addressCount == 0 || addressDTO.isDefault()) {
            addressRepository.resetAllDefaultAddresses(user);
            address.setDefault(true);
        } else {
            address.setDefault(false);
        }

        UserAddress savedAddress = addressRepository.save(address);
        return convertToDTO(savedAddress);
    }

    @Transactional
    public AddressDTO updateAddress(String userEmail, Long addressId, AddressDTO addressDTO) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserAddress address = addressRepository.findByUserAndId(user, addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        address.setLabel(addressDTO.getLabel());
        address.setAddressLine1(addressDTO.getAddressLine1());
        address.setAddressLine2(addressDTO.getAddressLine2());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPincode(addressDTO.getPincode());
        address.setCountry(addressDTO.getCountry());

        // Handle default address change
        if (addressDTO.isDefault() && !address.isDefault()) {
            addressRepository.resetDefaultAddresses(user, addressId);
            address.setDefault(true);
        } else if (!addressDTO.isDefault() && address.isDefault()) {
            // Don't allow removing default if it's the only address
            long count = addressRepository.countByUser(user);
            if (count > 1) {
                address.setDefault(false);
            }
        }

        UserAddress updatedAddress = addressRepository.save(address);
        return convertToDTO(updatedAddress);
    }

    @Transactional
    public void deleteAddress(String userEmail, Long addressId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserAddress address = addressRepository.findByUserAndId(user, addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        // If we deleted the default address, set another one as default
        if (wasDefault) {
            List<UserAddress> remainingAddresses = addressRepository.findByUser(user);
            if (!remainingAddresses.isEmpty()) {
                UserAddress newDefault = remainingAddresses.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Transactional
    public AddressDTO setDefaultAddress(String userEmail, Long addressId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserAddress address = addressRepository.findByUserAndId(user, addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!address.isDefault()) {
            addressRepository.resetAllDefaultAddresses(user);
            address.setDefault(true);
            address = addressRepository.save(address);
        }

        return convertToDTO(address);
    }

    private AddressDTO convertToDTO(UserAddress address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId().toString());
        dto.setLabel(address.getLabel());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPincode(address.getPincode());
        dto.setCountry(address.getCountry());
        dto.setDefault(address.isDefault());
        return dto;
    }
}