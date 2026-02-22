package com.digitalframes.shop.service;

import com.digitalframes.shop.entity.CTAVideo;
import com.digitalframes.shop.repository.CTAVideoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class CTAVideoService {

    private static final Logger logger = LoggerFactory.getLogger(CTAVideoService.class);
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("video/mp4", "video/webm");
    private static final long MAX_FILE_SIZE = 500L * 1024 * 1024; // 500MB

    @Autowired
    private CTAVideoRepository ctaVideoRepository;

    @Value("${video.upload.directory:/var/www/videos/cta-videos}")
    private String uploadDirectory;

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

        if (video.getStorageType() == null) {
            video.setStorageType("URL");
        }

        return ctaVideoRepository.save(video);
    }

    @Transactional
    public CTAVideo uploadVideo(MultipartFile file, String title, String description, boolean isActive) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only MP4 and WebM are allowed.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 500MB limit.");
        }

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate UUID filename preserving extension
        String originalFilename = file.getOriginalFilename();
        String extension = "mp4";
        if ("video/webm".equals(contentType)) {
            extension = "webm";
        } else if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
            if ("mp4".equals(ext) || "webm".equals(ext)) {
                extension = ext;
            }
        }
        String uuidFilename = UUID.randomUUID().toString() + "." + extension;

        // Save file to disk
        Path targetPath = uploadPath.resolve(uuidFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        logger.info("Video file saved: {}", targetPath);

        // Create entity
        CTAVideo video = new CTAVideo();
        video.setTitle(title);
        video.setDescription(description);
        video.setStorageType("FILESYSTEM");
        video.setFileName(originalFilename);
        video.setMimeType(contentType);
        video.setFileSize(file.getSize());
        video.setVideoUrl("/videos/cta-videos/" + uuidFilename);

        // Handle active status
        List<CTAVideo> existingVideos = ctaVideoRepository.findAll();
        if (existingVideos.isEmpty() || isActive) {
            deactivateAllVideos();
            video.setActive(true);
        } else {
            video.setActive(false);
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
        Optional<CTAVideo> videoOpt = ctaVideoRepository.findById(id);
        if (videoOpt.isPresent()) {
            CTAVideo video = videoOpt.get();
            deleteVideoFile(video);
            ctaVideoRepository.deleteById(id);
        }
    }

    private void deleteVideoFile(CTAVideo video) {
        if ("FILESYSTEM".equals(video.getStorageType()) && video.getVideoUrl() != null) {
            try {
                // videoUrl is like /videos/cta-videos/uuid.mp4 — extract just the filename
                String videoUrl = video.getVideoUrl();
                String filename = videoUrl.substring(videoUrl.lastIndexOf("/") + 1);
                Path filePath = Paths.get(uploadDirectory, filename);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    logger.info("Deleted video file: {}", filePath);
                }
            } catch (IOException e) {
                logger.error("Failed to delete video file for video id {}: {}", video.getId(), e.getMessage());
            }
        }
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
