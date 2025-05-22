package com.ist.timetabling.Organization.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Table(name = EntityOrganizationUser.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityOrganizationUser {

    public static final String TABLE = "organization_users";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "member_id";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "member_organization_id";

    @Column(name = USER_ID, nullable = false)
    private Integer userId = 0;
    public static final String USER_ID = "member_user_id";

    @Column(name = ROLE_ID, nullable = false)
    private Integer roleId = 0;
    public static final String ROLE_ID = "member_role_id";

} 