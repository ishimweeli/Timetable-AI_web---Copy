package com.ist.timetabling.Period.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EntitySchedule {

    public static final String TABLE = "schedules";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "schedule_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "schedule_uuid";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = PERIOD_ID, nullable = false)
    private EntityPeriod period;
    public static final String PERIOD_ID = "period_id";

    @Column(name = ORGANISATION_ID, nullable = false)
    private Integer organisationId;
    public static final String ORGANISATION_ID = "schedule_organization_id";

    @Column(name = DAY_OF_WEEK, nullable = false)
    private Integer dayOfWeek = 0;
    public static final String DAY_OF_WEEK = "day_of_week";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "schedule_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "schedule_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "schedule_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "schedule_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "schedule_status_id";

    @Builder.Default
    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "schedule_is_deleted";
}
