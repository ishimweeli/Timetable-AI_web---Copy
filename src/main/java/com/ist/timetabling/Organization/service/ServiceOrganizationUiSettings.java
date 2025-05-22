package com.ist.timetabling.Organization.service;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Organization.dto.req.DtoReqOrganizationUiSettings;
import com.ist.timetabling.Organization.dto.res.DtoResOrganizationUiSettings;
 
public interface ServiceOrganizationUiSettings {
    ApiResponse<DtoResOrganizationUiSettings> getOrganizationUiSettingsByOrganizationId(final Integer organizationId);
    ApiResponse<DtoResOrganizationUiSettings> createOrUpdateOrganizationUiSettings(final DtoReqOrganizationUiSettings dtoReqOrganizationUiSettings);
} 