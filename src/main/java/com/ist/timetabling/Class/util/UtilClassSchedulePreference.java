package com.ist.timetabling.Class.util;

import com.ist.timetabling.Class.model.ClassSchedulePreference;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for handling class schedule preferences
 */
public class UtilClassSchedulePreference {

    /**
     * Convert an EntitySchedulePreference to a ClassSchedulePreference model
     */
    public static ClassSchedulePreference toModel(EntitySchedulePreference entity) {
        if (entity == null) {
            return null;
        }
        
        return ClassSchedulePreference.builder()
                .id(entity.getId())
                .uuid(entity.getUuid())
                .periodId(entity.getPeriodId())
                .dayOfWeek(entity.getDayOfWeek())
                .mustScheduleClass(entity.getMustScheduleClass())
                .mustNotScheduleClass(entity.getMustNotScheduleClass())
                .prefersToScheduleClass(entity.getPrefersToScheduleClass())
                .prefersNotToScheduleClass(entity.getPrefersNotToScheduleClass())
                .reason(entity.getReason())
                .effectiveFrom(entity.getEffectiveFrom())
                .effectiveTo(entity.getEffectiveTo())
                .isRecurring(entity.getIsRecurring())
                .organizationId(entity.getOrganizationId())
                .createdBy(entity.getCreatedBy())
                .modifiedBy(entity.getModifiedBy())
                .createdDate(entity.getCreatedDate())
                .modifiedDate(entity.getModifiedDate())
                .statusId(entity.getStatusId())
                .isDeleted(entity.getIsDeleted())
                .build();
    }
    
    /**
     * Convert a list of EntitySchedulePreference to a list of ClassSchedulePreference models
     */
    public static List<ClassSchedulePreference> toModels(List<EntitySchedulePreference> entities) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(UtilClassSchedulePreference::toModel)
                .collect(Collectors.toList());
    }
    
    /**
     * Apply preferred schedule type to an entity based on the preference type
     */
    public static void applyPreferenceType(EntitySchedulePreference entity, String preferenceType, Boolean value) {
        switch (preferenceType) {
            case "must_schedule_class":
                entity.setMustScheduleClass(value);
                break;
            case "must_not_schedule_class":
                entity.setMustNotScheduleClass(value);
                break;
            case "prefers_to_schedule_class":
                entity.setPrefersToScheduleClass(value);
                break;
            case "prefer_not_to_schedule_class":
            case "prefers_not_to_schedule_class":
                entity.setPrefersNotToScheduleClass(value);
                break;
            case "cannot_teach":
                entity.setCannotTeach(value);
                break;
            case "prefers_to_teach":
                entity.setPrefersToTeach(value);
                break;
            case "must_teach":
                entity.setMustTeach(value);
                break;
            case "dont_prefer_to_teach":
                entity.setDontPreferToTeach(value);
                break;
            default:
                // No matching preference type
                break;
        }
    }
    
    /**
     * Reset all preference values on an entity
     */
    public static void resetPreferenceValues(EntitySchedulePreference entity) {
        entity.setMustScheduleClass(false);
        entity.setMustNotScheduleClass(false);
        entity.setPrefersToScheduleClass(false);
        entity.setPrefersNotToScheduleClass(false);
        entity.setCannotTeach(false);
        entity.setPrefersToTeach(false);
        entity.setMustTeach(false);
        entity.setDontPreferToTeach(false);
    }
} 