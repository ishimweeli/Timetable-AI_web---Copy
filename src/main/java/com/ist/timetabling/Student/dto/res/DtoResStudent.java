package com.ist.timetabling.Student.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResStudent {

    private Integer id;
    private String uuid;
    private Integer organizationId;
    private Integer classId;
    private String fullName;
    private String studentIdNumber;
    private String department;
    private String email;
    private String phone;
    private String address;
    private Integer createdBy;
    private Integer modifiedBy;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private Integer statusId;
    private Boolean isDeleted;
    private String lastName;
    private String firstName;
    private String notes;

}