package com.ist.timetabling.Timetable.service;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetable;


public interface ServiceTimetableGenerate {

    ApiResponse<DtoResTimetable> generate();

}
