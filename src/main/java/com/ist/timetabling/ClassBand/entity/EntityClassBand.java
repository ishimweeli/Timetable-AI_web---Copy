package com.ist.timetabling.ClassBand.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Table(name = EntityClassBand.TABLE)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityClassBand {

    public static final String TABLE = "class_bands";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "class_band_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "class_band_uuid";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "class_band_organization_id";

    @Column(name = PLAN_SETTINGS_ID)
    private Integer planSettingsId;
    public static final String PLAN_SETTINGS_ID = "class_band_plan_settings_id";

    @Column(name = NAME, nullable = false)
    private String name = "";
    public static final String NAME = "class_band_name";

    @Column(name = CREATED_BY, nullable = false)
    private String createdBy;
    public static final String CREATED_BY = "class_band_created_by";

    @Column(name = DESCRIPTION)
    private String description;
    public static final String DESCRIPTION = "class_band_description";

    @Column(name = MODIFIED_BY, nullable = false)
    private String modifiedBy;
    public static final String MODIFIED_BY = "class_band_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "class_band_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "class_band_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "class_band_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "class_band_is_deleted";

    @Column(name = COLOR)
    private String color;
    public static final String COLOR = "class_band_color";

    @Column(name = MIN_LESSONS_PER_DAY)
    private Integer minLessonsPerDay;
    public static final String MIN_LESSONS_PER_DAY = "class_band_min_lessons_per_day";

    @Column(name = MAX_LESSONS_PER_DAY)
    private Integer maxLessonsPerDay;
    public static final String MAX_LESSONS_PER_DAY = "class_band_max_lessons_per_day";

    @Column(name = LATEST_START_POSITION)
    private Integer latestStartPosition;
    public static final String LATEST_START_POSITION = "class_band_latest_start_position";

    @Column(name = EARLIEST_END)
    private Integer earliestEnd;
    public static final String EARLIEST_END = "class_band_earliest_end";

    @Column(name = MAX_FREE_PERIODS)
    private Integer maxFreePeriods;
    public static final String MAX_FREE_PERIODS = "class_band_max_free_periods";

    @Column(name = PRESENT_EVERY_DAY)
    private Boolean presentEveryDay = false;
    public static final String PRESENT_EVERY_DAY = "class_band_present_every_day";

    @Column(name = CONTROL_NUMBER)
    private Integer controlNumber;
    public static final String CONTROL_NUMBER = "classband_control_number";

    @ManyToMany
    @JoinTable(
            name = "class_band_classes",
            joinColumns = @JoinColumn(name = "class_band_id"),
            inverseJoinColumns = @JoinColumn(name = "class_id")
    )
    @Builder.Default
    private Set<EntityClass> participatingClasses = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "class_band_schedule_preferences",
            joinColumns = @JoinColumn(name = "class_band_id"),
            inverseJoinColumns = @JoinColumn(name = "schedule_preference_id")
    )
    @Builder.Default
    private List<EntitySchedulePreference> schedulePreferences = new ArrayList<>();
}