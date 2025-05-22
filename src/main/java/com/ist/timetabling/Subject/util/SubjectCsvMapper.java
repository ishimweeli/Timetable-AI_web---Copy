package com.ist.timetabling.Subject.util;

import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Subject.dto.req.DtoReqSubject;
import com.ist.timetabling.Subject.entity.EntitySubject;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;


@Component
public class SubjectCsvMapper {

    public static final String[] CSV_HEADERS = {
            "name", "initials", "description", "durationInMinutes", "redRepetition",
            "blueRepetition", "autoConflictHandling", "group", "conflictSubjectId", "statusId"
    };

    private final CSVReaderUtil csvReaderUtil;

    @Autowired
    public SubjectCsvMapper(CSVReaderUtil csvReaderUtil) {
        this.csvReaderUtil = csvReaderUtil;
    }

  
    public DtoReqSubject mapToSubjectRequest(CSVRecord record, Integer organizationId, int rowNumber) {
        try {
          
            String name = getRequiredField(record, "name", "Name is required", rowNumber);
            String initials = getRequiredField(record, "initials", "Initials is required", rowNumber);
            String durationStr = getRequiredField(record, "durationInMinutes", "Duration in minutes is required", rowNumber);
            String redRepetitionStr = getRequiredField(record, "redRepetition", "Red repetition is required", rowNumber);
            String blueRepetitionStr = getRequiredField(record, "blueRepetition", "Blue repetition is required", rowNumber);
            String autoConflictStr = getRequiredField(record, "autoConflictHandling", "Auto conflict handling is required", rowNumber);

        
            int durationInMinutes;
            try {
                durationInMinutes = Integer.parseInt(durationStr);
                if(durationInMinutes < 1) {
                    throw new CSVImportException("Duration must be at least 1 minute", rowNumber, record.toString());
                }
            }catch(NumberFormatException e) {
                throw new CSVImportException("Invalid duration: must be a number", rowNumber, record.toString());
            }

        
            boolean redRepetition = parseBooleanField(redRepetitionStr, "redRepetition", rowNumber, record);
            boolean blueRepetition = parseBooleanField(blueRepetitionStr, "blueRepetition", rowNumber, record);
            boolean autoConflictHandling = parseBooleanField(autoConflictStr, "autoConflictHandling", rowNumber, record);

   
            DtoReqSubject dtoReqSubject = new DtoReqSubject();
            dtoReqSubject.setName(name);
            dtoReqSubject.setInitials(initials);
            dtoReqSubject.setDurationInMinutes(durationInMinutes);
            dtoReqSubject.setRedRepetition(redRepetition);
            dtoReqSubject.setBlueRepetition(blueRepetition);
            dtoReqSubject.setAutoConflictHandling(autoConflictHandling);
            dtoReqSubject.setOrganizationId(organizationId);

       
            if(record.isMapped("description") && StringUtils.hasText(record.get("description"))) {
                dtoReqSubject.setDescription(record.get("description"));
            }else {
                dtoReqSubject.setDescription("");
            }

            if(record.isMapped("group") && StringUtils.hasText(record.get("group"))) {
                dtoReqSubject.setGroup(record.get("group"));
            }else {
                dtoReqSubject.setGroup("");
            }

            if(record.isMapped("conflictSubjectId") && StringUtils.hasText(record.get("conflictSubjectId"))) {
                try {
                    int conflictSubjectId = Integer.parseInt(record.get("conflictSubjectId"));
                    dtoReqSubject.setConflictSubjectId(conflictSubjectId);
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid conflict subject ID: must be a number", rowNumber, record.toString());
                }
            }else {
                dtoReqSubject.setConflictSubjectId(0);
            }

            if(record.isMapped("statusId") && StringUtils.hasText(record.get("statusId"))) {
                try {
                    int statusId = Integer.parseInt(record.get("statusId"));
                    dtoReqSubject.setStatusId(statusId);
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid status ID: must be a number", rowNumber, record.toString());
                }
            }else {
                dtoReqSubject.setStatusId(1); 
            }

            return dtoReqSubject;
        }catch(CSVImportException e) {
            throw e;
        }catch(Exception e) {
            throw new CSVImportException(e.getMessage(), e, rowNumber, record.toString());
        }
    }

    
    public Object[] mapToCSVRecord(EntitySubject entitySubject) {
        return new Object[]{
                entitySubject.getName(),
                entitySubject.getInitials(),
                entitySubject.getDescription(),
                entitySubject.getDurationInMinutes(),
                entitySubject.getRedRepetition(),
                entitySubject.getBlueRepetition(),
                entitySubject.getAutoConflictHandling(),
                entitySubject.getGroup(),
                entitySubject.getConflictSubjectId(),
                entitySubject.getStatusId()
        };
    }

   
    public List<String[]> generateExampleRows() {
        List<String[]> exampleRows = new ArrayList<>();

        exampleRows.add(new String[]{
                "Mathematics", "MATH", "Core mathematics curriculum", "45", "true",
                "false", "true", "Science", "0", "1"
        });

        exampleRows.add(new String[]{
                "Physics", "PHYS", "General physics with lab work", "60", "false",
                "true", "true", "Science", "0", "1"
        });

        return exampleRows;
    }

    
    private String getRequiredField(CSVRecord record, String fieldName, String errorMessage, int rowNumber) {
        if(!record.isMapped(fieldName) || !StringUtils.hasText(record.get(fieldName))) {
            throw new CSVImportException(errorMessage, rowNumber, record.toString());
        }
        return record.get(fieldName);
    }

   
    private boolean parseBooleanField(String value, String fieldName, int rowNumber, CSVRecord record) {
        if(value.equalsIgnoreCase("true") || value.equalsIgnoreCase("false")) {
            return Boolean.parseBoolean(value);
        }else {
            throw new CSVImportException("Invalid " + fieldName + " value: must be 'true' or 'false'",
                    rowNumber, record.toString());
        }
    }
}
