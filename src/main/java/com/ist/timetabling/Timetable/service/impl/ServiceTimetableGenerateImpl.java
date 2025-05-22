package com.ist.timetabling.Timetable.service.impl;

import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.service.ServiceClass;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.service.ServiceOrganization;
import com.ist.timetabling.Period.entity.EntityPeriod;
import com.ist.timetabling.Period.service.ServicePeriod;
import com.ist.timetabling.PlanSetting.entity.EntityPlanSetting;
import com.ist.timetabling.PlanSetting.service.ServicePlanSetting;
import com.ist.timetabling.Room.entity.EntityRoom;
import com.ist.timetabling.Room.service.ServiceRoom;
import com.ist.timetabling.Rule.entity.EntityRule;
import com.ist.timetabling.Rule.service.ServiceRule;
import com.ist.timetabling.Subject.entity.EntitySubject;
import com.ist.timetabling.Subject.service.ServiceSubject;
import com.ist.timetabling.Teacher.entity.EntityTeacherProfile;
import com.ist.timetabling.Teacher.service.ServiceTeacher;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetable;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetableEntry;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetable;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetableEntry;
import com.ist.timetabling.Timetable.service.ServiceTimetable;
import com.ist.timetabling.Timetable.service.ServiceTimetableEntry;
import com.ist.timetabling.Timetable.service.ServiceTimetableGenerate;
import com.ist.timetabling.binding.entity.EntityBinding;
import com.ist.timetabling.binding.service.ServiceBinding;

import java.util.ArrayList;
import java.util.List;


public class ServiceTimetableGenerateImpl implements ServiceTimetableGenerate {

    private ServiceTimetable serviceTimetable;
    private ServiceTimetableEntry serviceTimetableEntry;

    private ServiceBinding serviceBinding;
    private ServiceClass serviceClass;
    private ServiceOrganization serviceOrganization;
    private ServicePeriod servicePeriod;
    private ServicePlanSetting servicePlanSetting;
    private ServiceRoom serviceRoom;
    private ServiceRule serviceRule;
    private ServiceSubject serviceSubject;
    private ServiceTeacher serviceTeacher;

    @Override
    public ApiResponse<DtoResTimetable> generate() {
        final ApiResponse<DtoResTimetable> apiResponse = new ApiResponse<>();

        // final ApiResponse<List<EntityBinding>> resBinding = serviceBinding.getAllBindings();
        // final ApiResponse<List<EntityClass>> resClass = serviceClass.getAllClasses();
        // final ApiResponse<List<EntityOrganization>> resOrganization = serviceOrganization.getAllOrganizations();
        // final ApiResponse<List<EntityPeriod>> resPeriod = servicePeriod.getPeriodsByOrganizationId();
        // final ApiResponse<List<EntityPlanSetting>> resPlanSetting = servicePlanSetting.findPlanningSettingsByOrganizationId();
        // final ApiResponse<List<EntityRoom>> resRoom = serviceRoom.findAllRooms();
        // final ApiResponse<List<EntityRule>> resRules = serviceRule.getRuleAllPreferences();
        // final ApiResponse<List<EntitySubject>> resSubject = serviceSubject.getAllSubjects();
        // final ApiResponse<List<EntityTeacherProfile>> resTeacher = serviceTeacher.getAllTeachers();

        final DtoReqTimetable dtoReqTimetable = new DtoReqTimetable();
        final List<DtoReqTimetableEntry> listDtoReqTimetableEntry = new ArrayList<>();

        final DtoResTimetable resCreate = serviceTimetable.createTimetable(dtoReqTimetable);

        if(resCreate != null) {

            final ApiResponse<List<DtoResTimetableEntry>> resCreateEntries = serviceTimetableEntry.createAll(listDtoReqTimetableEntry);

            apiResponse.setSuccess(true);
            apiResponse.setMessage("Timetable generate successfully");
            apiResponse.setData(resCreate);

        }else {
            apiResponse.setSuccess(false);
            apiResponse.setStatus(500);
            apiResponse.setError("Failed to create timetable");
        }

        return apiResponse;
    }

}
