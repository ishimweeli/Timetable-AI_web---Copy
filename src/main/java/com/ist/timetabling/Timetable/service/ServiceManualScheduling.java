package com.ist.timetabling.Timetable.service;

import com.ist.timetabling.Timetable.dto.req.DtoReqManualScheduleEntry;
import com.ist.timetabling.Timetable.dto.res.DtoResScheduleValidation;

public interface ServiceManualScheduling {

    DtoResScheduleValidation validateScheduleEntry(DtoReqManualScheduleEntry dtoReqManualScheduleEntry);
} 