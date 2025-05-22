package com.ist.timetabling.Class.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import lombok.Data;
import lombok.NoArgsConstructor;


@Table(name = EntityClass.TABLE)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityClass {
    public static final String TABLE = "classes";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "class_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "class_uuid";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "class_organization_id";

    @Column(name = NAME, nullable = false)
    private String name = "";
    public static final String NAME = "class_name";

    @Column(name = SECTION, nullable = false)
    private String section = "";
    public static final String SECTION = "class_subject";

    @Column(name = CREATED_BY, nullable = false)
    private String createdBy;
    public static final String CREATED_BY = "class_created_by";

    @Column(name = DESCRIPTION)
    private String description;
    public static final String DESCRIPTION = "class_description";

    @Column(name = CAPACITY)
    private Integer capacity;
    public static final String CAPACITY = "class_capacity";

    @Column(name = LOCATION_ID)
    private Integer locationId;
    public static final String LOCATION_ID = "class_location_id";

    @Column(name = MODIFIED_BY, nullable = false)
    private String modifiedBy;
    public static final String MODIFIED_BY = "class_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "class_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "class_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "class_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "class_is_deleted";

    @Column(name = INITIAL, nullable = false)
    private String initial = "";
    public static final String INITIAL = "class_initial";

    @Column(name = COLOR)
    private String color;
    public static final String COLOR = "class_color";

    @Column(name = MIN_LESSONS_PER_DAY)
    private Integer minLessonsPerDay;
    public static final String MIN_LESSONS_PER_DAY = "class_min_lessons_per_day";

    @Column(name = MAX_LESSONS_PER_DAY)
    private Integer maxLessonsPerDay;
    public static final String MAX_LESSONS_PER_DAY = "class_max_lessons_per_day";

    @Column(name = LATEST_START_POSITION)
    private Integer latestStartPosition;
    public static final String LATEST_START_POSITION = "class_latest_start_position";

    @Column(name = EARLIEST_END)
    private Integer earliestEnd;
    public static final String EARLIEST_END = "class_earliest_end";

    @Column(name = MAX_FREE_PERIODS)
    private Integer maxFreePeriods;
    public static final String MAX_FREE_PERIODS = "class_max_free_periods";

    @Column(name = PRESENT_EVERY_DAY)
    private Boolean presentEveryDay = false;
    public static final String PRESENT_EVERY_DAY = "class_present_every_day";

    @Column(name = MAIN_TEACHER)
    private String mainTeacher;
    public static final String MAIN_TEACHER = "class_main_teacher";

    @Column(name = INDIVIDUAL_TIMETABLE_ID)
    private Integer individualTimetableId;
    public static final String INDIVIDUAL_TIMETABLE_ID = "class_individual_timetable_id";

    @Column(name = CONTROL_NUMBER)
    private Integer controlNumber;
    public static final String CONTROL_NUMBER = "class_control_number";

    @Column(name = PLAN_SETTINGS_ID)
    private Integer planSettingsId;
    public static final String PLAN_SETTINGS_ID = "class_plan_settings_id";

    @ManyToMany(mappedBy = "classes", fetch = FetchType.LAZY)
    @Builder.Default
    private List<EntityClassGroup> classGroups = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "class_schedule_preferences",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "schedule_preference_id")
    )
    @Builder.Default
    private List<EntitySchedulePreference> schedulePreferences = new ArrayList<>();
} 