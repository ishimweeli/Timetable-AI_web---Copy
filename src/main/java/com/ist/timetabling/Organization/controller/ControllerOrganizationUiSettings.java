package com.ist.timetabling.Organization.controller;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Organization.dto.req.DtoReqOrganizationUiSettings;
import com.ist.timetabling.Organization.dto.res.DtoResOrganizationUiSettings;
import com.ist.timetabling.Organization.service.ServiceOrganizationUiSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings/organization")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerOrganizationUiSettings {
    private final ServiceOrganizationUiSettings serviceOrganizationUiSettings;

    @GetMapping("/{organizationId}")
    public ResponseEntity<ApiResponse<DtoResOrganizationUiSettings>> getOrganizationUiSettingsByOrganizationId(@PathVariable final Integer organizationId) {
        final ApiResponse<DtoResOrganizationUiSettings> apiResponse = serviceOrganizationUiSettings.getOrganizationUiSettingsByOrganizationId(organizationId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResOrganizationUiSettings>> createOrUpdateOrganizationUiSettings(@RequestBody final DtoReqOrganizationUiSettings dtoReqOrganizationUiSettings) {
        final ApiResponse<DtoResOrganizationUiSettings> apiResponse = serviceOrganizationUiSettings.createOrUpdateOrganizationUiSettings(dtoReqOrganizationUiSettings);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }
} 
