package com.ist.timetabling.Timetable.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.ist.timetabling.Timetable.util.IntegerListJsonConverter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = EntityTimetable.TABLE)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityTimetable {

    public static final String TABLE = "timetables";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "timetable_id";

    @UuidGenerator
    @Column(name = UUID, columnDefinition = "char(36)")
    private String uuid;
    public static final String UUID = "timetable_uuid";

    @Column(name = ORGANIZATION_ID, nullable = false)
    @Builder.Default
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "timetable_organization_id";

    @Column(name = PLANSETTING_ID, nullable = false)
    @Builder.Default
    private Integer plansettingId = 0;
    public static final String PLANSETTING_ID = "planSettings_id";


    @Column(name = NAME, nullable = false)
    @Builder.Default
    private String name = "";
    public static final String NAME = "timetable_name";

    @Column(name = ACADEMIC_YEAR, nullable = false)
    @Builder.Default
    private String academicYear = "";
    public static final String ACADEMIC_YEAR = "timetable_academic_year";

    @Column(name = SEMESTER, nullable = false)
    @Builder.Default
    private String semester = "";
    public static final String SEMESTER = "timetable_semester";

    @Column(name = GENERATED_BY)
    @Builder.Default
    private String generatedBy = "";
    public static final String GENERATED_BY = "timetable_generated_by";

    @Column(name = VIEW_TYPE)
    @Builder.Default
    private String viewType = "";
    public static final String VIEW_TYPE = "timetable_view_type";

    @Column(name = VIEW_ID)
    @Builder.Default
    private String viewId = "";
    public static final String VIEW_ID = "timetable_view_id";

    @Column(name = VIEW_NAME)
    @Builder.Default
    private String viewName = "";
    public static final String VIEW_NAME = "timetable_view_name";

    @Column(name = DESCRIPTION, columnDefinition = "TEXT")
    @Builder.Default
    private String description = "";
    public static final String DESCRIPTION = "timetable_description";

    @Column(name = SCHOOL_START_TIME)
    @Builder.Default
    private String schoolStartTime = "";
    public static final String SCHOOL_START_TIME = "timetable_school_start_time";

    @Column(name = SCHOOL_END_TIME)
    @Builder.Default
    private String schoolEndTime = "";
    public static final String SCHOOL_END_TIME = "timetable_school_end_time";

    @Column(name = START_DAY)
    @Builder.Default
    private Integer startDay = 1;
    public static final String START_DAY = "timetable_start_day";

    @Column(name = END_DAY)
    @Builder.Default
    private Integer endDay = 5;
    public static final String END_DAY = "timetable_end_day";

    @Column(name = CACHED_DATA, columnDefinition = "TEXT")
    @Builder.Default
    private String cachedData = "";
    public static final String CACHED_DATA = "timetable_cached_data";

    @Column(name = START_DATE)
    private LocalDateTime startDate;
    public static final String START_DATE = "timetable_start_date";

    @Column(name = END_DATE)
    private LocalDateTime endDate;
    public static final String END_DATE = "timetable_end_date";

    @Column(name = IS_PUBLISHED, nullable = false)
    @Builder.Default
    private Boolean isPublished = false;
    public static final String IS_PUBLISHED = "timetable_is_published";

    @Column(name = CREATED_BY, nullable = false)
    @Builder.Default
    private Long createdBy = 0L;
    public static final String CREATED_BY = "timetable_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    @Builder.Default
    private Long modifiedBy = 0L;
    public static final String MODIFIED_BY = "timetable_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "timetable_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "timetable_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    @Builder.Default
    private Integer statusId = 0;
    public static final String STATUS_ID = "timetable_status_id";

    @Column(name = IS_DELETED, nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "timetable_is_deleted";

    @Column(name = PLAN_SETTING_UUID)
    private String planSettingUuid = "";
    public static final String PLAN_SETTING_UUID = "timetable_plan_setting_uuid";

    @Column(name = PLAN_START_DATE)
    private java.time.LocalDate planStartDate;
    public static final String PLAN_START_DATE = "timetable_plan_start_date";

    @Column(name = PLAN_END_DATE)
    private java.time.LocalDate planEndDate;
    public static final String PLAN_END_DATE = "timetable_plan_end_date";

    @Column(name = INCLUDE_WEEKENDS)
    private Boolean includeWeekends = false;
    public static final String INCLUDE_WEEKENDS = "timetable_include_weekends";

    @Column(name = GENERATED_DATE)
    private LocalDateTime generatedDate;
    public static final String GENERATED_DATE = "timetable_generated_date";

    @Column(name = GENERATION_DURATION)
    private Integer generationDuration = 0;
    public static final String GENERATION_DURATION = "timetable_generation_duration";

    @Column(name = GENERATION_SUCCESS_COUNT)
    private Integer generationSuccessCount = 0;
    public static final String GENERATION_SUCCESS_COUNT = "timetable_generation_success_count";

    @Column(name = GENERATION_FAILURE_COUNT)
    private Integer generationFailureCount = 0;
    public static final String GENERATION_FAILURE_COUNT = "timetable_generation_failure_count";

    @Column(name = "timetable_plan")
    @Convert(converter = IntegerListJsonConverter.class)
    private java.util.List<Integer> timetablePlan;

}
