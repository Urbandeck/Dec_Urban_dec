package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.CarouselImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarouselImageRepository extends JpaRepository<CarouselImage, Long> {
    List<CarouselImage> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<CarouselImage> findAllByOrderByDisplayOrderAsc();
}
