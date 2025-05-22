package com.ist.timetabling.Room.util;

import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Room.dto.req.DtoReqRoom;
import com.ist.timetabling.Room.dto.res.DtoResRoom;
import com.ist.timetabling.Room.entity.EntityRoom;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;


@Component
public class RoomCsvMapper {

    public static final String[] CSV_HEADERS = {
            "name", "code", "capacity", "description", "statusId",
            "initials", "controlNumber", "priority", "locationNumber"
    };

    private final CSVReaderUtil csvReaderUtil;

    @Autowired
    public RoomCsvMapper(CSVReaderUtil csvReaderUtil) {
        this.csvReaderUtil = csvReaderUtil;
    }

    
    public DtoReqRoom mapToRoomRequest(CSVRecord record, Integer organizationId, int rowNumber) {
        try {
          
            String name = getRequiredField(record, "name", "Name is required", rowNumber);
            String code = getRequiredField(record, "code", "Code is required", rowNumber);
            Integer capacity = getRequiredIntField(record, "capacity", "Capacity is required", rowNumber);
            Integer statusId = getRequiredIntField(record, "statusId", "Status ID is required", rowNumber);

          
            DtoReqRoom dtoReqRoom = new DtoReqRoom();
            dtoReqRoom.setName(name);
            dtoReqRoom.setCode(code);
            dtoReqRoom.setCapacity(capacity);
            dtoReqRoom.setStatusId(statusId);
            dtoReqRoom.setOrganizationId(organizationId);

         
            if(record.isMapped("description") && StringUtils.hasText(record.get("description"))) {
                dtoReqRoom.setDescription(record.get("description"));
            }

            if(record.isMapped("initials") && StringUtils.hasText(record.get("initials"))) {
                dtoReqRoom.setInitials(record.get("initials"));
            }

            if(record.isMapped("controlNumber") && StringUtils.hasText(record.get("controlNumber"))) {
                try {
                    dtoReqRoom.setControlNumber(Integer.parseInt(record.get("controlNumber")));
                } catch (NumberFormatException e) {
                    throw new CSVImportException("Invalid controlNumber: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("priority") && StringUtils.hasText(record.get("priority"))) {
                dtoReqRoom.setPriority(record.get("priority"));
            }

            if(record.isMapped("locationNumber") && StringUtils.hasText(record.get("locationNumber"))) {
                try {
                    dtoReqRoom.setLocationNumber(Integer.parseInt(record.get("locationNumber")));
                } catch(NumberFormatException e) {
                    dtoReqRoom.setLocationNumber(1);
                }
            } else {
                dtoReqRoom.setLocationNumber(1);
            }

            return dtoReqRoom;
        }catch(CSVImportException e) {
            throw e;
        }catch(Exception e) {
            throw new CSVImportException(e.getMessage(), e, rowNumber, record.toString());
        }
    }

   
    public DtoResRoom mapToRoomResponse(EntityRoom entityRoom) {
        DtoResRoom dtoResRoom = new DtoResRoom();
        dtoResRoom.setId(entityRoom.getId());
        dtoResRoom.setUuid(entityRoom.getUuid());
        dtoResRoom.setName(entityRoom.getName());
        dtoResRoom.setCode(entityRoom.getCode());
        dtoResRoom.setCapacity(entityRoom.getCapacity());
        dtoResRoom.setDescription(entityRoom.getDescription());
        dtoResRoom.setStatusId(entityRoom.getStatusId());
        dtoResRoom.setInitials(entityRoom.getInitials());
        dtoResRoom.setControlNumber(entityRoom.getControlNumber());
        dtoResRoom.setPriority(entityRoom.getPriority());
        dtoResRoom.setOrganizationId(entityRoom.getOrganizationId());
        dtoResRoom.setPlanSettingsId(entityRoom.getPlanSettingsId());
        dtoResRoom.setCreatedBy(entityRoom.getCreatedBy());
        dtoResRoom.setModifiedBy(entityRoom.getModifiedBy());
        dtoResRoom.setCreatedDate(entityRoom.getCreatedDate());
        dtoResRoom.setModifiedDate(entityRoom.getModifiedDate());
        dtoResRoom.setLocationNumber(entityRoom.getLocationNumber());
        return dtoResRoom;
    }

   
    public Object[] mapToCSVRecord(EntityRoom entityRoom) {
        return new Object[]{
                entityRoom.getName(),
                entityRoom.getCode(),
                entityRoom.getCapacity(),
                entityRoom.getDescription(),
                entityRoom.getStatusId(),
                entityRoom.getInitials(),
                entityRoom.getControlNumber(),
                entityRoom.getPriority(),
                entityRoom.getLocationNumber()
        };
    }

  
    public List<String[]> generateExampleRows() {
        List<String[]> exampleRows = new ArrayList<>();

        exampleRows.add(new String[]{
                "Classroom A101", "A101", "30", "Standard classroom", "1",
                "A1", "101", "High", "1"
        });

        exampleRows.add(new String[]{
                "Science Lab B202", "B202", "25", "Science laboratory with equipment", "1",
                "SL", "202", "Medium", "2"
        });

        return exampleRows;
    }

   
    private String getRequiredField(CSVRecord record, String fieldName, String errorMessage, int rowNumber) {
        if(!record.isMapped(fieldName) || !StringUtils.hasText(record.get(fieldName))) {
            throw new CSVImportException(errorMessage, rowNumber, record.toString());
        }
        return record.get(fieldName);
    }

    
    private Integer getRequiredIntField(CSVRecord record, String fieldName, String errorMessage, int rowNumber) {
        String value = getRequiredField(record, fieldName, errorMessage, rowNumber);
        try {
            return Integer.parseInt(value);
        }catch(NumberFormatException e) {
            throw new CSVImportException("Invalid " + fieldName + ": must be a number", rowNumber, record.toString());
        }
    }
}
