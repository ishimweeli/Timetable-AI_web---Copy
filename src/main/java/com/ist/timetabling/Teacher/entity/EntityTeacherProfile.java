package com.ist.timetabling.Teacher.entity;

import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teacher_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityTeacherProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "teacher_profile_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "teacher_profile_uuid";

    @Column(name = USER_ID, nullable = false)
    private Integer userId;
    public static final String USER_ID = "user_id";

    @Column(name = ORGANIZATION_ID)
    private Integer organizationId;
    public static final String ORGANIZATION_ID = "organization_id";

    @Column(name = PLAN_SETTINGS_ID)
    private Integer planSettingsId;
    public static final String PLAN_SETTINGS_ID = "plan_settings_id";

    @Column(name = BIO)
    private String bio;
    public static final String BIO = "bio";

    @Column(name = INITIALS)
    private String initials;
    public static final String INITIALS = "initials";

    @Column(name = DEPARTMENT)
    private String department;
    public static final String DEPARTMENT = "department";

    @Column(name = QUALIFICATION)
    private String qualification;
    public static final String QUALIFICATION = "qualification";

    @Column(name = CONTRACT_TYPE)
    private String contractType;
    public static final String CONTRACT_TYPE = "contract_type";

    @Column(name = CONTROL_NUMBER)
    private Integer controlNumber;
    public static final String CONTROL_NUMBER = "control_number";

    @Column(name = NOTES)
    private String notes;
    public static final String NOTES = "notes";

    @Column(name = PREFERRED_START_TIME)
    private LocalTime preferredStartTime;
    public static final String PREFERRED_START_TIME = "preferred_start_time";

    @Column(name = PREFERRED_END_TIME)
    private LocalTime preferredEndTime;
    public static final String PREFERRED_END_TIME = "preferred_end_time";

    @Column(name = MAX_DAILY_HOURS)
    private Integer maxDailyHours;
    public static final String MAX_DAILY_HOURS = "max_daily_hours";
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = PRIMARY_SCHEDULE_PREFERENCE_ID)
    private EntitySchedulePreference primarySchedulePreference;
    public static final String PRIMARY_SCHEDULE_PREFERENCE_ID = "primary_schedule_preference_id";

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "teacher_schedule_preferences",
            joinColumns = @JoinColumn(name = "teacher_profile_id"),
            inverseJoinColumns = @JoinColumn(name = "schedule_preference_id")
    )
    @Builder.Default
    private List<EntitySchedulePreference> schedulePreferences = new ArrayList<>();

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "modified_date";

    @Column(name = CREATED_BY)
    @Builder.Default
    private Integer createdBy = 0;
    public static final String CREATED_BY = "created_by";

    @Column(name = MODIFIED_BY)
    @Builder.Default
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "modified_by";

    @Column(name = STATUS_ID, nullable = false)
    @Builder.Default
    private Integer statusId = 1;
    public static final String STATUS_ID = "status_id";

    @Column(name = IS_DELETED, nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "is_deleted";
}