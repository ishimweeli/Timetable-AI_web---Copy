package com.ist.timetabling.User.service;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.dto.req.DtoReqManager;
import com.ist.timetabling.User.dto.res.DtoResManager;
import com.ist.timetabling.User.dto.res.DtoResManagerCsvUpload;

import java.util.List;

public interface ServiceManager {

    ApiResponse<DtoResManager> findManagerByUuid(final String uuid);

    ApiResponse<List<DtoResManager>> getAllManagers(
            final Integer page,
            final Integer size,
            final String searchTerm,
            final String sortDirection,
            final Integer orgId);

    ApiResponse<DtoResManager> createManager(final DtoReqManager dtoReqManager);

    ApiResponse<DtoResManager> updateManager(final String uuid, final DtoReqManager dtoReqManager);

    ApiResponse<?> softDeleteManager(final String uuid);

    ApiResponse<DtoResManager> getCurrentManagerProfile();
    ApiResponse<DtoResManagerCsvUpload> importManagersFromCsv(final DtoReqCsvUpload uploadRequest);
}