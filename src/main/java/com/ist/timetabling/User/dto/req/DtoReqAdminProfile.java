package com.ist.timetabling.User.dto.req;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class DtoReqAdminProfile {
    private Integer userId;
    private Integer organizationId;
    private Boolean canManageOrganizations;
    private Integer modifiedBy;
    private Integer createdBy;
    private Integer statusId;
}
