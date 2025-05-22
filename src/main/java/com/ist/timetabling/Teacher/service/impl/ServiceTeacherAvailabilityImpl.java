package com.ist.timetabling.Teacher.service.impl;

import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Teacher.dto.req.DtoReqTeacherAvailability;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacherAvailability;
import com.ist.timetabling.Teacher.entity.EntityTeacherAvailability;
import com.ist.timetabling.Teacher.exception.ExceptionTeacherAvailabilityConflict;
import com.ist.timetabling.Teacher.repository.RepositoryTeacherAvailability;
import com.ist.timetabling.Teacher.service.ServiceTeacherAvailability;
import com.ist.timetabling.Timetable.exception.ExceptionTimetableNotFound;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.beans.BeanUtils;
import java.time.Duration;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;
import static com.ist.timetabling.Teacher.constant.ConstantTeacherAvailabilityI18n.*;


@Service
@RequiredArgsConstructor
public class ServiceTeacherAvailabilityImpl implements ServiceTeacherAvailability {
    private RepositoryTeacherAvailability repositoryTeacherAvailability;
    private final HttpServletRequest httpServletRequest;
    private final UtilAuthContext utilAuthContext;

    @Autowired
    public ServiceTeacherAvailabilityImpl(RepositoryTeacherAvailability repositoryTeacherAvailability, HttpServletRequest httpServletRequest, UtilAuthContext utilAuthContext) {
        this.repositoryTeacherAvailability = repositoryTeacherAvailability;
        this.httpServletRequest = httpServletRequest;
        this.utilAuthContext = utilAuthContext;
    }

    @Override
    public ApiResponse<DtoResTeacherAvailability> getTeacherAvailabilityByUuid(final Integer teacherId,final String uuid) {
        I18n i18n = new I18n(httpServletRequest);
        EntityTeacherAvailability entityTeacherAvailability = repositoryTeacherAvailability.findByTeacherIdAndUuidAndIsDeletedFalse(teacherId,uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound(i18n.getTeacher(I18N_TEACHER_AVAILABILITY_NOT_FOUND)));
        DtoResTeacherAvailability dtoResTeacherAvailability = toDTO(entityTeacherAvailability);
        return ApiResponse.success(HttpStatus.FOUND, i18n.getTeacher(I18N_TEACHER_AVAILABILITY_RETRIEVE_SUCCESS), dtoResTeacherAvailability);
    }

    @Override
    public ApiResponse<List<DtoResTeacherAvailability>> getAllTeacherAvailabilities(final Integer teacherId) {
        I18n i18n = new I18n(httpServletRequest);
        List<EntityTeacherAvailability> teacherAvailabilities = repositoryTeacherAvailability.findByTeacherIdAndIsDeletedFalse(teacherId);
        if(teacherAvailabilities.isEmpty()) {
            throw new ExceptionTimetableNotFound(i18n.getTeacher(I18N_TEACHER_AVAILABILITIES_NOT_FOUND));
        }
        List<DtoResTeacherAvailability> dtoResTeacherAvailabilities = teacherAvailabilities.stream()
                .map(this::toDTO).collect(Collectors.toList());
        return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_AVAILABILITY_LIST_SUCCESS), dtoResTeacherAvailabilities);
    }

    @Override
    public ApiResponse<DtoResTeacherAvailability> createTeacherAvailability(final DtoReqTeacherAvailability dtoReqTeacherAvailability,final Integer teacherId) {
        I18n i18n = new I18n(httpServletRequest);

        List<EntityTeacherAvailability> existingAvailabilities = repositoryTeacherAvailability.findByTeacherIdAndDayOfWeekAndIsDeletedFalse(teacherId, dtoReqTeacherAvailability.getDayOfWeek());

        long newAvailabilityMinutes = Duration.between(dtoReqTeacherAvailability.getStartTime(), dtoReqTeacherAvailability.getEndTime()).toMinutes();

        boolean hasOverlap = false;
        for(EntityTeacherAvailability existing : existingAvailabilities) {
            if(isOverlapping(dtoReqTeacherAvailability.getStartTime(), dtoReqTeacherAvailability.getEndTime(), existing.getStartTime(), existing.getEndTime())) {
                hasOverlap = true;
                break;
            }
        }

        if(hasOverlap) {throw new ExceptionTeacherAvailabilityConflict(
                i18n.getTeacher(I18N_TEACHER_AVAILABILITY_OVERLAP)
            );
        }

        long existingAvailabilityMinutes = existingAvailabilities.stream().mapToLong(availability ->
                        Duration.between(availability.getStartTime(), availability.getEndTime()).toMinutes()).sum();

        if(existingAvailabilityMinutes + newAvailabilityMinutes > 480) {
            long remainingMinutes = 480 - existingAvailabilityMinutes;
            String formattedHours = String.format("%.1f", remainingMinutes / 60.0);

            throw new ExceptionTeacherAvailabilityConflict(i18n.getTeacher(I18N_TEACHER_AVAILABILITY_EXCEED_LIMIT) +
                            " " + formattedHours + " " +
                            i18n.getTeacher(I18N_TEACHER_AVAILABILITY_HOURS_REMAINING)
            );
        }

        EntityTeacherAvailability entityTeacherAvailability = new EntityTeacherAvailability();
        BeanUtils.copyProperties(dtoReqTeacherAvailability, entityTeacherAvailability);
        entityTeacherAvailability.setCreatedBy(utilAuthContext.getAuthenticatedUserId());
        entityTeacherAvailability.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        entityTeacherAvailability.setIsDeleted(false);
        entityTeacherAvailability.setStatusId(1);
        entityTeacherAvailability.setOrganizationId(1);
        entityTeacherAvailability.setTeacherId(teacherId);

        EntityTeacherAvailability savedEntityTeacherAvailability = repositoryTeacherAvailability.save(entityTeacherAvailability);
        DtoResTeacherAvailability dtoResTeacherAvailability = toDTO(savedEntityTeacherAvailability);

        return ApiResponse.success(HttpStatus.CREATED, i18n.getTeacher(I18N_TEACHER_AVAILABILITY_CREATE_SUCCESS), dtoResTeacherAvailability);
    }

    @Override
    public ApiResponse<DtoResTeacherAvailability> updateTeacherAvailability(final DtoReqTeacherAvailability dtoReqTeacherAvailability,final Integer teacherId, final String uuid) {
        I18n i18n = new I18n(httpServletRequest);

        EntityTeacherAvailability existingEntityTeacherAvailability = repositoryTeacherAvailability.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getTeacher(I18N_TEACHER_AVAILABILITY_NOT_FOUND)));

        List<EntityTeacherAvailability> existingDailyAvailabilities = repositoryTeacherAvailability.findByTeacherIdAndDayOfWeekAndIsDeletedFalse(teacherId,dtoReqTeacherAvailability.getDayOfWeek()
                )
                .stream().filter(av -> !av.getUuid().equals(uuid)).collect(Collectors.toList());

        long newAvailabilityMinutes = Duration.between(
                dtoReqTeacherAvailability.getStartTime(),
                dtoReqTeacherAvailability.getEndTime()
        ).toMinutes();

        boolean hasOverlap = false;
        for(EntityTeacherAvailability existing : existingDailyAvailabilities) {
            if(isOverlapping(
                    dtoReqTeacherAvailability.getStartTime(), dtoReqTeacherAvailability.getEndTime(),
                    existing.getStartTime(), existing.getEndTime())) {
                hasOverlap = true;
                break;
            }
        }

        if(hasOverlap) {
            throw new ExceptionTeacherAvailabilityConflict(
                    i18n.getTeacher(I18N_TEACHER_AVAILABILITY_OVERLAP)
            );
        }

        long existingAvailabilityMinutes = existingDailyAvailabilities.stream()
                .mapToLong(availability ->
                        Duration.between(availability.getStartTime(), availability.getEndTime()).toMinutes()
                )
                .sum();

        if(existingAvailabilityMinutes + newAvailabilityMinutes > 480) {
            long remainingMinutes = 480 - existingAvailabilityMinutes;
            String formattedHours = String.format("%.1f", remainingMinutes / 60.0);

            throw new ExceptionTeacherAvailabilityConflict(
                    i18n.getTeacher(I18N_TEACHER_AVAILABILITY_EXCEED_LIMIT) +
                            " " + formattedHours + " " +
                            i18n.getTeacher(I18N_TEACHER_AVAILABILITY_HOURS_REMAINING)
            );
        }

        existingEntityTeacherAvailability.setTeacherId(teacherId);
        existingEntityTeacherAvailability.setDayOfWeek(dtoReqTeacherAvailability.getDayOfWeek());
        existingEntityTeacherAvailability.setStartTime(dtoReqTeacherAvailability.getStartTime());
        existingEntityTeacherAvailability.setEndTime(dtoReqTeacherAvailability.getEndTime());
        existingEntityTeacherAvailability.setModifiedBy(utilAuthContext.getAuthenticatedUserId());

        EntityTeacherAvailability updatedEntityTeacherAvailability = repositoryTeacherAvailability.save(existingEntityTeacherAvailability);

        DtoResTeacherAvailability dtoResTeacherAvailability = toDTO(updatedEntityTeacherAvailability);
        return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_AVAILABILITY_UPDATE_SUCCESS), dtoResTeacherAvailability);
    }

    @Override
    public ApiResponse<Void> deleteTeacherAvailability(final Integer teacherId, final String uuid) {
        I18n i18n = new I18n(httpServletRequest);

        EntityTeacherAvailability existingEntityTeacherAvailability = repositoryTeacherAvailability.findByTeacherIdAndUuidAndIsDeletedFalse(teacherId, uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getTeacher(I18N_TEACHER_AVAILABILITY_NOT_FOUND)));

        existingEntityTeacherAvailability.setIsDeleted(true);
        existingEntityTeacherAvailability.setStatusId(0);
        existingEntityTeacherAvailability.setModifiedBy(utilAuthContext.getAuthenticatedUserId());

        repositoryTeacherAvailability.save(existingEntityTeacherAvailability);
        return ApiResponse.success(HttpStatus.OK, i18n.getTeacher(I18N_TEACHER_AVAILABILITY_DELETE_SUCCESS), null);
    }

    private DtoResTeacherAvailability toDTO(final EntityTeacherAvailability entityTeacherAvailability) {
        DtoResTeacherAvailability dtoResTeacherAvailability = new DtoResTeacherAvailability();
        BeanUtils.copyProperties(entityTeacherAvailability, dtoResTeacherAvailability);
        return dtoResTeacherAvailability;
    }

    private boolean isOverlapping(final LocalTime start1, final LocalTime end1, final LocalTime start2, final LocalTime end2) {
        return (start1.isBefore(end2) && start2.isBefore(end1));
    }

}
