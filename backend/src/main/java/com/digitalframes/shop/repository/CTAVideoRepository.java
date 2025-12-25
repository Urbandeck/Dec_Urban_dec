package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.CTAVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CTAVideoRepository extends JpaRepository<CTAVideo, Long> {

    Optional<CTAVideo> findByIsActiveTrue();

    List<CTAVideo> findAllByOrderByCreatedAtDesc();

    @Query("UPDATE CTAVideo v SET v.isActive = false WHERE v.isActive = true AND v.id != :id")
    void deactivateOtherVideos(Long id);
}