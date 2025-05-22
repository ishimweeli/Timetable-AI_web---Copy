package com.ist.timetabling.User.dto.res;

import java.time.LocalDateTime;

import com.ist.timetabling.User.dto.req.DtoReqAdminProfile;
import lombok.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoResAdminProfile extends DtoReqAdminProfile {

    private Integer id;
    private String uuid;
    private Integer userId;
    private Integer organizationId;
    private Boolean canManageOrganizations;
    private Integer modifiedBy;
    private Integer createdBy;
    private Integer statusId;
    private LocalDateTime modifiedDate;
    private LocalDateTime CreatedDate;
    private Boolean isDeleted;

}
