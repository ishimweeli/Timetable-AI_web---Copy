package com.ist.timetabling.Organization.util;

import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Organization.dto.req.DtoReqOrganization;
import com.ist.timetabling.Organization.dto.res.DtoResOrganization;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;


@Component
public class OrganizationCsvMapper {

    public static final String[] CSV_HEADERS = {
            "name", "address", "contactEmail", "contactPhone", "statusId"
    };

    private final CSVReaderUtil csvReaderUtil;

    @Autowired
    public OrganizationCsvMapper(CSVReaderUtil csvReaderUtil) {
        this.csvReaderUtil = csvReaderUtil;
    }

  
    public DtoReqOrganization mapToOrganizationRequest(CSVRecord record, int rowNumber) {
        try {
          
            String name = getRequiredField(record, "name", "Name is required", rowNumber);
            String address = getRequiredField(record, "address", "Address is required", rowNumber);
            String contactEmail = getRequiredField(record, "contactEmail", "Contact email is required", rowNumber);
            String contactPhone = getRequiredField(record, "contactPhone", "Contact phone is required", rowNumber);

            if(!contactEmail.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
                throw new CSVImportException("Invalid email format", rowNumber, record.toString());
            }

            
            if(!contactPhone.matches("^\\+?[0-9]{10,15}$")) {
                throw new CSVImportException("Invalid phone format (should be +XXXXXXXXXX or XXXXXXXXXX)", rowNumber, record.toString());
            }

            
            DtoReqOrganization dtoReqOrganization = new DtoReqOrganization();
            dtoReqOrganization.setName(name);
            dtoReqOrganization.setAddress(address);
            dtoReqOrganization.setContactEmail(contactEmail);
            dtoReqOrganization.setContactPhone(contactPhone);

           
            if(record.isMapped("statusId") && StringUtils.hasText(record.get("statusId"))) {
                try {
                    int statusId = Integer.parseInt(record.get("statusId"));
                    if(statusId < 0 || statusId > 1) {
                        throw new CSVImportException("Status ID must be 0 or 1", rowNumber, record.toString());
                    }
                    dtoReqOrganization.setStatusId(statusId);
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid status ID: must be a number", rowNumber, record.toString());
                }
            }else {
                dtoReqOrganization.setStatusId(1);
            }

            return dtoReqOrganization;
        }catch(CSVImportException e) {
            throw e;
        }catch(Exception e) {
            throw new CSVImportException(e.getMessage(), e, rowNumber, record.toString());
        }
    }

   
    public DtoResOrganization mapToOrganizationResponse(EntityOrganization entityOrganization) {
        DtoResOrganization dtoResOrganization = new DtoResOrganization();
        dtoResOrganization.setId(entityOrganization.getId());
        dtoResOrganization.setUuid(entityOrganization.getUuid());
        dtoResOrganization.setName(entityOrganization.getName());
        dtoResOrganization.setAddress(entityOrganization.getAddress());
        dtoResOrganization.setContactEmail(entityOrganization.getContactEmail());
        dtoResOrganization.setContactPhone(entityOrganization.getContactPhone());
        dtoResOrganization.setStatusId(entityOrganization.getStatusId());
        dtoResOrganization.setCreatedBy(entityOrganization.getCreatedBy());
        dtoResOrganization.setModifiedBy(entityOrganization.getModifiedBy());
        dtoResOrganization.setCreatedDate(entityOrganization.getCreatedDate());
        dtoResOrganization.setModifiedDate(entityOrganization.getModifiedDate());
        return dtoResOrganization;
    }

    public Object[] mapToCSVRecord(EntityOrganization entityOrganization) {
        return new Object[]{
                entityOrganization.getName(),
                entityOrganization.getAddress(),
                entityOrganization.getContactEmail(),
                entityOrganization.getContactPhone(),
                entityOrganization.getStatusId()
        };
    }

    
    public List<String[]> generateExampleRows() {
        List<String[]> exampleRows = new ArrayList<>();

        exampleRows.add(new String[]{
                "ABC School", "123 Main Street, Kigali", "contact@abcschool.rw", "+250789123456", "1"
        });

        exampleRows.add(new String[]{
                "XYZ College", "456 College Road, Kigali", "info@xyzcollege.rw", "+250722987654", "1"
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
