package com.ist.timetabling.Rule.dto.res;

import com.ist.timetabling.Rule.entity.EntityRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResRuleCsvUpload {

    @Builder.Default
    private List<EntityRule> createdRules = new ArrayList<>();

    @Builder.Default
    private List<ImportError> errors = new ArrayList<>();

    private int totalProcessed;
    private int successCount;
    private int errorCount;

    
    public String buildSuccessMessage() {
        return String.format("Processed %d rules: %d created, %d errors",
                totalProcessed, successCount, errorCount);
    }

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportError {
        private int rowNumber;
        private String originalData;
        private String errorMessage;
    }
}