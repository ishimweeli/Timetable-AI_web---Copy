package com.ist.timetabling.binding.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for binding replace operation results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResBindingReplaceResult {
    
    private int count;
    private String message;
}