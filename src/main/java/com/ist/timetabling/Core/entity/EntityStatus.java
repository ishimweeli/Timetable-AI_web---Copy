package com.ist.timetabling.Core.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;


@Table(name = EntityStatus.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityStatus {

    public static final String TABLE = "statuses";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "status_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "status_uuid";

    @Column(name = STATUS_CODE, nullable = false, unique = true)
    private String statusCode;
    public static final String STATUS_CODE = "status_code";

    @Column(name = STATUS_NAME, nullable = false)
    private String statusName;
    public static final String STATUS_NAME = "status_name";

    @Lob
    @Column(name = STATUS_DESCRIPTION, nullable = false)
    private String statusDescription;
    public static final String STATUS_DESCRIPTION = "status_description";

    @Column(name = STATUS_CATEGORY, nullable = false)
    private String statusCategory;
    public static final String STATUS_CATEGORY = "status_category";

    @Column(name = STATUS_ORDER_INDEX, nullable = false)
    private Integer statusOrderIndex;
    public static final String STATUS_ORDER_INDEX = "status_order_index";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy;
    public static final String CREATED_BY = "status_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy;
    public static final String MODIFIED_BY = "status_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "status_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "status_modified_date";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "status_is_deleted";

}
