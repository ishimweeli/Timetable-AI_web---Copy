package com.ist.timetabling.User.util;

import com.ist.timetabling.Core.util.CSVMapperUtil;
import com.ist.timetabling.User.entity.EntityManagerProfile;
import com.ist.timetabling.User.entity.EntityUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
public class UtilManagerCsv {

    private final CSVMapperUtil csvMapperUtil;
    private final ManagerCsvMapper managerCsvMapper;

    @Autowired
    public UtilManagerCsv(CSVMapperUtil csvMapperUtil, ManagerCsvMapper managerCsvMapper) {
        this.csvMapperUtil = csvMapperUtil;
        this.managerCsvMapper = managerCsvMapper;
    }

    
    public String exportManagersToCsv(Map<EntityUser, EntityManagerProfile> managers) throws IOException {
        return csvMapperUtil.exportToCsv(
                managers.entrySet().stream().toList(),
                ManagerCsvMapper.CSV_HEADERS,
                entry -> managerCsvMapper.mapToCSVRecord(entry.getKey(), entry.getValue())
        );
    }

    public String generateManagerCsvTemplate() throws IOException {
        return csvMapperUtil.generateCsvTemplate(
                ManagerCsvMapper.CSV_HEADERS,
                managerCsvMapper.generateExampleRows()
        );
    }
}