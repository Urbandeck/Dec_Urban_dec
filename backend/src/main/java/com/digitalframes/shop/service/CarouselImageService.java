package com.digitalframes.shop.service;

import com.digitalframes.shop.entity.CarouselImage;
import com.digitalframes.shop.repository.CarouselImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class CarouselImageService {

    @Autowired
    private CarouselImageRepository carouselImageRepository;

    public List<CarouselImage> getAllImages() {
        return carouselImageRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<CarouselImage> getActiveImages() {
        return carouselImageRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public Optional<CarouselImage> getImageById(Long id) {
        return carouselImageRepository.findById(id);
    }

    public CarouselImage uploadImage(MultipartFile file, Integer displayOrder) throws IOException {
        CarouselImage image = new CarouselImage();
        image.setFileName(file.getOriginalFilename());
        image.setMimeType(file.getContentType());
        image.setImageData(file.getBytes());
        image.setFileSize(file.getSize());
        image.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        image.setIsActive(true);

        return carouselImageRepository.save(image);
    }

    public CarouselImage toggleActive(Long id) {
        Optional<CarouselImage> optionalImage = carouselImageRepository.findById(id);
        if (optionalImage.isPresent()) {
            CarouselImage image = optionalImage.get();
            image.setIsActive(!image.getIsActive());
            return carouselImageRepository.save(image);
        }
        return null;
    }

    public CarouselImage updateDisplayOrder(Long id, Integer displayOrder) {
        Optional<CarouselImage> optionalImage = carouselImageRepository.findById(id);
        if (optionalImage.isPresent()) {
            CarouselImage image = optionalImage.get();
            image.setDisplayOrder(displayOrder);
            return carouselImageRepository.save(image);
        }
        return null;
    }

    public boolean deleteImage(Long id) {
        if (carouselImageRepository.existsById(id)) {
            carouselImageRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
