package com.ist.timetabling.Class.repository;

import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryClassSchedulePreference extends JpaRepository<EntitySchedulePreference, Integer> {
    
    Optional<EntitySchedulePreference> findByUuid(String uuid);
    
    @Query(value = "SELECT sp.* FROM schedule_preferences sp " +
            "JOIN class_schedule_preferences csp ON sp.schedule_preference_id = csp.schedule_preference_id " +
            "WHERE csp.class_id = :classId AND sp.period_id = :periodId AND sp.day_of_week = :dayOfWeek " +
            "AND sp.schedule_preference_is_deleted = false", 
            nativeQuery = true)
    List<EntitySchedulePreference> findByClassIdAndPeriodIdAndDayOfWeek(
            @Param("classId") Integer classId, 
            @Param("periodId") Integer periodId, 
            @Param("dayOfWeek") Integer dayOfWeek);
    
    @Query(value = "SELECT sp.* FROM schedule_preferences sp " +
            "JOIN class_schedule_preferences csp ON sp.schedule_preference_id = csp.schedule_preference_id " +
            "WHERE csp.class_id = :classId " +
            "AND sp.schedule_preference_is_deleted = false", 
            nativeQuery = true)
    List<EntitySchedulePreference> findAllByClassId(@Param("classId") Integer classId);
    
    void deleteByUuid(String uuid);
} 