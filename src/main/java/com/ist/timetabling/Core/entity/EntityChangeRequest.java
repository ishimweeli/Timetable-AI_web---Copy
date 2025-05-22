package com.ist.timetabling.Core.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;


@Table(name = EntityChangeRequest.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityChangeRequest {

    public static final String TABLE = "change_requests";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Long id;
    public static final String ID = "change_request_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "change_request_uuid";

    @Lob
    @Column(name = DATA, nullable = false)
    private String data;
    public static final String DATA = "change_request_data";

    @Column(name = STATUS, nullable = false)
    private String status;
    public static final String STATUS = "change_request_status";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy;
    public static final String CREATED_BY = "change_request_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy;
    public static final String MODIFIED_BY = "change_request_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "change_request_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "change_request_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "change_request_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "change_request_is_deleted";

}