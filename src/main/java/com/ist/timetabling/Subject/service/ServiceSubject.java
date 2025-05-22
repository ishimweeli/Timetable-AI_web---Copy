package com.ist.timetabling.Subject.service;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Subject.dto.req.DtoReqSubject;
import com.ist.timetabling.Subject.dto.res.DtoResSubject;
import com.ist.timetabling.Subject.dto.res.DtoResSubjectCsvUpload;
import com.ist.timetabling.Subject.entity.EntitySubject;

import java.util.List;

public interface ServiceSubject {
    ApiResponse<DtoResSubject> findSubjectByUuid(final String uuid);

    ApiResponse<List<DtoResSubject>> getAllSubjects(final Integer page, final Integer size, final String sortBy, final String sortDirection, final String keyword, final Integer orgId);

    ApiResponse<DtoResSubject> createSubject(final DtoReqSubject dtoReqSubject);

    ApiResponse<DtoResSubject> updateSubject(final String uuid, final DtoReqSubject dtoReqSubject);

    ApiResponse<DtoResSubject> softDeleteSubject(final String Uuid);

    ApiResponse<DtoResSubjectCsvUpload> importSubjectsFromCsv(final DtoReqCsvUpload uploadRequest);

    ApiResponse<List<EntitySubject>> getSubjectsOrganizationId(final Integer organizationId);

}