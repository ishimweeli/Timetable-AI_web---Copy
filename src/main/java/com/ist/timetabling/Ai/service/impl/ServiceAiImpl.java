package com.ist.timetabling.Ai.service.impl;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import com.ist.timetabling.Ai.config.ConfigAi;
import com.ist.timetabling.Ai.dto.req.DtoReqAi;
import com.ist.timetabling.Ai.entity.EntityAi;
import com.ist.timetabling.Ai.model.ModelAi;
import com.ist.timetabling.Ai.service.ServiceAi;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.service.ServiceClass;
import com.ist.timetabling.ClassBand.entity.EntityClassBand;
import com.ist.timetabling.ClassBand.service.ServiceClassBand;
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
import com.ist.timetabling.Timetable.entity.EntityTimetable;
import com.ist.timetabling.Timetable.entity.EntityTimetableEntry;
import com.ist.timetabling.Timetable.service.ServiceTimetable;
import com.ist.timetabling.Timetable.service.ServiceTimetableEntry;
import com.ist.timetabling.binding.entity.EntityBinding;
import com.ist.timetabling.binding.service.ServiceBinding;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.HashMap;


@Service
@Slf4j
public class ServiceAiImpl implements ServiceAi {

    private final ConfigAi confAi;
    
    @Autowired
    private ServiceTimetable serviceTimetable;
    
    @Autowired
    private ServiceTimetableEntry serviceTimetableEntry;

    @Autowired
    private ServiceBinding serviceBinding;
    
    @Autowired
    private ServiceClass serviceClass;
    
    @Autowired
    private ServiceClassBand serviceClassBand;
    
    @Autowired
    private ServiceOrganization serviceOrganization;
    
    @Autowired
    private ServicePeriod servicePeriod;
    
    @Autowired
    private ServicePlanSetting servicePlanSetting;
    
    @Autowired
    private ServiceRoom serviceRoom;
    
    @Autowired
    private ServiceRule serviceRule;
    
    @Autowired
    private ServiceSubject serviceSubject;
    
    @Autowired
    private ServiceTeacher serviceTeacher;

    @Autowired
    public ServiceAiImpl(final ConfigAi confAi) {
        this.confAi = confAi;
    }

    @Override
    public ApiResponse<DtoResTimetable> chat(final DtoReqAi dtoReqAi) {
        final Integer planSettingsId = dtoReqAi.getPlanSettingId();
        if (planSettingsId == null) {
            final ApiResponse<DtoResTimetable> apiResponse = new ApiResponse<>();
            apiResponse.setSuccess(false);
            apiResponse.setMessage("Plan settings ID is required");
            return apiResponse;
        }
        
        return chat(dtoReqAi, planSettingsId);
    }
    
    @Override
    public ApiResponse<DtoResTimetable> chat(final DtoReqAi dtoReqAi, final Integer planSettingsId) {
        final ApiResponse<DtoResTimetable> apiResponse = new ApiResponse<>();
        
        if (planSettingsId == null) {
            apiResponse.setSuccess(false);
            apiResponse.setMessage("Plan settings ID is required");
            return apiResponse;
        }

        final StringBuilder systems = new StringBuilder(dtoReqAi.getSystem());
        final StringBuilder contexts = new StringBuilder(dtoReqAi.getContext());
        final StringBuilder messages = new StringBuilder(dtoReqAi.getMessage());
        final StringBuilder histories = new StringBuilder(dtoReqAi.getHistory());

        final ApiResponse<List<EntityBinding>> resBinding = serviceBinding.getBindingsByPlanSettingsId(planSettingsId);
        if(!resBinding.isSuccess()) {
            return apiResponse;
        }

        final ApiResponse<List<EntityClass>> resClass = serviceClass.getClassesByPlanSettingsId(planSettingsId);
        final ApiResponse<List<EntityClassBand>> resClassBand = serviceClassBand.getClassBandsByPlanSettingsId(planSettingsId);
        
        Integer organizationId = null;
        ApiResponse<EntityPlanSetting> planSettingResponse = servicePlanSetting.getPlanSettingById(planSettingsId);
        if (planSettingResponse.isSuccess() && planSettingResponse.getData() != null) {
            String orgIdStr = planSettingResponse.getData().getOrganizationId();
            if (orgIdStr != null && !orgIdStr.isEmpty()) {
                try {
                    organizationId = Integer.parseInt(orgIdStr);
                } catch (NumberFormatException e) {
                    log.error("Failed to parse organization ID from plan settings: {}", orgIdStr, e);
                }
            }
        }
        
        final ApiResponse<EntityOrganization> resOrganization = serviceOrganization.getOrganizationById(organizationId);
        final ApiResponse<List<EntityPeriod>> resPeriod = servicePeriod.getPeriodsByPlanSettingsId(planSettingsId);
        final ApiResponse<List<EntityRoom>> resRoom = serviceRoom.getRoomsByPlanSettingsId(planSettingsId);
        final ApiResponse<List<EntityRule>> resRules = serviceRule.getRulesByPlanSettingsId(planSettingsId);
        final ApiResponse<List<EntitySubject>> resSubject = serviceSubject.getSubjectsOrganizationId(organizationId);
        final ApiResponse<List<EntityTeacherProfile>> resTeacher = serviceTeacher.getTeachersByPlanSettingsId(planSettingsId);

        contexts.append("\n------------"
                + "\n" + "Your role is to generate timetable based on the provide contexts, rules and logic."
                + "\n" + "Give me only the Json response without any other text, for me to direct copy and extract the timetable."
        );

        contexts.append("\n------------"
                + "\n"+ "Context Dataset for Binding:"
                + "\n" + new EntityBinding()
                + "\n"+ EntityBinding.PERIODS_PER_WEEK +" : "+ " This is the field to for periods week."
        );
        
        contexts.append("\n------------"
                + "\n" + "Context Dataset for Classes:"
                + "\n" + new EntityClass()
        );
        
        contexts.append("\n------------"
                + "\n" + "Context Dataset for ClassBands:"
                + "\n" + resBinding.toJsonData()
                + "\n"+ EntityBinding.CLASSBAND_ID +" : "+ " This is the field to provide the duration in minutes."
        );

        contexts.append("\n------------"
                + "\n" + "Json format of the timetable:"
                + "\n" + new EntityTimetable()
                + "\n"+ EntityTimetable.ACADEMIC_YEAR +" : "+ " This is the field to provide the academic year."
        );

        contexts.append("\n------------"
                + "\n" + "Json format of the timetableEntry:"
                + "\n" + new EntityTimetableEntry()
                + "\n"+ EntityTimetableEntry.DURATION_MINUTES +" : "+ " This is the field to provide the duration in minutes."
                + "\n"+ EntityTimetableEntry.PERIOD_TYPE +" : "+ " This is the field to provide the duration in minutes."
        );

        histories.append("\n------------"
                +"\n"+ "Base also on previous timetable generation retries output if is there:"
                +"\n"+ new DtoResTimetable()
        );

        messages.append("\n------------"
                + "\n" + "Generate " + 1 + " timetable"
        );

        final ModelAi modelAi = new ModelAi(confAi);
        final ApiResponse<EntityAi> resAi = modelAi.chat(systems.toString(), contexts.toString(), histories.toString(), messages.toString());

        if(resAi.isSuccess()) {

            final EntityAi entityAi = resAi.getData();
            final String response = entityAi.getResponse();
            final Pattern pattern = Pattern.compile("\\{[^}]*}");
            final Matcher matcher = pattern.matcher(response);

            if(matcher.find()) {

                final String jsonRes = matcher.group();
                final JsonObject jsonObject = JsonParser.parseString(jsonRes).getAsJsonObject();
                final JsonArray jsonArray = jsonObject.getAsJsonArray("entries");
                final DtoReqTimetable dtoReqTimetable = new Gson().fromJson(jsonObject, DtoReqTimetable.class);
                final List<DtoReqTimetableEntry> listDtoReqTimetableEntry = new Gson().fromJson(jsonArray, new TypeToken<List<DtoReqTimetableEntry>>(){}.getType());

                final ApiResponse<DtoResTimetable> resCreate = serviceTimetable.create(dtoReqTimetable);

                if(resCreate.isSuccess()) {

                    final ApiResponse<List<DtoResTimetableEntry>> resCreateEntries = serviceTimetableEntry.createAll(listDtoReqTimetableEntry);

                    apiResponse.setSuccess(true);
                    apiResponse.setMessage("AI ⟡ Timetable generate successfully");
                    apiResponse.setData(resCreate.getData());

                }else {
                    apiResponse.setSuccess(false);
                    apiResponse.setStatus(resCreate.getStatus());
                    apiResponse.setError(resCreate.getError());
                }

            }

        }else {
            apiResponse.setSuccess(false);
            apiResponse.setStatus(resAi.getStatus());
            apiResponse.setError(resAi.getError());
        }

        return apiResponse;
    }

    @Override
    public ApiResponse<Map<String, Object>> getAiInputData(Integer planSettingsId) {
        if (planSettingsId == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Plan settings ID is required");
        }

        Map<String, Object> data = new HashMap<>();
        
        Integer organizationId = null;
        ApiResponse<EntityPlanSetting> planSettingResponse = servicePlanSetting.getPlanSettingById(planSettingsId);
        if (planSettingResponse.isSuccess() && planSettingResponse.getData() != null) {
            String orgIdStr = planSettingResponse.getData().getOrganizationId();
            if (orgIdStr != null && !orgIdStr.isEmpty()) {
                try {
                    organizationId = Integer.parseInt(orgIdStr);
                } catch (NumberFormatException e) {
                    log.error("Failed to parse organization ID from plan settings: {}", orgIdStr, e);
                }
            }
        }
        
        data.put("planSettingsId", planSettingsId);
        data.put("organizationId", organizationId);
        
        final ApiResponse<List<EntityBinding>> resBinding = serviceBinding.getBindingsByPlanSettingsId(planSettingsId);
        if (resBinding.isSuccess()) {
            data.put("bindings", resBinding.getData());
        }
        
        final ApiResponse<List<EntityClass>> resClass = serviceClass.getClassesByPlanSettingsId(planSettingsId);
        if (resClass.isSuccess()) {
            data.put("classes", resClass.getData());
        }
        
        final ApiResponse<List<EntityClassBand>> resClassBand = serviceClassBand.getClassBandsByPlanSettingsId(planSettingsId);
        if (resClassBand.isSuccess()) {
            data.put("classBands", resClassBand.getData());
        }
        
        final ApiResponse<EntityOrganization> resOrganization = serviceOrganization.getOrganizationById(organizationId);
        if (resOrganization.isSuccess()) {
            data.put("organization", resOrganization.getData());
        }
        
        final ApiResponse<List<EntityPeriod>> resPeriod = servicePeriod.getPeriodsByPlanSettingsId(planSettingsId);
        if (resPeriod.isSuccess()) {
            data.put("periods", resPeriod.getData());
        }
        
        final ApiResponse<List<EntityRoom>> resRoom = serviceRoom.getRoomsByPlanSettingsId(planSettingsId);
        if (resRoom.isSuccess()) {
            data.put("rooms", resRoom.getData());
        }
        
        final ApiResponse<List<EntityRule>> resRules = serviceRule.getRulesByPlanSettingsId(planSettingsId);
        if (resRules.isSuccess()) {
            data.put("rules", resRules.getData());
        }
        
        final ApiResponse<List<EntitySubject>> resSubject = serviceSubject.getSubjectsOrganizationId(organizationId);
        if (resSubject.isSuccess()) {
            data.put("subjects", resSubject.getData());
        }
        
        final ApiResponse<List<EntityTeacherProfile>> resTeacher = serviceTeacher.getTeachersByPlanSettingsId(planSettingsId);
        if (resTeacher.isSuccess()) {
            data.put("teachers", resTeacher.getData());
        }
        
        return ApiResponse.success(HttpStatus.OK, "AI input data retrieved successfully", data);
    }

}
