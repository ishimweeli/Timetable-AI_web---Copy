package com.ist.timetabling.PlanSetting.entity;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = EntityPlanSetting.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityPlanSetting {
    public static final String TABLE = "planning_settings";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "planning_settings_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "planning_settings_uuid";

    @Column(name = NAME)
    private String name;
    public static final String NAME = "planning_settings_name";

    @Column(name = DESCRIPTION, length = 1000)
    private String description;
    public static final String DESCRIPTION = "planning_settings_description";

    @Column(name = PERIODS_PER_DAY)
    private Integer periodsPerDay = 0;
    public static final String PERIODS_PER_DAY = "planning_settings_periods_per_day";

    @Column(name = DAYS_PER_WEEK)
    private Integer daysPerWeek = 0;
    public static final String DAYS_PER_WEEK = "planning_settings_days_per_week";

    @Column(name = START_TIME)
    private LocalTime startTime;
    public static final String START_TIME = "planning_settings_start_time";

    @Column(name = END_TIME)
    private LocalTime endTime;
    public static final String END_TIME = "planning_settings_end_time";

    @Column(name = ORGANIZATION_ID)
    private String organizationId;
    public static final String ORGANIZATION_ID = "planning_settings_organization_id";

    @Column(name = CATEGORY)
    private String category = "DEFAULT";
    public static final String CATEGORY = "planning_settings_category";

    @OneToMany(mappedBy = "planningSettings", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EntityTimeBlockType> timeBlockTypes = new ArrayList<>();

    @Column(name = CREATED_BY)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "planning_settings_created_by";

    @Column(name = MODIFIED_BY)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "planning_settings_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "planning_settings_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "planning_settings_modified_date";

    @Column(name = IS_DELETED)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "planning_settings_is_deleted";

    @Column(name = PLAN_TYPE)
    private String planType;
    public static final String PLAN_TYPE = "planning_settings_plan_type";

    @Column(name = PLAN_START_DATE)
    private java.time.LocalDate planStartDate;
    public static final String PLAN_START_DATE = "planning_settings_plan_start_date";

    @Column(name = PLAN_END_DATE)
    private java.time.LocalDate planEndDate;
    public static final String PLAN_END_DATE = "planning_settings_plan_end_date";

    @Column(name = INCLUDE_WEEKENDS)
    private Boolean includeWeekends = true;
    public static final String INCLUDE_WEEKENDS = "planning_settings_include_weekends";
}