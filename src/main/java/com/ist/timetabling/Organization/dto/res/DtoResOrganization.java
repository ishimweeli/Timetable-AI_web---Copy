package com.ist.timetabling.Organization.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DtoResOrganization {

    private Integer id;

    private String uuid;

    private String name;

    private String address;

    private String contactEmail;

    private String contactPhone;

    private Integer statusId;

    private String createdBy;

    private String modifiedBy;

    private LocalDateTime createdDate;

    private LocalDateTime modifiedDate;

}
