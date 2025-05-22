package com.ist.timetabling.Class.service;

import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;

import java.util.List;

public interface ServiceClassSchedulePreference {

    ApiResponse<EntityClass> addSchedulePreferenceToClass(
            String classUuid,
            Integer periodId,
            Integer dayOfWeek,
            String preferenceType,
            Boolean preferenceValue);
    
    ApiResponse<EntityClass> updateSchedulePreference(
            String preferenceUuid,
            String preferenceType,
            Boolean preferenceValue,
            Integer periodId,
            Integer dayOfWeek);
    
    ApiResponse<List<EntityClass>> getClassAllPreferences(String classUuid);
    
    ApiResponse<EntityClass> getClassPreferenceForSchedule(
            String classUuid,
            Integer periodId,
            Integer dayOfWeek);
    
    ApiResponse<?> clearClassPreferencesForSchedule(
            String classUuid,
            Integer periodId,
            Integer dayOfWeek);
    
    ApiResponse<?> deleteClassSchedulePreference(String uuid);
    
    List<EntitySchedulePreference> findPreferencesByClassId(Integer classId);
    
    List<EntitySchedulePreference> findPreferencesByClassIdAndTimeSlot(
            Integer classId,
            Integer periodId,
            Integer dayOfWeek);
} 