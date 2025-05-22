package com.ist.timetabling.binding.service;

import com.ist.timetabling.Class.dto.res.DtoResClass;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Room.dto.res.DtoResRoom;
import com.ist.timetabling.binding.dto.req.DtoReqBinding;
import com.ist.timetabling.binding.dto.req.DtoReqBindingSearch;
import com.ist.timetabling.binding.dto.req.DtoReqBindingReplace;
import com.ist.timetabling.binding.dto.req.DtoReqBindingUpdate;
import com.ist.timetabling.binding.dto.res.DtoResBinding;
import com.ist.timetabling.binding.dto.res.DtoResBindingReplaceResult;
import com.ist.timetabling.binding.entity.EntityBinding;

import java.util.List;

public interface ServiceBinding {
    ApiResponse<DtoResBinding> getBindingByUuid(String uuid);

    ApiResponse<List<DtoResBinding>> getAllBindings(final Integer page, final Integer size, final String sortBy, final String sortDirection, final String keyword, final String orgId, final String teacherUuid, final Integer planSettingsId);

    ApiResponse<List<DtoResBinding>> searchBindingsByName(final String keyword);

    ApiResponse<List<DtoResBinding>> getBindingsByStatus(final Integer statusId, final Integer page, final Integer size);

    ApiResponse<DtoResBinding> createBinding(DtoReqBinding dtoReqBinding);

    ApiResponse<DtoResBinding> updateBindingByUuid(final String uuid, DtoReqBindingUpdate dtoReqBindingUpdate);

    ApiResponse<Void> deleteBindingByUuid(final String uuid);

    ApiResponse<List<DtoResBinding>> getTeacherBindings(final String teacherUuid);

    ApiResponse<List<DtoResBinding>> getTeacherBindings(final String teacherUuid, final Integer planSettingsId);

    Integer getTeacherTotalPeriods(final String teacherUuid);

    ApiResponse<DtoResBinding> addRuleToBinding(final String bindingUuid, final String ruleUuid);

    ApiResponse<DtoResBinding> removeRuleFromBinding(final String bindingUuid, final String ruleUuid);

    ApiResponse<List<DtoResBinding>> getClassBindings(final String classUuid);

    ApiResponse<List<DtoResBinding>> getClassBindings(final String classUuid, final Integer planSettingsId);

    ApiResponse<List<DtoResBinding>> getRoomBindings(final String roomUuid);

    ApiResponse<List<DtoResBinding>> getRoomBindings(final String roomUuid, final Integer planSettingsId);

    ApiResponse<List<DtoResBinding>> getSubjectBindings(final String subjectUuid);

    ApiResponse<List<DtoResBinding>> getSubjectBindings(final String subjectUuid, final Integer planSettingsId);

    ApiResponse<List<DtoResBinding>> getClassBandBindings(final String classBandUuid);
    
    ApiResponse<List<DtoResBinding>> getClassBandBindings(final String classBandUuid, final Integer planSettingsId);

    ApiResponse<List<DtoResBinding>> getBindingsByPlanSettings(final Integer planSettingsId);
    

    ApiResponse<List<DtoResBinding>> searchBindings(DtoReqBindingSearch dtoReqBindingSearch);

    ApiResponse<DtoResBindingReplaceResult> replaceBindings(DtoReqBindingReplace dtoReqBindingReplace);

    /**
     * Get classes associated with a teacher through bindings
     * @param teacherId the ID of the teacher
     * @return list of classes associated with the teacher
     */
    ApiResponse<List<DtoResClass>> getClassesByTeacherId(final Integer teacherId);

    ApiResponse<List<DtoResClass>> getClassesByRoomId(final Integer roomId);

    ApiResponse<List<DtoResClass>> getClassesBySubjectId(final Integer subjectId);


    
    ApiResponse<List<EntityBinding>> getBindingsByPlanSettingsId(Integer planSettingsId);
}