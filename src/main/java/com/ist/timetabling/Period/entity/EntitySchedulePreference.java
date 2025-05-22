package com.ist.timetabling.Period.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedule_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntitySchedulePreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "schedule_preference_id";

    @UuidGenerator
    @Column(name = UUID, nullable = false, unique = true, updatable = false, length = 36)
    @Builder.Default
    private String uuid = java.util.UUID.randomUUID().toString();
    public static final String UUID = "schedule_preference_uuid";

    @Column(name = IS_AVAILABLE, nullable = true)
    private Boolean isAvailable;
    public static final String IS_AVAILABLE = "is_available";

    @Column(name = CANNOT_TEACH, nullable = true)
    private Boolean cannotTeach;
    public static final String CANNOT_TEACH = "cannot_teach";

    @Column(name = PREFERS_TO_TEACH, nullable = true)
    private Boolean prefersToTeach;
    public static final String PREFERS_TO_TEACH = "prefers_to_teach";

    @Column(name = MUST_TEACH, nullable = true)
    private Boolean mustTeach;
    public static final String MUST_TEACH = "must_teach";

    @Column(name = DONT_PREFER_TO_TEACH, nullable = true)
    private Boolean dontPreferToTeach;
    public static final String DONT_PREFER_TO_TEACH = "dont_prefer_to_teach";

    @Column(name = MUST_NOT_SCHEDULE_CLASS, nullable = true)
    private Boolean mustNotScheduleClass;
    public static final String MUST_NOT_SCHEDULE_CLASS = "must_not_schedule_class";

    @Column(name = MUST_SCHEDULE_CLASS, nullable = true)
    private Boolean mustScheduleClass;
    public static final String MUST_SCHEDULE_CLASS = "must_schedule_class";

    @Column(name = PREFERS_TO_SCHEDULE_CLASS, nullable = true)
    private Boolean prefersToScheduleClass;
    public static final String PREFERS_TO_SCHEDULE_CLASS = "prefers_to_schedule_class";

    @Column(name = PREFER_NOT_TO_SCHEDULE_CLASS, nullable = true)
    private Boolean prefersNotToScheduleClass;
    public static final String PREFER_NOT_TO_SCHEDULE_CLASS = "prefer_not_to_schedule_class";

    @Column(name = APPLIES, nullable = true)
    private Boolean applies;
    public static final String APPLIES = "applies";

    @Column(name = REASON)
    private String reason;
    public static final String REASON = "schedule_preference_reason";

    @Column(name = EFFECTIVE_FROM)
    private LocalDateTime effectiveFrom;
    public static final String EFFECTIVE_FROM = "schedule_preference_effective_from";

    @Column(name = EFFECTIVE_TO)
    private LocalDateTime effectiveTo;
    public static final String EFFECTIVE_TO = "schedule_preference_effective_to";

    @Column(name = IS_RECURRING, nullable = false)
    @Builder.Default
    private Boolean isRecurring = false;
    public static final String IS_RECURRING = "schedule_preference_is_recurring";

    @Column(name = ORGANIZATION_ID, nullable = false)
    @Builder.Default
    private Integer organizationId = 1;
    public static final String ORGANIZATION_ID = "schedule_preference_organization_id";

    @Column(name = CREATED_BY, nullable = false)
    @Builder.Default
    private Integer createdBy = 0;
    public static final String CREATED_BY = "schedule_preference_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    @Builder.Default
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "schedule_preference_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "schedule_preference_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "schedule_preference_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    @Builder.Default
    private Integer statusId = 1;
    public static final String STATUS_ID = "schedule_preference_status_id";

    @Column(name = IS_DELETED, nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "schedule_preference_is_deleted";

    @Column(name = "period_id", nullable = false)
    private Integer periodId;
    public static final String PERIOD_ID = "period_id";

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;
    public static final String DAY_OF_WEEK = "day_of_week";
    
    @Column(name = "plan_settings_id")
    private Integer planSettingsId;
    public static final String PLAN_SETTINGS_ID = "plan_settings_id";
}