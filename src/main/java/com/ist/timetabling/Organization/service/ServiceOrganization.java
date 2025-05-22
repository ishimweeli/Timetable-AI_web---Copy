package com.ist.timetabling.Organization.service;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Organization.dto.res.DtoResOrganization;
import com.ist.timetabling.Organization.dto.req.DtoReqOrganization;
import com.ist.timetabling.Organization.dto.res.DtoResOrganizationCsvUpload;
import com.ist.timetabling.Organization.entity.EntityOrganization;

import java.util.List;
import java.util.Map;


public interface ServiceOrganization {

    ApiResponse<DtoResOrganization> getOrganizationByUuid(final String uuid);

    ApiResponse<List<DtoResOrganization>> getAllOrganizations(final Integer page, final Integer size, final String search);

    ApiResponse<List<DtoResOrganization>> getAllOrganizationsProjection(final Integer page, final Integer size);

    ApiResponse<List<DtoResOrganization>> getOrganizationsByStatus(final Integer statusId, final Integer page, final Integer size);

    ApiResponse<List<DtoResOrganization>> searchOrganizationsByName(final String keyword);

    ApiResponse<DtoResOrganization> createOrganization(final DtoReqOrganization dtoReqOrganization);

    ApiResponse<DtoResOrganization> updateOrganizationByUuid(final String uuid, final DtoReqOrganization dtoReqOrganization);

    ApiResponse<Void> deleteOrganizationByUuid(final String uuid);
    
    ApiResponse<Map<String, Boolean>> checkEmailExists(final String email, final String excludeUuid);

    ApiResponse<DtoResOrganizationCsvUpload> importOrganizationsFromCsv(final DtoReqCsvUpload uploadRequest);

    ApiResponse<EntityOrganization> getOrganizationById(final Integer organizationId);

}
