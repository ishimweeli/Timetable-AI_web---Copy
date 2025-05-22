package com.ist.timetabling.ClassBand.repository;

import com.ist.timetabling.ClassBand.entity.EntityClassBand;
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
public interface RepositoryClassBand extends JpaRepository<EntityClassBand, Integer> {

    Optional<EntityClassBand> findByUuidAndIsDeletedFalse(String uuid);

    Page<EntityClassBand> findByIsDeletedFalse(Pageable pageable);

    Page<EntityClassBand> findByStatusIdAndIsDeletedFalse(Integer statusId, Pageable pageable);

    boolean existsByNameAndOrganizationIdAndIsDeletedFalse(String name, Integer organizationId);

    @Query("SELECT cb FROM EntityClassBand cb WHERE cb.isDeleted = false AND LOWER(cb.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<EntityClassBand> searchByNameContainingNative(@Param("keyword") String keyword);

    List<EntityClassBand> findBySchedulePreferencesContaining(EntitySchedulePreference schedulePreference);

    Page<EntityClassBand> findByOrganizationIdAndIsDeletedFalse(Integer orgId, Pageable pageable);

    List<EntityClassBand> searchByNameContainingAndOrganizationId(String keyword, Integer orgId);

    Page<EntityClassBand> findByStatusIdAndOrganizationIdAndIsDeletedFalse(Integer statusId, Integer orgId, Pageable pageable);

    @Query("SELECT cb.id FROM EntityClassBand cb JOIN cb.participatingClasses c WHERE c.id = :classId AND cb.isDeleted = false")
    List<Integer> findBandIdsByClassId(@Param("classId") Integer classId);

    Page<EntityClassBand> findByPlanSettingsIdAndIsDeletedFalse(Integer planSettingsId, Pageable pageable);
    
    Page<EntityClassBand> findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(Integer organizationId, Integer planSettingsId, Pageable pageable);
    
    @Query("SELECT cb FROM EntityClassBand cb WHERE (:keyword IS NULL OR LOWER(cb.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:orgId IS NULL OR cb.organizationId = :orgId) " +
           "AND (:planSettingsId IS NULL OR cb.planSettingsId = :planSettingsId) " +
           "AND cb.isDeleted = false")
    Page<EntityClassBand> searchClassBandsWithPlanSettings(
            @Param("keyword") String keyword,
            @Param("orgId") Integer orgId,
            @Param("planSettingsId") Integer planSettingsId,
            Pageable pageable);
            
    @Query("SELECT cb FROM EntityClassBand cb WHERE LOWER(cb.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "AND cb.planSettingsId = :planSettingsId " +
           "AND cb.isDeleted = false")
    List<EntityClassBand> searchByNameContainingAndPlanSettingsId(@Param("keyword") String keyword, @Param("planSettingsId") Integer planSettingsId);
    
    @Query("SELECT cb FROM EntityClassBand cb WHERE LOWER(cb.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "AND cb.organizationId = :orgId " +
           "AND cb.planSettingsId = :planSettingsId " +
           "AND cb.isDeleted = false")
    List<EntityClassBand> searchByNameContainingAndOrganizationIdAndPlanSettingsId(
            @Param("keyword") String keyword, 
            @Param("orgId") Integer orgId,
            @Param("planSettingsId") Integer planSettingsId);
}