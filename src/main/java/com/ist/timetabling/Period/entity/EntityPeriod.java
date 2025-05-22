package com.ist.timetabling.Period.entity;

import com.ist.timetabling.Period.util.DaysConverter;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Table(name = EntityPeriod.TABLE)
@Entity(name = "EntityPeriod")
@Data
@NoArgsConstructor
public class EntityPeriod {

    public static final String TABLE = "periods";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "period_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "period_uuid";

    @Column(name = NAME, nullable = false)
    private String name;
    public static final String NAME = "period_name";

    @Column(name = START_TIME, nullable = false)
    private LocalTime startTime;
    public static final String START_TIME = "period_start_time";

    @Column(name = END_TIME, nullable = false)
    private LocalTime endTime;
    public static final String END_TIME = "period_end_time";

    @Column(name = DURATION_MINUTES, nullable = false)
    private Integer durationMinutes;
    public static final String DURATION_MINUTES = "period_duration_minutes";

    @Column(name = PERIOD_TYPE, nullable = false)
    private String periodType;
    public static final String PERIOD_TYPE = "period_type";

    @Column(name = DAYS, nullable = false)
    @Convert(converter = DaysConverter.class)
    private List<Integer> days;
    public static final String DAYS = "period_days";

    @Column(name = ALLOW_SCHEDULING, nullable = false)
    private Boolean allowScheduling = true;
    public static final String ALLOW_SCHEDULING = "period_allow_scheduling";

    @Column(name = SHOW_IN_TIMETABLE, nullable = false)
    private Boolean showInTimetable = true;
    public static final String SHOW_IN_TIMETABLE = "period_show_in_timetable";

    @Column(name = ALLOW_CONFLICTS, nullable = false)
    private Boolean allowConflicts = false;
    public static final String ALLOW_CONFLICTS = "period_allow_conflicts";

    @Column(name = ALLOW_LOCATION_CHANGE, nullable = false)
    private Boolean allowLocationChange = false;
    public static final String ALLOW_LOCATION_CHANGE = "period_allow_location_change";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 1;
    public static final String ORGANIZATION_ID = "period_organization_id";

    @Column(name = PLAN_SETTINGS_ID)
    private Integer planSettingsId;
    public static final String PLAN_SETTINGS_ID = "period_plan_settings_id";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "period_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 1;
    public static final String MODIFIED_BY = "period_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "period_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "period_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "period_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "period_is_deleted";

    @Column(name = PERIOD_NUMBER, nullable = false)
    private Integer periodNumber;
    public static final String PERIOD_NUMBER = "period_number";

}
