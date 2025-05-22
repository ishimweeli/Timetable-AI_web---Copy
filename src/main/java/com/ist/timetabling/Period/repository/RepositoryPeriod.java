package com.ist.timetabling.Period.repository;

import com.ist.timetabling.Period.entity.EntityPeriod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryPeriod extends JpaRepository<EntityPeriod, Integer> {

    Optional<EntityPeriod> findByUuidAndIsDeletedFalse(final String uuid);

    @Query("SELECT p FROM EntityPeriod p WHERE p.isDeleted = false ORDER BY p.startTime ASC")
    List<EntityPeriod> findAllByIsDeletedFalse();

    @Query("SELECT p FROM EntityPeriod p WHERE p.organizationId = :organizationId AND p.isDeleted = false ORDER BY p.startTime ASC")
    List<EntityPeriod> findAllByOrganizationIdAndIsDeletedFalse(Integer organizationId);

    Page<EntityPeriod> findByOrganizationIdAndIsDeletedFalse(Integer organizationId, Pageable pageable);

    Page<EntityPeriod> findByIsDeletedFalse(Pageable pageable);

    long countByIsDeletedFalse();

    EntityPeriod findByUuid(String uuid);

    @Query(value = "SELECT p.* FROM periods p WHERE p.is_deleted = false AND (LOWER(p.period_name) LIKE %:keyword% OR LOWER(p.period_type) LIKE %:keyword%)", nativeQuery = true)
    List<EntityPeriod> searchByNameContainingNative(@Param("keyword") String keyword);

    @Query(value = "SELECT p.* FROM periods p WHERE p.is_deleted = false AND p.organization_id = :orgId AND (LOWER(p.period_name) LIKE %:keyword% OR LOWER(p.period_type) LIKE %:keyword%)", nativeQuery = true)
    List<EntityPeriod> searchByNameContainingAndOrganizationId(@Param("keyword") String keyword, @Param("orgId") Integer orgId);
    List<EntityPeriod> findByOrganizationId(Integer orgId);

    List<EntityPeriod> findByPlanSettingsIdOrderByPeriodNumber(Integer planSettingsId);
    
    List<EntityPeriod> findByPlanSettingsIdAndIsDeletedFalse(Integer planSettingsId);
    
    List<EntityPeriod> findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(Integer organizationId, Integer planSettingsId);

    List<EntityPeriod> findByUuidInAndIsDeletedFalse(List<String> uuids);

}