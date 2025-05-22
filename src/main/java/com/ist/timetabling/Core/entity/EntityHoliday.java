package com.ist.timetabling.Core.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;


@Table(name = EntityHoliday.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityHoliday {

    public static final String TABLE = "holidays";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Long id;
    public static final String ID = "holiday_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "holiday_uuid";

    @Column(name = CALENDAR_ID, nullable = false)
    private Integer calendarId;
    public static final String CALENDAR_ID = "holiday_calendar_id";

    @Column(name = NAME, nullable = false)
    private String name;
    public static final String NAME = "holiday_name";

    @Lob
    @Column(name = DESCRIPTION, nullable = false)
    private String description;
    public static final String DESCRIPTION = "holiday_description";

    @Column(name = START_DATE, nullable = false)
    private LocalDateTime startDate;
    public static final String START_DATE = "holiday_start_date";

    @Column(name = END_DATE, nullable = false)
    private LocalDateTime endDate;
    public static final String END_DATE = "holiday_end_date";

    @Column(name = IS_RECURRING, nullable = false)
    private Boolean isRecurring;
    public static final String IS_RECURRING = "holiday_is_recurring";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy;
    public static final String CREATED_BY = "holiday_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy;
    public static final String MODIFIED_BY = "holiday_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "holiday_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "holiday_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "holiday_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "holiday_is_deleted";

}