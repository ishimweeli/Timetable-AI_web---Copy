package com.ist.timetabling.Organization.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ist.timetabling.User.entity.EntityUser;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.List;


@Table(name = EntityOrganization.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityOrganization {

    public static final String TABLE = "organizations";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "organization_id";

    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "organization_uid";

    @Column(name = NAME, nullable = false)
    private String name;
    public static final String NAME = "organization_name";

    @Column(name = ADDRESS)
    private String address;
    public static final String ADDRESS = "organization_address";

    @Column(name = CONTACT_EMAIL, nullable = false)
    private String contactEmail;
    public static final String CONTACT_EMAIL = "organization_contact_email";

    @Column(name = CONTACT_PHONE, nullable = false)
    private String contactPhone;
    public static final String CONTACT_PHONE = "organization_contact_phone";

    @Column(name = CREATED_BY, nullable = false)
    private String createdBy;
    public static final String CREATED_BY = "organization_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private String modifiedBy;
    public static final String MODIFIED_BY = "organization_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "organization_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "organization_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "organization_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "organization_is_deleted";

    @JsonIgnore
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EntityUser> users;
}