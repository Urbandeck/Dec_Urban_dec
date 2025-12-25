package com.digitalframes.shop.repository;

import com.digitalframes.shop.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, Long> {
    Optional<Settings> findBySettingKey(String settingKey);
    List<Settings> findBySettingGroup(String settingGroup);
}