package com.ist.timetabling.Core.dto.req;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqCsvUpload {

    @NotNull(message = "CSV file is required")
    private MultipartFile file;

    private Integer organizationId;

    @Builder.Default
    private Boolean skipHeaderRow = true;
}