package com.ist.timetabling.Student.util;

import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Student.dto.req.DtoReqStudent;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;


@Component
public class StudentCsvMapper {

    public static final String[] CSV_HEADERS = {
            "studentIdNumber", "fullName", "email", "phone",
            "department", "address", "notes", "statusId", "classId",
            "firstName", "lastName"
    };

    private final CSVReaderUtil csvReaderUtil;

    @Autowired
    public StudentCsvMapper(CSVReaderUtil csvReaderUtil) {
        this.csvReaderUtil = csvReaderUtil;
    }

    
    public DtoReqStudent mapToStudentRequest(CSVRecord record, Integer organizationId, int rowNumber) {
        try {
            String studentIdNumber = getRequiredField(record, "studentIdNumber", "Student ID Number is required", rowNumber);
            String fullName = getRequiredField(record, "fullName", "Full name is required", rowNumber);

            
            DtoReqStudent studentRequest = new DtoReqStudent();
            studentRequest.setOrganizationId(organizationId);
            studentRequest.setStudentIdNumber(studentIdNumber);
            studentRequest.setFullName(fullName);

           
            if(record.isMapped("classId") && StringUtils.hasText(record.get("classId"))) {
                try {
                    studentRequest.setClassId(Integer.parseInt(record.get("classId")));
                }catch(NumberFormatException e) {
                    studentRequest.setClassId(0);
                }
            }else {
                studentRequest.setClassId(0);
            }

            
            if(record.isMapped("email") && StringUtils.hasText(record.get("email"))) {
                studentRequest.setEmail(record.get("email"));
            }

            if(record.isMapped("phone") && StringUtils.hasText(record.get("phone"))) {
                studentRequest.setPhone(record.get("phone"));
            }

            if(record.isMapped("department") && StringUtils.hasText(record.get("department"))) {
                studentRequest.setDepartment(record.get("department"));
            }

            if(record.isMapped("address") && StringUtils.hasText(record.get("address"))) {
                studentRequest.setAddress(record.get("address"));
            }

            if(record.isMapped("notes") && StringUtils.hasText(record.get("notes"))) {
                studentRequest.setNotes(record.get("notes"));
            }

            if(record.isMapped("firstName") && StringUtils.hasText(record.get("firstName"))) {
                studentRequest.setFirstName(record.get("firstName"));
            }

            if(record.isMapped("lastName") && StringUtils.hasText(record.get("lastName"))) {
                studentRequest.setLastName(record.get("lastName"));
            }

          
            if(record.isMapped("statusId") && StringUtils.hasText(record.get("statusId"))) {
                try {
                    studentRequest.setStatusId(Integer.parseInt(record.get("statusId")));
                }catch(NumberFormatException e) {
                    throw new CSVImportException("Invalid statusId: must be a number", rowNumber, record.toString());
                }
            }else {
                studentRequest.setStatusId(1); 
            }

            return studentRequest;
        }catch(CSVImportException e) {
            throw e;
        }catch(Exception e) {
            throw new CSVImportException(e.getMessage(), e, rowNumber, record.toString());
        }
    }

  
    public Object[] mapToCSVRecord(com.ist.timetabling.Student.dto.res.DtoResStudent student) {
        return new Object[]{
                student.getStudentIdNumber(),
                student.getFullName(),
                student.getEmail(),
                student.getPhone(),
                student.getDepartment(),
                student.getAddress(),
                student.getNotes(),
                student.getStatusId(),
                student.getClassId(),
                student.getFirstName(),
                student.getLastName()
        };
    }

  
    public List<String[]> generateExampleRows() {
        List<String[]> exampleRows = new ArrayList<>();

        exampleRows.add(new String[]{
                "S12345", "John Doe", "john.doe@example.com",
                "1234567890", "Computer Science", "123 Main St, City", "First-year student", "1", "1",
                "John", "Doe"
        });

        exampleRows.add(new String[]{
                "S67890", "Jane Smith", "jane.smith@example.com",
                "0987654321", "Engineering", "456 Second Ave, Town", "Transfer student", "2", "2",
                "Jane", "Smith"
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
