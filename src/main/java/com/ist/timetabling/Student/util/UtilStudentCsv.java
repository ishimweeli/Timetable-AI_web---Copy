package com.ist.timetabling.Student.util;

import com.ist.timetabling.Core.util.CSVMapperUtil;
import com.ist.timetabling.Student.dto.res.DtoResStudent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;


@Component
public class UtilStudentCsv {

    private final CSVMapperUtil csvMapperUtil;
    private final StudentCsvMapper studentCsvMapper;

    @Autowired
    public UtilStudentCsv(CSVMapperUtil csvMapperUtil, StudentCsvMapper studentCsvMapper) {
        this.csvMapperUtil = csvMapperUtil;
        this.studentCsvMapper = studentCsvMapper;
    }


    public String exportStudentsToCsv(List<DtoResStudent> students) throws IOException {
        return csvMapperUtil.exportToCsv(
                students,
                StudentCsvMapper.CSV_HEADERS,
                studentCsvMapper::mapToCSVRecord
        );
    }


    public String generateStudentCsvTemplate() throws IOException {
        return csvMapperUtil.generateCsvTemplate(
                StudentCsvMapper.CSV_HEADERS,
                studentCsvMapper.generateExampleRows()
        );
    }
}