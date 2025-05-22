package com.ist.timetabling.Organization.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqOrganizationUiSettings {
    private Integer organizationId;
    private String colorPalette;
    private String font;
    private String fontSize;
    private Integer cellWidth;
    private Integer cellHeight;
    private String theme;
} 