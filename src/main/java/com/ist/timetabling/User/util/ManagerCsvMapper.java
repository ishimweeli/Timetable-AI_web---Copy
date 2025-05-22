package com.ist.timetabling.User.util;

import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.User.dto.req.DtoReqManager;
import com.ist.timetabling.User.dto.res.DtoResManager;
import com.ist.timetabling.User.entity.EntityManagerProfile;
import com.ist.timetabling.User.entity.EntityUser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;


@Component
public class ManagerCsvMapper {

    public static final String[] CSV_HEADERS = {
            "email", "firstName", "lastName", "phone", "statusId",
            "canGenerateTimetable", "canManageTeachers", "canManageStudents", "canCreateManagers"
    };

    private final CSVReaderUtil csvReaderUtil;

    @Autowired
    public ManagerCsvMapper(CSVReaderUtil csvReaderUtil) {
        this.csvReaderUtil = csvReaderUtil;
    }

   
    public DtoReqManager mapToManagerRequest(CSVRecord record, Integer organizationId, int rowNumber) {
        try {
            String email = getRequiredField(record, "email", "Email is required", rowNumber);
            String firstName = getRequiredField(record, "firstName", "First name is required", rowNumber);
            String lastName = getRequiredField(record, "lastName", "Last name is required", rowNumber);

            DtoReqManager dtoReqManager = new DtoReqManager();
            dtoReqManager.setEmail(email);
            dtoReqManager.setFirstName(firstName);
            dtoReqManager.setLastName(lastName);
            dtoReqManager.setOrganizationId(organizationId);

            if(record.isMapped("phone") && StringUtils.hasText(record.get("phone"))) {
                dtoReqManager.setPhone(record.get("phone"));
            }

            if(record.isMapped("statusId") && StringUtils.hasText(record.get("statusId"))) {
                try {
                    dtoReqManager.setStatusId(Integer.parseInt(record.get("statusId")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid status ID: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("canGenerateTimetable") && StringUtils.hasText(record.get("canGenerateTimetable"))) {
                dtoReqManager.setCanGenerateTimetable(Boolean.parseBoolean(record.get("canGenerateTimetable")));
            }

            if(record.isMapped("canManageTeachers") && StringUtils.hasText(record.get("canManageTeachers"))) {
                dtoReqManager.setCanManageTeachers(Boolean.parseBoolean(record.get("canManageTeachers")));
            }

            if(record.isMapped("canManageStudents") && StringUtils.hasText(record.get("canManageStudents"))) {
                dtoReqManager.setCanManageStudents(Boolean.parseBoolean(record.get("canManageStudents")));
            }

            if(record.isMapped("canCreateManagers") && StringUtils.hasText(record.get("canCreateManagers"))) {
                dtoReqManager.setCanCreateManagers(Boolean.parseBoolean(record.get("canCreateManagers")));
            }

            return dtoReqManager;
        }catch(CSVImportException e) {
            throw e;
        }catch(Exception e) {
            throw new CSVImportException(e.getMessage(), e, rowNumber, record.toString());
        }
    }

   
    public DtoResManager mapToManagerResponse(EntityUser user, EntityManagerProfile profile) {
        DtoResManager dtoResManager = new DtoResManager();
        dtoResManager.setUuid(user.getUuid());
        dtoResManager.setEmail(user.getEmail());
        dtoResManager.setFirstName(user.getFirstName());
        dtoResManager.setLastName(user.getLastName());
        dtoResManager.setPhone(user.getPhone());
        dtoResManager.setStatusId(user.getStatusId());
        dtoResManager.setIsActive(user.getIsActive());
        dtoResManager.setIsDeleted(user.getIsDeleted());
        dtoResManager.setCreatedDate(user.getCreatedDate());
        dtoResManager.setModifiedDate(user.getModifiedDate());
        dtoResManager.setRole(user.getEntityRole().getName());
        dtoResManager.setOrganizationId(user.getOrganization().getId());
        dtoResManager.setCanGenerateTimetable(profile.getCanGenerateTimetable());
        dtoResManager.setCanManageTeachers(profile.getCanManageTeachers());
        dtoResManager.setCanManageStudents(profile.getCanManageStudents());
        dtoResManager.setCanCreateManagers(profile.getCanCreateManagers());
        return dtoResManager;
    }

 
    public Object[] mapToCSVRecord(EntityUser user, EntityManagerProfile profile) {
        return new Object[]{
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getStatusId(),
                profile.getCanGenerateTimetable(),
                profile.getCanManageTeachers(),
                profile.getCanManageStudents(),
                profile.getCanCreateManagers()
        };
    }

   
    public List<String[]> generateExampleRows() {
        List<String[]> exampleRows = new ArrayList<>();

        exampleRows.add(new String[]{
                "manager1@example.com", "John", "Doe", "1234567890", "1",
                "true", "true", "false", "false"
        });

        exampleRows.add(new String[]{
                "manager2@example.com", "Jane", "Smith", "0987654321", "1",
                "false", "true", "true", "true"
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
