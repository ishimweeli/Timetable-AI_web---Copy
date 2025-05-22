package com.ist.timetabling.Organization.util;

import com.ist.timetabling.Core.util.CSVMapperUtil;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;


@Component
public class UtilOrganizationCsv {

    private final CSVMapperUtil csvMapperUtil;
    private final OrganizationCsvMapper organizationCsvMapper;

    @Autowired
    public UtilOrganizationCsv(CSVMapperUtil csvMapperUtil, OrganizationCsvMapper organizationCsvMapper) {
        this.csvMapperUtil = csvMapperUtil;
        this.organizationCsvMapper = organizationCsvMapper;
    }

    
    public String exportOrganizationsToCsv(List<EntityOrganization> organizations) throws IOException {
        return csvMapperUtil.exportToCsv(
                organizations,
                OrganizationCsvMapper.CSV_HEADERS,
                organizationCsvMapper::mapToCSVRecord
        );
    }

  
    public String generateOrganizationCsvTemplate() throws IOException {
        return csvMapperUtil.generateCsvTemplate(
                OrganizationCsvMapper.CSV_HEADERS,
                organizationCsvMapper.generateExampleRows()
        );
    }
}