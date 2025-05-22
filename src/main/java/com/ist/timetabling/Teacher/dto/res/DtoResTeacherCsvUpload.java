package com.ist.timetabling.Teacher.dto.res;

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
public class DtoResTeacherCsvUpload {

    @Builder.Default
    private List<DtoResTeacher> createdTeachers = new ArrayList<>();

    @Builder.Default
    private List<TeacherImportError> errors = new ArrayList<>();

    private int totalProcessed;
    private int successCount;
    private int errorCount;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherImportError {
        private int rowNumber;
        private String originalData;
        private String errorMessage;
    }
}