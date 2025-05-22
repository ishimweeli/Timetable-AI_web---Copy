package com.ist.timetabling.Class.dto.res;

import com.ist.timetabling.Class.entity.EntityClass;
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
public class DtoResClassCsvUpload {

    @Builder.Default
    private List<EntityClass> createdClasses = new ArrayList<>();

    @Builder.Default
    private List<ClassImportError> errors = new ArrayList<>();

    private int totalProcessed;
    private int successCount;
    private int errorCount;

   
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassImportError {
        private int rowNumber;
        private String originalData;
        private String errorMessage;
    }
}