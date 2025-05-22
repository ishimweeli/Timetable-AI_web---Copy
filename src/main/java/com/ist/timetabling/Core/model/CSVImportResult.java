package com.ist.timetabling.Core.model;

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
public class CSVImportResult<T> {

    @Builder.Default
    private List<T> createdItems = new ArrayList<>();

    @Builder.Default
    private List<CSVImportError> errors = new ArrayList<>();

    private int totalProcessed;
    private int successCount;
    private int errorCount;

   
    public String buildSuccessMessage() {
        return String.format("Processed %d items: %d created, %d errors",
                totalProcessed, successCount, errorCount);
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CSVImportError {
        private int rowNumber;
        private String originalData;
        private String errorMessage;
    }
}