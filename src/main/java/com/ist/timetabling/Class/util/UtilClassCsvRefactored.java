package com.ist.timetabling.Class.util;

import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Core.util.CSVMapperUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;


@Component
public class UtilClassCsvRefactored {

    private final CSVMapperUtil csvMapperUtil;
    private final ClassCsvMapper classCsvMapper;

    @Autowired
    public UtilClassCsvRefactored(CSVMapperUtil csvMapperUtil, ClassCsvMapper classCsvMapper) {
        this.csvMapperUtil = csvMapperUtil;
        this.classCsvMapper = classCsvMapper;
    }

  
    public String exportClassesToCsv(List<EntityClass> classes) throws IOException {
        return csvMapperUtil.exportToCsv(
                classes,
                ClassCsvMapper.CSV_HEADERS,
                classCsvMapper::mapToCSVRecord
        );
    }

   
    public String generateClassCsvTemplate() throws IOException {
        return csvMapperUtil.generateCsvTemplate(
                ClassCsvMapper.CSV_HEADERS,
                classCsvMapper.generateExampleRows()
        );
    }
}