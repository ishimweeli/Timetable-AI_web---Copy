package com.ist.timetabling.User.dto.res;

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
public class DtoResManagerCsvUpload {

    @Builder.Default
    private List<DtoResManager> createdManagers = new ArrayList<>();

    @Builder.Default
    private List<ImportError> errors = new ArrayList<>();

    private int totalProcessed;
    private int successCount;
    private int errorCount;

 
    public String buildSuccessMessage() {
        return String.format("Processed %d managers: %d created, %d errors",
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