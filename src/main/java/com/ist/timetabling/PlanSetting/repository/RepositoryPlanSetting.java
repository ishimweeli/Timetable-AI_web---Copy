package com.ist.timetabling.PlanSetting.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ist.timetabling.PlanSetting.entity.EntityPlanSetting;

@Repository
public interface RepositoryPlanSetting extends JpaRepository<EntityPlanSetting, Integer> {

    Optional<EntityPlanSetting> findByOrganizationId(String organizationId);
    Optional<EntityPlanSetting> findByOrganizationIdAndIsDeletedFalse(String organizationId);

    Optional<EntityPlanSetting> findByUuidAndIsDeletedFalse(final String uuid);

    Optional<EntityPlanSetting> findByOrganizationIdAndCategoryAndIsDeletedFalse(final String organizationId, final String category);

    List<EntityPlanSetting> findAllByOrganizationIdAndIsDeletedFalse(final String organizationId);

    Page<EntityPlanSetting> findAllByOrganizationIdAndIsDeletedFalse(final String organizationId, final Pageable pageable);

    Page<EntityPlanSetting> findAllByOrganizationIdAndNameContainingIgnoreCaseAndIsDeletedFalse(
            final String organizationId, final String name, final Pageable pageable);

    List<EntityPlanSetting> findAllByIsDeletedFalse();

    Page<EntityPlanSetting> findAllByIsDeletedFalse(final Pageable pageable);

    Page<EntityPlanSetting> findAllByNameContainingIgnoreCaseAndIsDeletedFalse(
            final String name, final Pageable pageable);

    boolean existsByOrganizationIdAndCategoryAndIsDeletedFalse(final String organizationId, final String category);

    long countByIsDeletedFalse();

    long countByOrganizationIdAndIsDeletedFalse(final String organizationId);

    @Query(value = "SELECT ps.* FROM planning_settings ps " +
            "WHERE ps.planning_settings_is_deleted = false AND " +
            "(LOWER(ps.planning_settings_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(ps.planning_settings_description) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(ps.planning_settings_category) LIKE CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    List<EntityPlanSetting> searchByNameContainingNative(@Param("keyword") String keyword);

    @Query(value = "SELECT ps.* FROM planning_settings ps " +
            "WHERE ps.planning_settings_is_deleted = false AND " +
            "ps.planning_settings_organization_id = :orgId AND " +
            "(LOWER(ps.planning_settings_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(ps.planning_settings_description) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(ps.planning_settings_category) LIKE CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    List<EntityPlanSetting> searchByNameContainingAndOrganizationId(@Param("keyword") String keyword, @Param("orgId") String orgId);

    EntityPlanSetting findFirstByIsDeletedFalse();

    Optional<EntityPlanSetting> findByOrganizationIdAndIdAndIsDeletedFalse(String organizationId, Integer id);
}
