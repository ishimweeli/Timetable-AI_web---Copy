package com.ist.timetabling.Class.repository;

import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryClass extends JpaRepository<EntityClass, Integer> {

    // Basic derived queries
    Page<EntityClass> findByIsDeletedFalse(final Pageable pageable);

    Page<EntityClass> findByOrganizationIdAndIsDeletedFalse(final Integer organizationId, final Pageable pageable);

    List<EntityClass> findByOrganizationIdAndIsDeletedFalse(final Integer organizationId);

    Optional<EntityClass> findByUuidAndIsDeletedFalse(final String uuid);

    // FIX: Modified this query to always return a single boolean result
    @Query("SELECT (COUNT(c) > 0) FROM EntityClass c " +
            "WHERE c.name = :name AND c.organizationId = :organizationId AND c.isDeleted = false")
    boolean existsByNameAndOrganizationIdAndIsDeletedFalse(@Param("name") final String name,
                                                           @Param("organizationId") final Integer organizationId);

    Page<EntityClass> findByStatusIdAndIsDeletedFalse(final Integer statusId, final Pageable pageable);

    Page<EntityClass> findByStatusIdAndOrganizationIdAndIsDeletedFalse(final Integer statusId,
                                                                       final Integer organizationId,
                                                                       final Pageable pageable);

    // Native queries for search (used for separate search endpoints)
    @Query(value = "SELECT * FROM classes c WHERE c.class_name LIKE CONCAT('%', :keyword, '%') " +
            "AND (c.class_is_deleted IS NULL OR c.class_is_deleted = false)",
            nativeQuery = true)
    List<EntityClass> searchByNameContainingNative(@Param("keyword") final String keyword);

    @Query(value = "SELECT * FROM classes c WHERE c.class_name LIKE CONCAT('%', :keyword, '%') " +
            "AND c.class_organization_id = :orgId " +
            "AND (c.class_is_deleted IS NULL OR c.class_is_deleted = false)",
            nativeQuery = true)
    List<EntityClass> searchByNameContainingAndOrganizationIdNative(@Param("keyword") final String keyword,
                                                                    @Param("orgId") final Integer organizationId);

    long countByIsDeletedFalse();

    long countByOrganizationIdAndIsDeletedFalse(final Integer organizationId);

    List<EntityClass> findBySchedulePreferencesContaining(EntitySchedulePreference schedulePreference);

    @Query("""
            SELECT c FROM EntityClass c
            WHERE (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:orgId IS NULL OR c.organizationId = :orgId)
              AND c.isDeleted = false
            """)
    Page<EntityClass> searchClasses(@Param("keyword") String keyword,
                                    @Param("orgId") Integer orgId,
                                    Pageable pageable);

    @Query("SELECT c.id FROM EntityClass c WHERE c.uuid = :classUuid AND c.isDeleted = false")
    Integer findIdByUuidAndIsDeletedFalse(@Param("classUuid") String classUuid);

    @Query("SELECT cb.id FROM EntityClassBand cb WHERE cb.uuid = :classBandUuid AND cb.isDeleted = false")
    Integer findClassBandIdByUuidAndIsDeletedFalse(@Param("classBandUuid") String classBandUuid);

    List<EntityClass> findAllByIdIn(List<Integer> ids);

    List<EntityClass> findByIdInAndIsDeletedFalse(List<Integer> ids);

    Page<EntityClass> findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(final Integer organizationId, final Integer planSettingsId, final Pageable pageable);
    Page<EntityClass> findByPlanSettingsIdAndIsDeletedFalse(final Integer planSettingsId, final Pageable pageable);
    @Query("""
            SELECT c FROM EntityClass c
            WHERE (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:orgId IS NULL OR c.organizationId = :orgId)
              AND (:planSettingsId IS NULL OR c.planSettingsId = :planSettingsId)
              AND c.isDeleted = false
            """)
    Page<EntityClass> searchClassesWithPlanSettings(@Param("keyword") String keyword,
                                                    @Param("orgId") Integer orgId,
                                                    @Param("planSettingsId") Integer planSettingsId,
                                                    Pageable pageable);

    @Query(value = "SELECT c.* FROM classes c " +
            "JOIN class_schedule_preferences csp ON c.class_id = csp.class_id " +
            "WHERE csp.schedule_preference_id = :preferenceId " +
            "AND c.class_is_deleted = false",
            nativeQuery = true)
    List<EntityClass> findBySchedulePreferenceId(@Param("preferenceId") Integer preferenceId);
}