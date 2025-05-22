package com.ist.timetabling.binding.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for binding search operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqBindingSearch {
    
    @NotBlank(message = "Field type is required")
    private String fieldType; // teacher, subject, room
    
    @NotBlank(message = "Field UUID is required")
    private String fieldUuid;
    
    private Integer orgId;
    
    private Integer planSettingsId;
}