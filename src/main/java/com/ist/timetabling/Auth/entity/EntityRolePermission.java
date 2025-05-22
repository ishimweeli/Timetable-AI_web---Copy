package com.ist.timetabling.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Table(name = EntityRolePermission.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityRolePermission {

    public static final String TABLE = "role_permissions";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "roleperm_id";

    @Column(name = ROLE_ID, nullable = false)
    private Integer roleId = 0;
    public static final String ROLE_ID = "roleperm_role_id";

    @Column(name = PERMISSION_ID, nullable = false)
    private Integer permissionId = 0;
    public static final String PERMISSION_ID = "roleperm_permission_id";

} 
