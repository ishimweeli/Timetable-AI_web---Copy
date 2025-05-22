package com.ist.timetabling.Teacher.util;

import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Teacher.dto.req.DtoReqTeacher;
import com.ist.timetabling.Teacher.dto.res.DtoResTeacher;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Component
public class TeacherCsvMapper {

    public static final String[] CSV_HEADERS = {
            "email", "phone", "firstName", "lastName", "initials", "department",
            "qualification", "contractType", "controlNumber", "notes", "bio",
            "maxDailyHours", "preferredStartTime", "preferredEndTime"
    };

    private final CSVReaderUtil csvReaderUtil;

    @Autowired
    public TeacherCsvMapper(CSVReaderUtil csvReaderUtil) {
        this.csvReaderUtil = csvReaderUtil;
    }

   
    public DtoReqTeacher mapToTeacherRequest(CSVRecord record, Integer organizationId, int rowNumber) {
        try {
       
            String email = getRequiredField(record, "email", "Email is required", rowNumber);
            String firstName = getRequiredField(record, "firstName", "First name is required", rowNumber);
            String lastName = getRequiredField(record, "lastName", "Last name is required", rowNumber);

           
            DtoReqTeacher dtoReqTeacher = new DtoReqTeacher();
            dtoReqTeacher.setEmail(email);
            dtoReqTeacher.setFirstName(firstName);
            dtoReqTeacher.setLastName(lastName);
            dtoReqTeacher.setOrganizationId(organizationId);
            dtoReqTeacher.setStatusId(1);

         
            if(record.isMapped("phone") && StringUtils.hasText(record.get("phone"))) {
                dtoReqTeacher.setPhone(record.get("phone"));
            }

            if(record.isMapped("initials") && StringUtils.hasText(record.get("initials"))) {
                dtoReqTeacher.setInitials(record.get("initials"));
            }

            if(record.isMapped("department") && StringUtils.hasText(record.get("department"))) {
                dtoReqTeacher.setDepartment(record.get("department"));
            }

            if(record.isMapped("qualification") && StringUtils.hasText(record.get("qualification"))) {
                dtoReqTeacher.setQualification(record.get("qualification"));
            }

            if(record.isMapped("contractType") && StringUtils.hasText(record.get("contractType"))) {
                dtoReqTeacher.setContractType(record.get("contractType"));
            }

            if(record.isMapped("controlNumber") && StringUtils.hasText(record.get("controlNumber"))) {
                try {
                    dtoReqTeacher.setControlNumber(Integer.parseInt(record.get("controlNumber")));
                } catch (NumberFormatException e) {
                    throw new CSVImportException("Invalid controlNumber: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("notes") && StringUtils.hasText(record.get("notes"))) {
                dtoReqTeacher.setNotes(record.get("notes"));
            }

            if(record.isMapped("bio") && StringUtils.hasText(record.get("bio"))) {
                dtoReqTeacher.setBio(record.get("bio"));
            }

            if(record.isMapped("maxDailyHours") && StringUtils.hasText(record.get("maxDailyHours"))) {
                try {
                    dtoReqTeacher.setMaxDailyHours(Integer.parseInt(record.get("maxDailyHours")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid maxDailyHours: must be a number", rowNumber, record.toString());
                }
            }

            if(record.isMapped("preferredStartTime") && StringUtils.hasText(record.get("preferredStartTime"))) {
                try {
                    dtoReqTeacher.setPreferredStartTime(LocalTime.parse(record.get("preferredStartTime"),
                            DateTimeFormatter.ofPattern("HH:mm:ss")));
                }catch(DateTimeParseException e) {
                    throw new CSVImportException("Invalid preferredStartTime: must be in format HH:mm:ss", rowNumber, record.toString());
                }
            }

            if(record.isMapped("preferredEndTime") && StringUtils.hasText(record.get("preferredEndTime"))) {
                try {
                    dtoReqTeacher.setPreferredEndTime(LocalTime.parse(record.get("preferredEndTime"),
                            DateTimeFormatter.ofPattern("HH:mm:ss")));
                }catch(DateTimeParseException e) {
                    throw new CSVImportException("Invalid preferredEndTime: must be in format HH:mm:ss", rowNumber, record.toString());
                }
            }

            return dtoReqTeacher;
        }catch(CSVImportException e) {
            throw e;
        }catch(Exception e) {
            throw new CSVImportException(e.getMessage(), e, rowNumber, record.toString());
        }
    }

  
    public Object[] mapToCSVRecord(DtoResTeacher teacher) {
        String preferredStartTime = teacher.getPreferredStartTime() != null ?
                teacher.getPreferredStartTime().format(DateTimeFormatter.ofPattern("HH:mm:ss")) : "";

        String preferredEndTime = teacher.getPreferredEndTime() != null ?
                teacher.getPreferredEndTime().format(DateTimeFormatter.ofPattern("HH:mm:ss")) : "";

        return new Object[]{
                teacher.getEmail(),
                teacher.getPhone(),
                teacher.getFirstName(),
                teacher.getLastName(),
                teacher.getInitials(),
                teacher.getDepartment(),
                teacher.getQualification(),
                teacher.getContractType(),
                teacher.getControlNumber(),
                teacher.getNotes(),
                teacher.getBio(),
                teacher.getMaxDailyHours(),
                preferredStartTime,
                preferredEndTime
        };
    }

   
    public List<String[]> generateExampleRows() {
        List<String[]> exampleRows = new ArrayList<>();

        exampleRows.add(new String[]{
                "john.doe@example.com", "1234567890", "John", "Doe", "JD", "Mathematics",
                "Master's in Mathematics", "Full-time", "T12345", "Experienced math teacher",
                "Teaching mathematics for 10 years", "8", "08:00:00", "16:00:00"
        });

        exampleRows.add(new String[]{
                "jane.smith@example.com", "0987654321", "Jane", "Smith", "JS", "English",
                "PhD in Literature", "Part-time", "T67890", "Specializes in creative writing",
                "Award-winning author and educator", "6", "10:00:00", "17:00:00"
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
