package com.ist.timetabling.User.service;

import com.ist.timetabling.User.dto.req.DtoReqAdminProfile;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.dto.res.DtoResAdminProfile;
import java.util.List;


public interface ServiceAdminProfile {

    ApiResponse<DtoResAdminProfile> findByUuid(final String uuid);

    ApiResponse<List<DtoResAdminProfile>> getAllProfiles(final int page, final int size);

    ApiResponse<DtoResAdminProfile> createAdminProfile(final DtoReqAdminProfile dtoReqAdminProfile);

    ApiResponse<DtoResAdminProfile> updateAdminProfile(final String uuid, final DtoReqAdminProfile dtoReqAdminProfile);

    ApiResponse<DtoResAdminProfile> softDeleteAdminProfile(final String Uuid);

}
