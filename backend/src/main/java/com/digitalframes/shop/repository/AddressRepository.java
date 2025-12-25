package com.digitalframes.shop.repository;

import com.digitalframes.shop.model.UserAddress;
import com.digitalframes.shop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserOrderByIsDefaultDescCreatedAtDesc(User user);

    List<UserAddress> findByUser(User user);

    Optional<UserAddress> findByUserAndId(User user, Long id);

    Optional<UserAddress> findByUserAndIsDefaultTrue(User user);

    @Modifying
    @Transactional
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.user = :user AND a.id != :excludeId")
    void resetDefaultAddresses(User user, Long excludeId);

    @Modifying
    @Transactional
    @Query("UPDATE UserAddress a SET a.isDefault = false WHERE a.user = :user")
    void resetAllDefaultAddresses(User user);

    long countByUser(User user);
}