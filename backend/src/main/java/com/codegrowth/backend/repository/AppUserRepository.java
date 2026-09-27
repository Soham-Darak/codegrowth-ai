package com.codegrowth.backend.repository;

import com.codegrowth.backend.entity.AppUser;
import com.codegrowth.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);
    Optional<AppUser> findByProviderAndProviderId(String provider, String providerId);
}
