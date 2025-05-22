package com.ist.timetabling.Ai.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class EntityAi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "id";
    private String role;
    private String response;
    private String content;

}
