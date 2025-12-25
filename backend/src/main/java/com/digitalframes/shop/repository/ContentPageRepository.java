package com.digitalframes.shop.repository;

import com.digitalframes.shop.model.ContentPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentPageRepository extends JpaRepository<ContentPage, Long> {
    Optional<ContentPage> findBySlug(String slug);
    Optional<ContentPage> findBySlugAndActive(String slug, Boolean active);
}