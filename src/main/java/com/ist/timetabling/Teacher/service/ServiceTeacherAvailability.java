package com.ist.timetabling.Teacher.service;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Teacher.dto.req.DtoReqTeacherAvailability;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacherAvailability;
import java.util.List;


public interface ServiceTeacherAvailability {
    ApiResponse<DtoResTeacherAvailability> getTeacherAvailabilityByUuid(final Integer teacherId,final String uuid);

    ApiResponse<List<DtoResTeacherAvailability>> getAllTeacherAvailabilities(final Integer teacherId);

    ApiResponse<DtoResTeacherAvailability> createTeacherAvailability(final DtoReqTeacherAvailability dtoReqTeacherAvailability,final Integer teacherId);

    ApiResponse<DtoResTeacherAvailability> updateTeacherAvailability(final DtoReqTeacherAvailability dtoReqTeacherAvailability, final Integer teacherId, final String uuid);

    ApiResponse<Void> deleteTeacherAvailability(final Integer teacherId,final String uuid);
}
