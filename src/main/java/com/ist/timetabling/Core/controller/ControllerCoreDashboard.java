package com.ist.timetabling.Core.controller;

import com.ist.timetabling.Core.dto.res.DtoResCoreDashboard;
import com.ist.timetabling.Core.dto.res.DtoResOrgStatistics;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.service.ServiceCoreDashboard;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/core/dashboard")
public class ControllerCoreDashboard {

    private final ServiceCoreDashboard serviceCoreDashboard;

    public ControllerCoreDashboard(final ServiceCoreDashboard serviceCoreDashboard) {
        this.serviceCoreDashboard = serviceCoreDashboard;
    }

    
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<DtoResCoreDashboard>> getDashboardStatistics() {
        return serviceCoreDashboard.getDashboardStatistics();
    }

    
    @GetMapping("/organization-statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TEACHER', 'STUDENT')")
    public ApiResponse<DtoResOrgStatistics> getOrganizationStatistics() {
        return serviceCoreDashboard.getOrganizationStatistics();
    }
}
