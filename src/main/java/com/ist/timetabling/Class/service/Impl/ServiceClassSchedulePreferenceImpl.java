package com.ist.timetabling.Class.service.Impl;

import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.repository.RepositoryClass;
import com.ist.timetabling.Class.repository.RepositoryClassSchedulePreference;
import com.ist.timetabling.Class.service.ServiceClassSchedulePreference;
import com.ist.timetabling.Class.util.UtilClassSchedulePreference;
import com.ist.timetabling.Core.constant.ConstantResponseStatus;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Period.repository.RepositoryPeriod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceClassSchedulePreferenceImpl implements ServiceClassSchedulePreference {

    private final RepositoryClass repositoryClass;
    private final RepositoryClassSchedulePreference repositoryClassSchedulePreference;
    private final RepositoryPeriod repositoryPeriod;

    @Override
    public ApiResponse<EntityClass> addSchedulePreferenceToClass(
            String classUuid,
            Integer periodId,
            Integer dayOfWeek,
            String preferenceType,
            Boolean preferenceValue) {
        
        try {
            // Find the class
            Optional<EntityClass> optionalClass = repositoryClass.findByUuidAndIsDeletedFalse(classUuid);
            if (optionalClass.isEmpty()) {
                return ApiResponse.<EntityClass>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Class not found with UUID: " + classUuid)
                        .success(false)
                        .build();
            }
            
            EntityClass entityClass = optionalClass.get();
            
            // Check if a preference already exists for this time slot
            List<EntitySchedulePreference> existingPreferences = findPreferencesByClassIdAndTimeSlot(
                    entityClass.getId(), periodId, dayOfWeek);
            
            if (!existingPreferences.isEmpty()) {
                // Update the existing preference instead of creating a new one
                EntitySchedulePreference existingPreference = existingPreferences.get(0);
                return updateSchedulePreference(
                        existingPreference.getUuid(),
                        preferenceType,
                        preferenceValue,
                        periodId,
                        dayOfWeek);
            }
            
            // Create new preference
            EntitySchedulePreference preference = createPreference(
                    preferenceType, preferenceValue, periodId, dayOfWeek, entityClass.getOrganizationId());
            
            // Save preference
            preference = repositoryClassSchedulePreference.save(preference);
            
            // Associate with class
            entityClass.getSchedulePreferences().add(preference);
            entityClass = repositoryClass.save(entityClass);
            
            return ApiResponse.<EntityClass>builder()
                    .status(HttpStatus.OK.value())
                    .message("Schedule preference added successfully")
                    .success(true)
                    .data(entityClass)
                    .build();
            
        } catch (Exception e) {
            log.error("Error adding schedule preference to class: {}", e.getMessage(), e);
            return ApiResponse.<EntityClass>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error adding schedule preference: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    @Override
    public ApiResponse<EntityClass> updateSchedulePreference(
            String preferenceUuid,
            String preferenceType,
            Boolean preferenceValue,
            Integer periodId,
            Integer dayOfWeek) {
        
        try {
            Optional<EntitySchedulePreference> optionalPreference = 
                    repositoryClassSchedulePreference.findByUuid(preferenceUuid);
            
            if (optionalPreference.isEmpty()) {
                return ApiResponse.<EntityClass>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Schedule preference not found with UUID: " + preferenceUuid)
                        .success(false)
                        .build();
            }
            
            EntitySchedulePreference preference = optionalPreference.get();
            
            // Reset all preference values
            UtilClassSchedulePreference.resetPreferenceValues(preference);
            
            // Set the requested preference
            UtilClassSchedulePreference.applyPreferenceType(preference, preferenceType, preferenceValue);
            
            // Update period ID and day of week if provided
            if (periodId != null) {
                preference.setPeriodId(periodId);
            }
            
            if (dayOfWeek != null) {
                preference.setDayOfWeek(dayOfWeek);
            }
            
            // Save updated preference
            preference = repositoryClassSchedulePreference.save(preference);
            
            // Find the class associated with this preference
            List<EntityClass> classes = repositoryClass.findBySchedulePreferenceId(preference.getId());
            if (classes.isEmpty()) {
                return ApiResponse.<EntityClass>builder()
                        .status(HttpStatus.OK.value())
                        .message("Schedule preference updated, but no associated class found")
                        .success(true)
                        .build();
            }
            
            EntityClass entityClass = classes.get(0);
            
            return ApiResponse.<EntityClass>builder()
                    .status(HttpStatus.OK.value())
                    .message("Schedule preference updated successfully")
                    .success(true)
                    .data(entityClass)
                    .build();
            
        } catch (Exception e) {
            log.error("Error updating schedule preference: {}", e.getMessage(), e);
            return ApiResponse.<EntityClass>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error updating schedule preference: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    @Override
    public ApiResponse<List<EntityClass>> getClassAllPreferences(String classUuid) {
        try {
            Optional<EntityClass> optionalClass = repositoryClass.findByUuidAndIsDeletedFalse(classUuid);
            if (optionalClass.isEmpty()) {
                return ApiResponse.<List<EntityClass>>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Class not found with UUID: " + classUuid)
                        .success(false)
                        .build();
            }
            
            EntityClass entityClass = optionalClass.get();
            
            // The preferences are already loaded via the relationship
            return ApiResponse.<List<EntityClass>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Class preferences retrieved successfully")
                    .success(true)
                    .data(Collections.singletonList(entityClass))
                    .build();
            
        } catch (Exception e) {
            log.error("Error retrieving class preferences: {}", e.getMessage(), e);
            return ApiResponse.<List<EntityClass>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error retrieving class preferences: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    @Override
    public ApiResponse<EntityClass> getClassPreferenceForSchedule(
            String classUuid,
            Integer periodId,
            Integer dayOfWeek) {
        
        try {
            Optional<EntityClass> optionalClass = repositoryClass.findByUuidAndIsDeletedFalse(classUuid);
            if (optionalClass.isEmpty()) {
                return ApiResponse.<EntityClass>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Class not found with UUID: " + classUuid)
                        .success(false)
                        .build();
            }
            
            EntityClass entityClass = optionalClass.get();
            
            // Find preferences for the specified time slot
            List<EntitySchedulePreference> preferences = findPreferencesByClassIdAndTimeSlot(
                    entityClass.getId(), periodId, dayOfWeek);
            
            // Filter the class preferences to only include the matching ones
            entityClass.setSchedulePreferences(preferences);
            
            return ApiResponse.<EntityClass>builder()
                    .status(HttpStatus.OK.value())
                    .message("Class preference for schedule retrieved successfully")
                    .success(true)
                    .data(entityClass)
                    .build();
            
        } catch (Exception e) {
            log.error("Error retrieving class preference for schedule: {}", e.getMessage(), e);
            return ApiResponse.<EntityClass>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error retrieving class preference for schedule: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    @Override
    public ApiResponse<?> clearClassPreferencesForSchedule(
            String classUuid,
            Integer periodId,
            Integer dayOfWeek) {
        
        try {
            Optional<EntityClass> optionalClass = repositoryClass.findByUuidAndIsDeletedFalse(classUuid);
            if (optionalClass.isEmpty()) {
                return ApiResponse.builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Class not found with UUID: " + classUuid)
                        .success(false)
                        .build();
            }
            
            EntityClass entityClass = optionalClass.get();
            
            // Find preferences for the specified time slot
            List<EntitySchedulePreference> preferences = findPreferencesByClassIdAndTimeSlot(
                    entityClass.getId(), periodId, dayOfWeek);
            
            if (preferences.isEmpty()) {
                return ApiResponse.builder()
                        .status(HttpStatus.OK.value())
                        .message("No preferences found for the specified schedule")
                        .success(true)
                        .build();
            }
            
            // Soft delete preferences
            for (EntitySchedulePreference preference : preferences) {
                preference.setIsDeleted(true);
                repositoryClassSchedulePreference.save(preference);
            }
            
            return ApiResponse.builder()
                    .status(HttpStatus.OK.value())
                    .message("Class preferences for schedule cleared successfully")
                    .success(true)
                    .build();
            
        } catch (Exception e) {
            log.error("Error clearing class preferences for schedule: {}", e.getMessage(), e);
            return ApiResponse.builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error clearing class preferences for schedule: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    @Override
    public ApiResponse<?> deleteClassSchedulePreference(String uuid) {
        try {
            Optional<EntitySchedulePreference> optionalPreference = 
                    repositoryClassSchedulePreference.findByUuid(uuid);
            
            if (optionalPreference.isEmpty()) {
                return ApiResponse.builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Schedule preference not found with UUID: " + uuid)
                        .success(false)
                        .build();
            }
            
            EntitySchedulePreference preference = optionalPreference.get();
            preference.setIsDeleted(true);
            repositoryClassSchedulePreference.save(preference);
            
            return ApiResponse.builder()
                    .status(HttpStatus.OK.value())
                    .message("Schedule preference deleted successfully")
                    .success(true)
                    .build();
            
        } catch (Exception e) {
            log.error("Error deleting schedule preference: {}", e.getMessage(), e);
            return ApiResponse.builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error deleting schedule preference: " + e.getMessage())
                    .success(false)
                    .build();
        }
    }

    @Override
    public List<EntitySchedulePreference> findPreferencesByClassId(Integer classId) {
        return repositoryClassSchedulePreference.findAllByClassId(classId);
    }

    @Override
    public List<EntitySchedulePreference> findPreferencesByClassIdAndTimeSlot(
            Integer classId,
            Integer periodId,
            Integer dayOfWeek) {
        
        return repositoryClassSchedulePreference.findByClassIdAndPeriodIdAndDayOfWeek(
                classId, periodId, dayOfWeek);
    }
    
    // Helper methods
    
    private EntitySchedulePreference createPreference(
            String preferenceType,
            Boolean preferenceValue,
            Integer periodId,
            Integer dayOfWeek,
            Integer organizationId) {
        
        EntitySchedulePreference preference = new EntitySchedulePreference();
        preference.setUuid(java.util.UUID.randomUUID().toString());
        preference.setPeriodId(periodId);
        preference.setDayOfWeek(dayOfWeek);
        preference.setOrganizationId(organizationId);
        preference.setIsDeleted(false);
        preference.setStatusId(ConstantResponseStatus.ACTIVE);
        preference.setIsRecurring(false);
        preference.setCreatedBy(0); // Should be replaced with actual user ID
        preference.setModifiedBy(0); // Should be replaced with actual user ID
        
        UtilClassSchedulePreference.applyPreferenceType(preference, preferenceType, preferenceValue);
        
        return preference;
    }
} 