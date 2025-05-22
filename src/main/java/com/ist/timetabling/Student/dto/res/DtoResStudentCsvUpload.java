package com.ist.timetabling.Student.dto.res;

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
public class DtoResStudentCsvUpload {

    @Builder.Default
    private List<DtoResStudent> createdStudents = new ArrayList<>();

    @Builder.Default
    private List<StudentImportError> errors = new ArrayList<>();

    private int totalProcessed;
    private int successCount;
    private int errorCount;

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentImportError {
        private int rowNumber;
        private String originalData;
        private String errorMessage;
    }
}