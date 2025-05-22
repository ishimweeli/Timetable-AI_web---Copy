package com.ist.timetabling.Rule.entity;

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
import java.util.ArrayList;
import java.util.List;


@Table(name = EntityRule.TABLE)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityRule {

    public static final String TABLE = "rules";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Long id;
    public static final String ID = "rule_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "rule_uuid";

    @Column(name = NAME, nullable = false)
    private String name = "";
    public static final String NAME = "rule_name";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "rule_organization_id";

    @Column(name = PLAN_SETTINGS_ID)
    private Integer planSettingsId;
    public static final String PLAN_SETTINGS_ID = "rule_plan_settings_id";

    @Column(name = TYPE, nullable = false)
    private String initials = "";
    public static final String TYPE = "rule_type";

    @Lob
    @Column(name = DATA, nullable = false)
    private String data = "{}";
    public static final String DATA = "rule_data";

    @Column(name = PRIORITY, nullable = false)
    private int priority = 0;
    public static final String PRIORITY = "rule_priority";

    @Column(name = IS_ENABLED, nullable = false)
    private boolean isEnabled = false;
    public static final String IS_ENABLED = "rule_is_enabled";

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "rule_schedule_preferences",
            joinColumns = @JoinColumn(name = "rule_id"),
            inverseJoinColumns = @JoinColumn(name = "schedule_preference_id")
    )
    @Builder.Default
    private List<EntitySchedulePreference> schedulePreferences = new ArrayList<>();

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "rule_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "rule_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "rule_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "rule_is_deleted";

    @Column(name = COMMENT)
    private String comment = "";
    public static final String COMMENT = "rule_comment";
}