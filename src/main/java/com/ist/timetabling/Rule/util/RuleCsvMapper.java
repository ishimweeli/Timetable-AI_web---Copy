package com.ist.timetabling.Rule.util;

import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Rule.dto.req.DtoReqRule;
import com.ist.timetabling.Rule.entity.EntityRule;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;


@Component
public class RuleCsvMapper {

    public static final String[] CSV_HEADERS = {
            "name", "initials", "data", "priority", "isEnabled", "statusId", "comment"
    };

    private final CSVReaderUtil csvReaderUtil;

    @Autowired
    public RuleCsvMapper(CSVReaderUtil csvReaderUtil) {
        this.csvReaderUtil = csvReaderUtil;
    }

   
    public DtoReqRule mapToRuleRequest(CSVRecord record, Integer organizationId, int rowNumber) {
        try {
            String name = getRequiredField(record, "name", "Name is required", rowNumber);
            String initials = getRequiredField(record, "initials", "Initials is required", rowNumber);
            String data = getRequiredField(record, "data", "Data is required", rowNumber);
            String priorityStr = getRequiredField(record, "priority", "Priority is required", rowNumber);
            String isEnabledStr = getRequiredField(record, "isEnabled", "isEnabled flag is required", rowNumber);

            
            int priority;
            try {
                priority = Integer.parseInt(priorityStr);
            }catch(NumberFormatException e) {
                throw new CSVImportException("Invalid priority: must be a number", rowNumber, record.toString());
            }

           
            boolean isEnabled;
            if(isEnabledStr.equalsIgnoreCase("true") || isEnabledStr.equalsIgnoreCase("false")) {
                isEnabled = Boolean.parseBoolean(isEnabledStr);
            }else {
                throw new CSVImportException("Invalid isEnabled value: must be 'true' or 'false'", rowNumber, record.toString());
            }

           
            DtoReqRule dtoReqRule = new DtoReqRule();
            dtoReqRule.setName(name);
            dtoReqRule.setInitials(initials);
            dtoReqRule.setData(data);
            dtoReqRule.setPriority(priority);
            dtoReqRule.setEnabled(isEnabled);
            dtoReqRule.setOrganizationId(organizationId);

       
            if(record.isMapped("statusId") && StringUtils.hasText(record.get("statusId"))) {
                try {
                    int statusId = Integer.parseInt(record.get("statusId"));
                    dtoReqRule.setStatusId(statusId);
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid status ID: must be a number", rowNumber, record.toString());
                }
            }else {
                dtoReqRule.setStatusId(1); 
            }

            if(record.isMapped("comment") && StringUtils.hasText(record.get("comment"))) {
                dtoReqRule.setComment(record.get("comment"));
            }

            return dtoReqRule;
        }catch(CSVImportException e) {
            throw e;
        }catch(Exception e) {
            throw new CSVImportException(e.getMessage(), e, rowNumber, record.toString());
        }
    }

    public Object[] mapToCSVRecord(EntityRule entityRule) {
        return new Object[]{
                entityRule.getName(),
                entityRule.getInitials(),
                entityRule.getData(),
                entityRule.getPriority(),
                entityRule.isEnabled(),
                entityRule.getStatusId(),
                entityRule.getComment()
        };
    }

   
    public List<String[]> generateExampleRows() {
        List<String[]> exampleRows = new ArrayList<>();

        exampleRows.add(new String[]{
                "No back-to-back classes", "NBTB", "{\"type\":\"constraint\",\"constraintType\":\"classScheduling\"}", "10", "true", "1", "Prevents teachers from having classes in consecutive periods without breaks"
        });

        exampleRows.add(new String[]{
                "Maximum 6 periods per day", "MAX6", "{\"type\":\"constraint\",\"maxPeriods\":6}", "8", "true", "1", "Limits teachers to a maximum of 6 teaching periods per day"
        });

        return exampleRows;
    }

   
    private String getRequiredField(CSVRecord record, String fieldName, String errorMessage, int rowNumber) {
        if(!record.isMapped(fieldName) || !StringUtils.hasText(record.get(fieldName))) {
            throw new CSVImportException(errorMessage, rowNumber, record.toString());
        }
        return record.get(fieldName);
    }
}
