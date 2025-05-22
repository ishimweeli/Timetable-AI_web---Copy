package com.ist.timetabling.Organization.repository;

import com.ist.timetabling.Organization.entity.EntityOrganizationUiSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RepositoryOrganizationUiSettings extends JpaRepository<EntityOrganizationUiSettings, Integer> {
    Optional<EntityOrganizationUiSettings> findByOrganizationId(Integer organizationId);
    boolean existsByOrganizationId(Integer organizationId);
} 