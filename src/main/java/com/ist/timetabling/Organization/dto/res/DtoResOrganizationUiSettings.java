package com.ist.timetabling.Organization.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResOrganizationUiSettings {
    private Integer id;
    private Integer organizationId;
    private String colorPalette;
    private String font;
    private String fontSize;
    private Integer cellWidth;
    private Integer cellHeight;
    private String theme;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
} 