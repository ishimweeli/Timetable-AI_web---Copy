package com.ist.timetabling.Period.repository;

import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorySchedulePreference extends JpaRepository<EntitySchedulePreference, Long> {

    Optional<EntitySchedulePreference> findByUuid(String uuid);

    @Query("SELECT sp FROM EntitySchedulePreference sp " +
            "WHERE sp.organizationId = :organizationId " +
            "AND sp.isDeleted = false " +
            "AND (sp.effectiveFrom IS NULL OR sp.effectiveFrom <= :currentDate) " +
            "AND (sp.effectiveTo IS NULL OR sp.effectiveTo >= :currentDate)")
    List<EntitySchedulePreference> findAllActiveByOrganizationId(
            @Param("organizationId") Long organizationId,
            @Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT sp FROM EntitySchedulePreference sp " +
            "WHERE sp.dayOfWeek = :dayOfWeek " +
            "AND sp.isDeleted = false")
    List<EntitySchedulePreference> findAllByDayOfWeek(@Param("dayOfWeek") Integer dayOfWeek);

    // Find preferences by specific boolean preference type
    @Query("SELECT sp FROM EntitySchedulePreference sp " +
            "WHERE sp.cannotTeach = true " +
            "AND sp.isDeleted = false")
    List<EntitySchedulePreference> findAllCannotTeachPreferences();

    @Query("SELECT sp FROM EntitySchedulePreference sp " +
            "WHERE sp.prefersToTeach = true " +
            "AND sp.isDeleted = false")
    List<EntitySchedulePreference> findAllPrefersToTeachPreferences();

    @Query("SELECT sp FROM EntitySchedulePreference sp " +
            "WHERE sp.mustTeach = true " +
            "AND sp.isDeleted = false")
    List<EntitySchedulePreference> findAllMustTeachPreferences();

    @Query("SELECT sp FROM EntitySchedulePreference sp " +
            "WHERE sp.dontPreferToTeach = true " +
            "AND sp.isDeleted = false")
    List<EntitySchedulePreference> findAllDontPreferToTeachPreferences();

    Optional<EntitySchedulePreference> findByUuidAndIsDeletedFalse(String uuid);

    @Query("SELECT sp FROM EntitySchedulePreference sp WHERE sp.id IN :ids")
    List<EntitySchedulePreference> findAllByIdIn(@Param("ids") List<Integer> schedulePreferenceIds);

    List<EntitySchedulePreference> findAllByPeriodIdAndDayOfWeek(Integer periodId, Integer dayOfWeek);

}