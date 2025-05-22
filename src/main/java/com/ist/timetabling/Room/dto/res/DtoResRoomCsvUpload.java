package com.ist.timetabling.Room.dto.res;

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
public class DtoResRoomCsvUpload {

    @Builder.Default
    private List<DtoResRoom> createdRooms = new ArrayList<>();

    @Builder.Default
    private List<ImportError> errors = new ArrayList<>();

    private int totalProcessed;
    private int successCount;
    private int errorCount;
    public String buildSuccessMessage() {
        return String.format("Processed %d rooms: %d created, %d errors",
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