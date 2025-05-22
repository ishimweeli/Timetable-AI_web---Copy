package com.ist.timetabling.Teacher.service;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Teacher.dto.req.DtoReqTeacher;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacher;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacherCsvUpload;
import com.ist.timetabling.Teacher.entity.EntityTeacherProfile;

import java.util.List;

public interface ServiceTeacher {


    ApiResponse<DtoResTeacher> findTeacherByUuid(final String uuid);


    ApiResponse<List<DtoResTeacher>> getAllTeachers(final Integer page, final Integer size, final String sortBy, final String sortDirection, final String keyword, final Integer orgId, final Integer planSettingsId);

    ApiResponse<DtoResTeacher> createTeacher(final DtoReqTeacher dtoReqTeacher);

    ApiResponse<DtoResTeacher> updateTeacher(final String uuid, final DtoReqTeacher dtoReqTeacher);

    ApiResponse<?> softDeleteTeacher(final String uuid);

    ApiResponse<?> deleteTeacherSchedulePreference(final String uuid);

    ApiResponse<DtoResTeacher> addSchedulePreferenceToTeacher(final String teacherUuid, final Integer periodId, final Integer dayOfWeek, final String preferenceType, final Boolean preferenceValue);

    ApiResponse<DtoResTeacher> addSchedulePreferencesToTeacher(final String teacherUuid, final DtoReqSchedulePreference preferences);

    ApiResponse<DtoResTeacher> updateSchedulePreference(final String preferenceUuid, final String preferenceType, final Boolean preferenceValue);

    ApiResponse<List<DtoResTeacher>> getTeacherAllPreferences(final String teacherUuid);

    ApiResponse<DtoResTeacher> getTeacherPreferenceForPeriodAndDay(final String teacherUuid, final Integer periodId, final Integer dayOfWeek);

    ApiResponse<?> clearTeacherPreferencesForPeriodAndDay(final String teacherUuid, final Integer periodId, final Integer dayOfWeek);


    ApiResponse<DtoResTeacherCsvUpload> importTeachersFromCsv(final DtoReqCsvUpload uploadRequest);

    ApiResponse<List<DtoResTeacher>> getAllTeacherProfiles(int page, int size, String sortBy, String sortDirection);

    ApiResponse<List<EntityTeacherProfile>> getTeachersByPlanSettingsId(final Integer planSettingsId);


}