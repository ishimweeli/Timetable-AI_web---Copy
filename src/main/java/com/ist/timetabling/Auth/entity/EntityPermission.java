package com.ist.timetabling.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Table(name = EntityPermission.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityPermission {

    public static final String TABLE = "permissions";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "permission_id";

    @Column(name = NAME, nullable = false, unique = true, length = 100)
    private String name;
    public static final String NAME = "permission_name";

    @Column(name = DESCRIPTION, nullable = false)
    private String description;
    public static final String DESCRIPTION = "permission_description";

}