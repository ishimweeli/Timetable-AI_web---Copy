package com.ist.timetabling.Timetable.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ist.timetabling.Timetable.dto.req.DtoReqManualScheduleEntry;
import com.ist.timetabling.Timetable.dto.res.DtoResScheduleConflict;
import com.ist.timetabling.Timetable.dto.res.DtoResScheduleValidation;
import com.ist.timetabling.Timetable.service.ServiceManualScheduling;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@Slf4j
public class ServiceManualSchedulingImpl implements ServiceManualScheduling {

    private final ObjectMapper objectMapper;
    private final HttpServletRequest httpServletRequest;

    @Autowired
    public ServiceManualSchedulingImpl(ObjectMapper objectMapper, HttpServletRequest httpServletRequest) {
        this.objectMapper = objectMapper;
        this.httpServletRequest = httpServletRequest;
    }

    @Override
    public DtoResScheduleValidation validateScheduleEntry(DtoReqManualScheduleEntry dtoReqManualScheduleEntry) {
        // Create a dummy validation that always passes
        // This will need to be replaced with actual validation logic
        return new DtoResScheduleValidation();
    }
}