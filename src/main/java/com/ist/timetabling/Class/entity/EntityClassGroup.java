package com.ist.timetabling.Class.entity;

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

@Entity
@Table(name = EntityClassGroup.TABLE)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityClassGroup {

    public static final String TABLE = "class_groups";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "class_group_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "class_group_uuid";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "class_group_organization_id";

    @Column(name = NAME, nullable = false)
    private String name = "";
    public static final String NAME = "class_group_name";

    @Column(name = DESCRIPTION)
    private String description;
    public static final String DESCRIPTION = "class_group_description";

    @Column(name = CREATED_BY, nullable = false)
    private String createdBy;
    public static final String CREATED_BY = "class_group_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private String modifiedBy;
    public static final String MODIFIED_BY = "class_group_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "class_group_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "class_group_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "class_group_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "class_group_is_deleted";

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "class_group_mappings",
            joinColumns = @JoinColumn(name = "class_group_id"),
            inverseJoinColumns = @JoinColumn(name = "class_id")
    )
    @Builder.Default
    private List<EntityClass> classes = new ArrayList<>();
} 