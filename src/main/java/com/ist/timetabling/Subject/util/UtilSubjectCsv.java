package com.ist.timetabling.Subject.util;

import com.ist.timetabling.Core.util.CSVMapperUtil;
import com.ist.timetabling.Subject.entity.EntitySubject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;


@Component
public class UtilSubjectCsv {

    private final CSVMapperUtil csvMapperUtil;
    private final SubjectCsvMapper subjectCsvMapper;

    @Autowired
    public UtilSubjectCsv(CSVMapperUtil csvMapperUtil, SubjectCsvMapper subjectCsvMapper) {
        this.csvMapperUtil = csvMapperUtil;
        this.subjectCsvMapper = subjectCsvMapper;
    }

   
    public String exportSubjectsToCsv(List<EntitySubject> subjects) throws IOException {
        return csvMapperUtil.exportToCsv(
                subjects,
                SubjectCsvMapper.CSV_HEADERS,
                subjectCsvMapper::mapToCSVRecord
        );
    }

  
    public String generateSubjectCsvTemplate() throws IOException {
        return csvMapperUtil.generateCsvTemplate(
                SubjectCsvMapper.CSV_HEADERS,
                subjectCsvMapper.generateExampleRows()
        );
    }
}