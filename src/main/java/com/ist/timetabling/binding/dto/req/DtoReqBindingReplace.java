package com.ist.timetabling.binding.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object for binding replace operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqBindingReplace {
    
    @NotBlank(message = "Field type is required")
    private String fieldType; // teacher, subject, room
    
    @NotBlank(message = "Search UUID is required")
    private String searchUuid;
    
    @NotBlank(message = "Replace UUID is required")
    private String replaceUuid;
    
    @NotBlank(message = "Replacement mode is required")
    private String mode; // all, single, selected
    
    // Required when mode is "selected"
    private List<String> bindingUuids;
    
    private Integer orgId;
}