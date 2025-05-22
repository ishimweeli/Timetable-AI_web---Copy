package com.ist.timetabling.Teacher.util;

import com.ist.timetabling.Core.util.CSVMapperUtil;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;


@Component
public class UtilTeacherCsv {

    private final CSVMapperUtil csvMapperUtil;
    private final TeacherCsvMapper teacherCsvMapper;

    @Autowired
    public UtilTeacherCsv(CSVMapperUtil csvMapperUtil, TeacherCsvMapper teacherCsvMapper) {
        this.csvMapperUtil = csvMapperUtil;
        this.teacherCsvMapper = teacherCsvMapper;
    }

   
    public String exportTeachersToCsv(List<DtoResTeacher> teachers) throws IOException {
        return csvMapperUtil.exportToCsv(
                teachers,
                TeacherCsvMapper.CSV_HEADERS,
                teacherCsvMapper::mapToCSVRecord
        );
    }

   
    public String generateTeacherCsvTemplate() throws IOException {
        return csvMapperUtil.generateCsvTemplate(
                TeacherCsvMapper.CSV_HEADERS,
                teacherCsvMapper.generateExampleRows()
        );
    }
}