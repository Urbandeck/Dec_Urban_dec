package com.digitalframes.shop.repository;

import com.digitalframes.shop.model.FAQ;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FAQRepository extends JpaRepository<FAQ, Long> {
    List<FAQ> findByCategory(String category);
    List<FAQ> findByCategoryAndActiveOrderByDisplayOrder(String category, Boolean active);
    List<FAQ> findByActiveOrderByDisplayOrder(Boolean active);
}