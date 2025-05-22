package com.ist.timetabling.Room.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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
import jakarta.persistence.JoinTable;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;


@Table(name = EntityRoom.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityRoom {
    public static final String TABLE = "rooms";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "room_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "room_uuid";
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "room_schedule_preferences", joinColumns = @JoinColumn(name = "room_id"),
        inverseJoinColumns = @JoinColumn(name = "schedule_preference_id")
    )
    private List<EntitySchedulePreference> schedulePreferences = new ArrayList<>();

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "room_organization_id";

    @Column(name = PLAN_SETTINGS_ID)
    private Integer planSettingsId;
    public static final String PLAN_SETTINGS_ID = "room_plan_settings_id";

    @Column(name = NAME, nullable = false)
    private String name = "";
    public static final String NAME = "room_name";

    @Column(name = CODE, nullable = false)
    private String code = "";
    public static final String CODE = "room_code";

    @Column(name = CAPACITY, nullable = false)
    private Integer capacity = 0;
    public static final String CAPACITY = "room_capacity";

    @Lob
    @Column(name = DESCRIPTION, nullable = false)
    private String description = "";
    public static final String DESCRIPTION = "room_description";

    @Column(name = INITIALS)
    private String initials = "";
    public static final String INITIALS = "room_initials";

    @Column(name = CONTROL_NUMBER)
    private Integer controlNumber;
    public static final String CONTROL_NUMBER = "room_control_number";

    @Column(name = PRIORITY)
    private String priority = "High";
    public static final String PRIORITY = "room_priority";

    @Column(name = LOCATION_NUMBER, nullable = false)
    private Integer locationNumber = 1;
    public static final String LOCATION_NUMBER = "room_location_number";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "room_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "room_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "room_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "room_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "room_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "room_is_deleted";
} 