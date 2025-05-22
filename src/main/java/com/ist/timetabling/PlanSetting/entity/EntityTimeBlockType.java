package com.ist.timetabling.PlanSetting.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = EntityTimeBlockType.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityTimeBlockType {
    public static final String TABLE = "time_block_types";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "time_block_type_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "time_block_type_uuid";

    @Column(name = NAME, nullable = false)
    private String name = "";
    public static final String NAME = "time_block_type_name";

    @Column(name = DURATION_MINUTES, nullable = false)
    private Integer durationMinutes = 0;
    public static final String DURATION_MINUTES = "time_block_type_duration_minutes";

    @Column(name = OCCURRENCES, nullable = false)
    private Integer occurrences = 0;
    public static final String OCCURRENCES = "time_block_type_occurrences";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = PLANNING_SETTINGS_ID, nullable = false)
    private EntityPlanSetting planningSettings;
    public static final String PLANNING_SETTINGS_ID = "planning_settings_id";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "time_block_type_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "time_block_type_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "time_block_type_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "time_block_type_modified_date";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "time_block_type_is_deleted";
}