package com.ist.timetabling.Rule.util;

import com.ist.timetabling.Core.util.CSVMapperUtil;
import com.ist.timetabling.Rule.entity.EntityRule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;


@Component
public class UtilRuleCsv {

    private final CSVMapperUtil csvMapperUtil;
    private final RuleCsvMapper ruleCsvMapper;

    @Autowired
    public UtilRuleCsv(CSVMapperUtil csvMapperUtil, RuleCsvMapper ruleCsvMapper) {
        this.csvMapperUtil = csvMapperUtil;
        this.ruleCsvMapper = ruleCsvMapper;
    }

   
    public String exportRulesToCsv(List<EntityRule> rules) throws IOException {
        return csvMapperUtil.exportToCsv(
                rules,
                RuleCsvMapper.CSV_HEADERS,
                ruleCsvMapper::mapToCSVRecord
        );
    }

    public String generateRuleCsvTemplate() throws IOException {
        return csvMapperUtil.generateCsvTemplate(
                RuleCsvMapper.CSV_HEADERS,
                ruleCsvMapper.generateExampleRows()
        );
    }
}