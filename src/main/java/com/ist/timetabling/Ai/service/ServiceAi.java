package com.ist.timetabling.Ai.service;

import com.ist.timetabling.Ai.dto.req.DtoReqAi;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetable;

import java.util.Map;

public interface ServiceAi {

    ApiResponse<DtoResTimetable> chat(DtoReqAi dtoReqAi, Integer planSettingsId);
    
    ApiResponse<DtoResTimetable> chat(DtoReqAi dtoReqAi);
    
    ApiResponse<Map<String, Object>> getAiInputData(Integer planSettingsId);
}
