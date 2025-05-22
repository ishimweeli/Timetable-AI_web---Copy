package com.ist.timetabling.Rule.repository;

import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Rule.entity.EntityRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryRule extends JpaRepository<EntityRule, Integer> {

    Page<EntityRule> findByIsDeletedFalse(Pageable pageable);

    Page<EntityRule> findByOrganizationIdAndIsDeletedFalse(Integer organizationId, Pageable pageable);

    Optional<EntityRule> findByUuidAndIsDeletedFalse(String uuid);

    boolean existsByNameAndOrganizationIdAndIsDeletedFalse(String name, Integer organizationId);

    Page<EntityRule> findByStatusIdAndIsDeletedFalse(Integer statusId, Pageable pageable);

    Page<EntityRule> findByStatusIdAndOrganizationIdAndIsDeletedFalse(Integer statusId, Integer organizationId, Pageable pageable);

    @Query(value = """
            SELECT * FROM rules r
            WHERE r.rule_name LIKE CONCAT('%', :keyword, '%')
              AND (r.rule_is_deleted IS NULL OR r.rule_is_deleted = false)
            ORDER BY r.rule_name ASC
            """,
            nativeQuery = true)
    List<EntityRule> searchByNameContainingNative(@Param("keyword") String keyword);

    @Query(value = """
            SELECT * FROM rules r
            WHERE r.rule_name LIKE CONCAT('%', :keyword, '%')
              AND r.rule_organization_id = :orgId
              AND (r.rule_is_deleted IS NULL OR r.rule_is_deleted = false)
            ORDER BY r.rule_name ASC
            """,
            nativeQuery = true)
    List<EntityRule> searchByNameContainingAndOrganizationId(@Param("keyword") String keyword, @Param("orgId") Integer organizationId);

    List<EntityRule> findBySchedulePreferencesContaining(EntitySchedulePreference schedulePreference);

    long countByIsDeletedFalse();

    long countByOrganizationIdAndIsDeletedFalse(Integer organizationId);

    @Query(value = """
            SELECT * FROM rules r
            WHERE r.rule_name LIKE CONCAT('%', :keyword, '%')
              AND (r.rule_is_deleted IS NULL OR r.rule_is_deleted = false)
            ORDER BY r.rule_name ASC
            """,
            countQuery = """
            SELECT count(*) FROM rules r
            WHERE r.rule_name LIKE CONCAT('%', :keyword, '%')
              AND (r.rule_is_deleted IS NULL OR r.rule_is_deleted = false)
            """,
            nativeQuery = true)
    Page<EntityRule> searchByNameContainingNativePage(@Param("keyword") String keyword, Pageable pageable);

    @Query(value = """
            SELECT * FROM rules r
            WHERE r.rule_name LIKE CONCAT('%', :keyword, '%')
              AND r.rule_organization_id = :orgId
              AND (r.rule_is_deleted IS NULL OR r.rule_is_deleted = false)
            ORDER BY r.rule_name ASC
            """,
            countQuery = """
            SELECT count(*) FROM rules r
            WHERE r.rule_name LIKE CONCAT('%', :keyword, '%')
              AND r.rule_organization_id = :orgId
              AND (r.rule_is_deleted IS NULL OR r.rule_is_deleted = false)
            """,
            nativeQuery = true)
    Page<EntityRule> searchByNameContainingAndOrganizationIdPage(@Param("keyword") String keyword, @Param("orgId") Integer organizationId, Pageable pageable);

    Page<EntityRule> findByPlanSettingsIdAndIsDeletedFalse(Integer planSettingsId, Pageable pageable);
    
    Page<EntityRule> findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(Integer organizationId, Integer planSettingsId, Pageable pageable);
    
    @Query("""
        SELECT r FROM EntityRule r 
        WHERE (:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:orgId IS NULL OR r.organizationId = :orgId)
          AND (:planSettingsId IS NULL OR r.planSettingsId = :planSettingsId)
          AND r.isDeleted = false
    """)
    Page<EntityRule> searchRulesWithPlanSettings(
        @Param("keyword") String keyword,
        @Param("orgId") Integer orgId,
        @Param("planSettingsId") Integer planSettingsId,
        Pageable pageable);
}
