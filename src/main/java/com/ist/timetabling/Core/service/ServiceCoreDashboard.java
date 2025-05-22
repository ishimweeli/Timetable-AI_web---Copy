package com.ist.timetabling.Core.service;

import com.ist.timetabling.Core.dto.res.DtoResCoreDashboard;
import com.ist.timetabling.Core.dto.res.DtoResOrgStatistics;
import com.ist.timetabling.Core.model.ApiResponse;

import java.util.List;

public interface ServiceCoreDashboard {

    ApiResponse<List<DtoResCoreDashboard>> getDashboardStatistics();
    
    ApiResponse<DtoResOrgStatistics> getOrganizationStatistics();

}
