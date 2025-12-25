package com.digitalframes.shop.service;

import com.digitalframes.shop.entity.CTAVideo;
import com.digitalframes.shop.repository.CTAVideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CTAVideoService {

    @Autowired
    private CTAVideoRepository ctaVideoRepository;

    public List<CTAVideo> getAllVideos() {
        return ctaVideoRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<CTAVideo> getActiveVideo() {
        return ctaVideoRepository.findByIsActiveTrue();
    }

    public Optional<CTAVideo> getVideoById(Long id) {
        return ctaVideoRepository.findById(id);
    }

    @Transactional
    public CTAVideo createVideo(CTAVideo video) {
        // Check if there are any videos in the database
        List<CTAVideo> existingVideos = ctaVideoRepository.findAll();

        // If no videos exist or this is set as active, make it active
        if (existingVideos.isEmpty() || video.isActive()) {
            deactivateAllVideos();
            video.setActive(true);
        }

        return ctaVideoRepository.save(video);
    }

    @Transactional
    public CTAVideo updateVideo(Long id, CTAVideo videoDetails) {
        CTAVideo video = ctaVideoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found with id: " + id));

        video.setVideoUrl(videoDetails.getVideoUrl());
        video.setTitle(videoDetails.getTitle());
        video.setDescription(videoDetails.getDescription());

        // If this video is being set as active, deactivate others
        if (videoDetails.isActive() && !video.isActive()) {
            deactivateAllVideos();
        }

        video.setActive(videoDetails.isActive());

        return ctaVideoRepository.save(video);
    }

    @Transactional
    public CTAVideo toggleVideoStatus(Long id) {
        CTAVideo video = ctaVideoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Video not found with id: " + id));

        // If activating this video, deactivate others
        if (!video.isActive()) {
            deactivateAllVideos();
            video.setActive(true);
        } else {
            video.setActive(false);
        }

        return ctaVideoRepository.save(video);
    }

    @Transactional
    public void deleteVideo(Long id) {
        ctaVideoRepository.deleteById(id);
    }

    @Transactional
    private void deactivateAllVideos() {
        List<CTAVideo> activeVideos = ctaVideoRepository.findAll();
        for (CTAVideo v : activeVideos) {
            if (v.isActive()) {
                v.setActive(false);
                ctaVideoRepository.save(v);
            }
        }
    }
}