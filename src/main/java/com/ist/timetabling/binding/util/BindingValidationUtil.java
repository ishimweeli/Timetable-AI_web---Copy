package com.ist.timetabling.binding.util;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.repository.RepositoryClass;
import com.ist.timetabling.Core.exception.ExceptionCoreBusiness;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.Period.entity.EntityPeriod;
import com.ist.timetabling.Period.repository.RepositoryPeriod;
import com.ist.timetabling.Period.repository.RepositorySchedule;
import com.ist.timetabling.PlanSetting.entity.EntityPlanSetting;
import com.ist.timetabling.PlanSetting.repository.RepositoryPlanSetting;
import com.ist.timetabling.Room.entity.EntityRoom;
import com.ist.timetabling.Room.repository.RepositoryRoom;
import com.ist.timetabling.Subject.repository.RepositorySubject;
import com.ist.timetabling.Teacher.repository.RepositoryTeacherProfile;
import com.ist.timetabling.binding.dto.req.DtoReqBinding;
import com.ist.timetabling.binding.dto.res.DtoResBinding;
import com.ist.timetabling.binding.entity.EntityBinding;
import com.ist.timetabling.binding.repository.RepositoryBinding;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static com.ist.timetabling.binding.constant.ConstantBindingI18n.*;

@Component
public class BindingValidationUtil {

    private final RepositoryBinding repositoryBinding;
    private final RepositoryOrganization repositoryOrganization;
    private final RepositoryPeriod repositoryPeriod;
    private final RepositoryClass repositoryClass;
    private final RepositoryTeacherProfile repositoryTeacher;
    private final RepositoryRoom repositoryRoom;
    private final RepositorySchedule repositorySchedule;
    private final RepositorySubject repositorySubject;
    private final RepositoryPlanSetting repositoryPlanSetting;

    private static final List<String> NON_TEACHING_PERIOD_TYPES = Arrays.asList("Break", "Lunch");

    @Autowired
    public BindingValidationUtil(
            RepositoryBinding repositoryBinding,
            RepositoryOrganization repositoryOrganization,
            RepositoryPeriod repositoryPeriod,
            RepositoryClass repositoryClass,
            RepositoryTeacherProfile repositoryTeacher,
            RepositoryRoom repositoryRoom,
            RepositorySchedule repositorySchedule,
            RepositoryPlanSetting repositoryPlanSetting,
            RepositorySubject repositorySubject) {
        this.repositoryBinding = repositoryBinding;
        this.repositoryOrganization = repositoryOrganization;
        this.repositoryPeriod = repositoryPeriod;
        this.repositoryClass = repositoryClass;
        this.repositoryTeacher = repositoryTeacher;
        this.repositoryRoom = repositoryRoom;
        this.repositorySchedule = repositorySchedule;
        this.repositoryPlanSetting = repositoryPlanSetting;
        this.repositorySubject = repositorySubject;
    }

    public int calculateMaxTeachingPeriodsPerWeek(Integer organizationId) {
        EntityOrganization organization = repositoryOrganization.findById(organizationId).orElse(null);
        if(organization == null) {
            return 40;
        }

        String orgUuid = organization.getUuid();
        Optional<EntityPlanSetting> planSetting = repositoryPlanSetting.findByOrganizationIdAndIsDeletedFalse(orgUuid);

        int schoolDaysPerWeek = planSetting.map(EntityPlanSetting::getDaysPerWeek).orElse(5);

        if(schoolDaysPerWeek <= 0) {
            schoolDaysPerWeek = 5;
        }

        List<EntityPeriod> allPeriods = repositoryPeriod.findByOrganizationId(organizationId);

        long teachingPeriodsPerDay = allPeriods.stream()
                .filter(period -> !isNonTeachingPeriod(period.getPeriodType()))
                .count();

        if(teachingPeriodsPerDay == 0) {
            teachingPeriodsPerDay = planSetting.map(EntityPlanSetting::getPeriodsPerDay).orElse(8);
            if(teachingPeriodsPerDay <= 0) {
                teachingPeriodsPerDay = 8;
            }
        }

        return (int) (schoolDaysPerWeek * teachingPeriodsPerDay);
    }

    private boolean isNonTeachingPeriod(String periodType) {
        if(periodType == null) {
            return false;
        }
        return NON_TEACHING_PERIOD_TYPES.contains(periodType);
    }

    public void validateBindingCreation(DtoReqBinding request, I18n i18n, Integer organizationId) {
        int maxTeachingPeriodsPerWeek = calculateMaxTeachingPeriodsPerWeek(organizationId);
        validateBinding(request, null, i18n, organizationId, maxTeachingPeriodsPerWeek);
    }

    public void validateBindingUpdate(DtoReqBinding request, String existingBindingUuid, I18n i18n, Integer organizationId) {
        int maxTeachingPeriodsPerWeek = calculateMaxTeachingPeriodsPerWeek(organizationId);
        validateBinding(request, existingBindingUuid, i18n, organizationId, maxTeachingPeriodsPerWeek);
    }

    public void validateBinding(
            DtoReqBinding request,
            String existingBindingUuid,
            I18n i18n,
            Integer organizationId,
            int maxTeachingPeriodsPerWeek) {

        Integer teacherId = getTeacherIdFromUuid(request.getTeacherUuid());
        Integer subjectId = getSubjectIdFromUuid(request.getSubjectUuid());
        Integer roomId = getRoomIdFromUuid(request.getRoomUuid());
        Integer planSettingsId = request.getPlanSettingsId();

        Integer existingPeriodsPerWeek = 0;
        if(existingBindingUuid != null) {
            EntityBinding existingBinding = repositoryBinding.findByUuidAndIsDeletedFalse(existingBindingUuid).orElse(null);
            if(existingBinding != null) {
                existingPeriodsPerWeek = existingBinding.getPeriodsPerWeek();
            }
        }

        checkDuplicateAssignment(request, existingBindingUuid, i18n);
        checkRoomCapacity(request, i18n);

        checkTeacherTotalPeriods(
                teacherId,
                request.getPeriodsPerWeek(),
                existingPeriodsPerWeek,
                maxTeachingPeriodsPerWeek,
                planSettingsId,
                i18n
        );

        validateTeacherScheduleAvailability(
                teacherId,
                organizationId,
                request.getPeriodsPerWeek(),
                existingPeriodsPerWeek,
                planSettingsId,
                i18n
        );

        validateRoomScheduleAvailability(
                roomId,
                organizationId,
                request.getPeriodsPerWeek(),
                existingPeriodsPerWeek,
                planSettingsId,
                i18n
        );

        if(request.getClassUuid() != null && !request.getClassUuid().isEmpty()) {
            Integer classId = getClassIdFromUuid(request.getClassUuid());

            checkClassTotalPeriods(
                    classId,
                    request.getPeriodsPerWeek(),
                    existingPeriodsPerWeek,
                    maxTeachingPeriodsPerWeek,
                    planSettingsId,
                    i18n
            );

            validateNoClassSubjectDuplicates(classId, subjectId, existingBindingUuid, i18n);
        }

        if(request.getClassBandUuid() != null && !request.getClassBandUuid().isEmpty()) {
            Integer classBandId = getClassBandIdFromUuid(request.getClassBandUuid());

            checkClassBandTotalPeriods(
                    classBandId,
                    request.getPeriodsPerWeek(),
                    existingPeriodsPerWeek,
                    maxTeachingPeriodsPerWeek,
                    planSettingsId,
                    i18n
            );

            validateNoClassBandSubjectDuplicates(classBandId, subjectId, existingBindingUuid, i18n);
        }
    }

    private void checkDuplicateAssignment(DtoReqBinding request, String existingBindingUuid, I18n i18n) {
        if(existingBindingUuid != null) {
            return;
        }

        List<EntityBinding> existingBindings;

        if(request.getClassUuid() != null && !request.getClassUuid().isEmpty()) {
            existingBindings = repositoryBinding.findByTeacherUuidAndSubjectUuidAndClassUuidAndIsDeletedFalse(
                    request.getTeacherUuid(),
                    request.getSubjectUuid(),
                    request.getClassUuid());

            if(!existingBindings.isEmpty()) {
                throw new ExceptionCoreBusiness(i18n.get(I18N_BINDING_DUPLICATE_ASSIGNMENT));
            }
        } else if(request.getClassBandUuid() != null && !request.getClassBandUuid().isEmpty()) {
            existingBindings = repositoryBinding.findByTeacherUuidAndSubjectUuidAndClassBandUuidAndIsDeletedFalse(
                    request.getTeacherUuid(),
                    request.getSubjectUuid(),
                    request.getClassBandUuid());

            if(!existingBindings.isEmpty()) {
                throw new ExceptionCoreBusiness(i18n.get(I18N_BINDING_DUPLICATE_ASSIGNMENT));
            }
        }
    }

    private void checkTeacherTotalPeriods(
            Integer teacherId,
            Integer newPeriodsPerWeek,
            Integer existingPeriodsPerWeek,
            int maxTeachingPeriodsPerWeek,
            Integer planSettingsId,
            I18n i18n) {

        if(teacherId == null || newPeriodsPerWeek == null || planSettingsId == null) {
            return;
        }

        Integer currentTotalPeriods = repositoryBinding.getTeacherWorkloadTotalPeriodsByPlanSettings(teacherId, planSettingsId);
        if(currentTotalPeriods == null) {
            currentTotalPeriods = 0;
        }

        int newTotal = currentTotalPeriods + newPeriodsPerWeek - existingPeriodsPerWeek;


    }

    private void checkClassTotalPeriods(
            Integer classId,
            Integer newPeriodsPerWeek,
            Integer existingPeriodsPerWeek,
            int maxTeachingPeriodsPerWeek,
            Integer planSettingsId,
            I18n i18n) {

        if(classId == null || newPeriodsPerWeek == null || planSettingsId == null) {
            return;
        }

        Integer currentTotalPeriods = repositoryBinding.getClassTotalPeriodsByPlanSettings(classId, planSettingsId);
        if(currentTotalPeriods == null) {
            currentTotalPeriods = 0;
        }

        int newTotal = currentTotalPeriods + newPeriodsPerWeek - existingPeriodsPerWeek;


    }

    private void checkClassBandTotalPeriods(
            Integer classBandId,
            Integer newPeriodsPerWeek,
            Integer existingPeriodsPerWeek,
            int maxTeachingPeriodsPerWeek,
            Integer planSettingsId,
            I18n i18n) {

        if(classBandId == null || newPeriodsPerWeek == null || planSettingsId == null) {
            return;
        }

        Integer currentTotalPeriods = repositoryBinding.getClassBandTotalPeriodsByPlanSettings(classBandId, planSettingsId);
        if(currentTotalPeriods == null) {
            currentTotalPeriods = 0;
        }

        int newTotal = currentTotalPeriods + newPeriodsPerWeek - existingPeriodsPerWeek;
    }

    private void checkRoomCapacity(DtoReqBinding request, I18n i18n) {
        if(request.getRoomUuid() == null || request.getClassUuid() == null) {
            return;
        }

        EntityRoom room = repositoryRoom.findByUuidAndIsDeletedFalse(request.getRoomUuid())
                .orElse(null);

        if(room == null) {
            return;
        }

        EntityClass entityClass = repositoryClass.findByUuidAndIsDeletedFalse(request.getClassUuid())
                .orElse(null);

        if(entityClass == null) {
            return;
        }
    }

    private Integer getTeacherIdFromUuid(String teacherUuid) {
        if(teacherUuid == null || teacherUuid.isEmpty()) {
            return null;
        }
        return repositoryTeacher.findIdByUuidAndIsDeletedFalse(teacherUuid);
    }

    private Integer getClassIdFromUuid(String classUuid) {
        if(classUuid == null || classUuid.isEmpty()) {
            return null;
        }
        return repositoryClass.findIdByUuidAndIsDeletedFalse(classUuid);
    }

    private Integer getClassBandIdFromUuid(String classBandUuid) {
        if(classBandUuid == null || classBandUuid.isEmpty()) {
            return null;
        }
        return repositoryClass.findClassBandIdByUuidAndIsDeletedFalse(classBandUuid);
    }

    private Integer getRoomIdFromUuid(String roomUuid) {
        if(roomUuid == null || roomUuid.isEmpty()) {
            return null;
        }
        return repositoryRoom.findIdByUuidAndIsDeletedFalse(roomUuid);
    }

    private Integer getSubjectIdFromUuid(String subjectUuid) {
        if(subjectUuid == null || subjectUuid.isEmpty()) {
            return null;
        }
        return repositorySubject.findIdByUuidAndIsDeletedFalse(subjectUuid);
    }

    public boolean validateTotalPeriodsAgainstScheduleCount(Integer organizationId, Integer periodsToAdd, Integer currentTeacherPeriods) {
        Integer totalSchedules = repositorySchedule.countSchedulesByOrganizationId(organizationId);

        if(totalSchedules == 0 || totalSchedules == null) {
            EntityOrganization organization = repositoryOrganization.findById(organizationId).orElse(null);
            if(organization == null) {
                return false;
            }

            String orgUuid = organization.getUuid();
            Optional<EntityPlanSetting> planSetting = repositoryPlanSetting.findByOrganizationIdAndIsDeletedFalse(orgUuid);

            if(planSetting.isPresent()) {
                int daysPerWeek = planSetting.get().getDaysPerWeek();
                int periodsPerDay = planSetting.get().getPeriodsPerDay();

                if(daysPerWeek > 0 && periodsPerDay > 0) {
                    totalSchedules = daysPerWeek * periodsPerDay;
                }else {
                    totalSchedules = 40;
                }
            }else {
                totalSchedules = 40;
            }
        }

        return (currentTeacherPeriods + periodsToAdd) <= totalSchedules;
    }

    public void validateTeacherScheduleAvailability(Integer teacherId, Integer organizationId,
                                                    Integer periodsToAdd, Integer existingPeriods,
                                                    Integer planSettingsId, I18n i18n) {
        if(teacherId == null || periodsToAdd == null || planSettingsId == null) {
            return;
        }

        Integer currentTotalPeriods = repositoryBinding.getTeacherWorkloadTotalPeriodsByPlanSettings(teacherId, planSettingsId);
        if(currentTotalPeriods == null) {
            currentTotalPeriods = 0;
        }

        int newTotal = currentTotalPeriods + periodsToAdd - existingPeriods;

        // Get the total available schedules specifically for this plan settings
        Integer totalSchedules = 0;
        Optional<EntityPlanSetting> planSetting = repositoryPlanSetting.findById(planSettingsId);
        
        if(planSetting.isPresent()) {
            int daysPerWeek = planSetting.get().getDaysPerWeek();
            int periodsPerDay = planSetting.get().getPeriodsPerDay();
            
            if(daysPerWeek > 0 && periodsPerDay > 0) {
                totalSchedules = daysPerWeek * periodsPerDay;
            } else {
                totalSchedules = 40;
            }
        } else {
            totalSchedules = 40;
        }

        if(newTotal > totalSchedules) {
            throw new ExceptionCoreBusiness(i18n.getBinding(I18N_BINDING_TEACHER_EXCEEDS_AVAILABLE_SCHEDULES));
        }
    }

    public void validateRoomScheduleAvailability(Integer roomId, Integer organizationId,
                                                 Integer periodsToAdd, Integer existingPeriods,
                                                 Integer planSettingsId, I18n i18n) {
        if(roomId == null || periodsToAdd == null || planSettingsId == null) {
            return;
        }

        Integer currentTotalPeriods = repositoryBinding.getRoomWorkloadTotalPeriodsByPlanSettings(roomId, planSettingsId);
        if(currentTotalPeriods == null) {
            currentTotalPeriods = 0;
        }

        int newTotal = currentTotalPeriods + periodsToAdd - existingPeriods;

        Integer totalSchedules = 0;
        Optional<EntityPlanSetting> planSetting = repositoryPlanSetting.findById(planSettingsId);
        
        if(planSetting.isPresent()) {
            int daysPerWeek = planSetting.get().getDaysPerWeek();
            int periodsPerDay = planSetting.get().getPeriodsPerDay();
            
            if(daysPerWeek > 0 && periodsPerDay > 0) {
                totalSchedules = daysPerWeek * periodsPerDay;
            } else {
                totalSchedules = 40;
            }
        } else {
            totalSchedules = 40;
        }

        if(newTotal > totalSchedules) {
            throw new ExceptionCoreBusiness(i18n.getBinding(I18N_BINDING_ROOM_EXCEEDS_AVAILABLE_SCHEDULES));
        }
    }

    public void validateNoClassSubjectDuplicates(Integer classId, Integer subjectId, String bindingUuid, I18n i18n) {
        if(classId == null || subjectId == null) {
            return;
        }

        if(bindingUuid != null && !bindingUuid.isEmpty()) {
            Integer count = repositoryBinding.countByClassIdAndSubjectIdAndUuidNotAndIsDeletedFalse(
                    classId, subjectId, bindingUuid);
            if(count != null && count > 0) {
                throw new ExceptionCoreBusiness(i18n.getBinding(I18N_BINDING_DUPLICATE_CLASS_SUBJECT));
            }
        }else {
            Integer count = repositoryBinding.countByClassIdAndSubjectIdAndIsDeletedFalse(
                    classId, subjectId);
            if(count != null && count > 0) {
                throw new ExceptionCoreBusiness(i18n.getBinding(I18N_BINDING_DUPLICATE_CLASS_SUBJECT));
            }
        }
    }

    public void validateNoClassBandSubjectDuplicates(Integer classBandId, Integer subjectId, String bindingUuid, I18n i18n) {
        if(classBandId == null || subjectId == null) {
            return;
        }

        if(bindingUuid != null && !bindingUuid.isEmpty()) {
            Integer count = repositoryBinding.countByClassBandIdAndSubjectIdAndUuidNotAndIsDeletedFalse(
                    classBandId, subjectId, bindingUuid);
            if(count != null && count > 0) {
                throw new ExceptionCoreBusiness(i18n.getBinding(I18N_BINDING_DUPLICATE_CLASS_BAND_SUBJECT));
            }
        }else {
            Integer count = repositoryBinding.countByClassBandIdAndSubjectIdAndIsDeletedFalse(
                    classBandId, subjectId);
            if(count != null && count > 0) {
                throw new ExceptionCoreBusiness(i18n.getBinding(I18N_BINDING_DUPLICATE_CLASS_BAND_SUBJECT));
            }
        }
    }
}
