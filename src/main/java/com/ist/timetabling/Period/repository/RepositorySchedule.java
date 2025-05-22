package com.ist.timetabling.Period.repository;

import com.ist.timetabling.Period.entity.EntitySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface RepositorySchedule extends JpaRepository<EntitySchedule, Integer> {

    List<EntitySchedule> findAllByDayOfWeek(Integer dayOfWeek);

    Optional<EntitySchedule> findByPeriodIdAndDayOfWeek(Integer periodId, Integer dayOfWeek);

    @Query("SELECT DISTINCT s.dayOfWeek FROM EntitySchedule s")
    List<Integer> findAllDistinctDaysOfWeek();

    List<EntitySchedule> findAllByPeriodId(Integer periodId);

    boolean existsByDayOfWeekAndPeriodId(Integer dayOfWeek, Integer periodId);

    @Query(value = "" +
            "SELECT s.* FROM schedules s " +
            "JOIN periods p ON s.period_id = p.period_id " +
            "WHERE s.day_of_week = :dayOfWeek " +
            "AND ((" +
            "   :startTime >= p.period_start_time AND :startTime < p.period_end_time" +
            ") OR (" +
            "   :endTime > p.period_start_time AND :endTime <= p.period_end_time" +
            ") OR (" +
            "   p.period_start_time >= :startTime AND p.period_start_time < :endTime" +
            "))",
            nativeQuery = true)
    List<EntitySchedule> findConflictingSchedules(
            @Param("dayOfWeek") Integer dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    Optional<EntitySchedule> findByUuid(String scheduleUuid);

    // In RepositorySchedule
    @Query("SELECT COUNT(s) FROM EntitySchedule s WHERE s.organisationId = :organizationId AND s.isDeleted = false")
    Integer countSchedulesByOrganizationId(@Param("organizationId") Integer organizationId);
}
