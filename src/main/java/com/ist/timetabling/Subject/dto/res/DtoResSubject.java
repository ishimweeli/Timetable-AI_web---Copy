package com.ist.timetabling.Subject.dto.res;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResSubject {

    private Integer id;

    private String uuid;

    private Integer organizationId;

    private String initials;

    private String name;

    private String description;

    private Integer durationInMinutes;

    private Boolean redRepetition;

    private Boolean blueRepetition;

    private Integer conflictSubjectId;

    private String group;

    private Boolean autoConflictHandling;

    private Integer createdBy;

    private Integer modifiedBy;

    private LocalDateTime createdDate;

    private LocalDateTime modifiedDate;

    private Integer statusId;

    private Boolean isDeleted;

    private String color;

}
