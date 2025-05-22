package com.ist.timetabling.Core.util;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class CSVReaderUtil {

    
    public List<CSVRecord> parseCSV(MultipartFile file, String[] headers, boolean skipHeaderRow) throws IOException {
        if(file.isEmpty()) {
            throw new IOException("CSV file is empty");
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader(headers)
                    .setSkipHeaderRecord(skipHeaderRow)
                    .setIgnoreEmptyLines(true)
                    .setTrim(true)
                    .build();

            try (CSVParser csvParser = new CSVParser(reader, csvFormat)) {
                return csvParser.getRecords();
            }
        }
    }

    
    public List<CSVRecord> parseCSV(InputStream inputStream, String[] headers, boolean skipHeaderRow) throws IOException {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

            CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                    .setHeader(headers)
                    .setSkipHeaderRecord(skipHeaderRow)
                    .setIgnoreEmptyLines(true)
                    .setTrim(true)
                    .build();

            try (CSVParser csvParser = new CSVParser(reader, csvFormat)) {
                return csvParser.getRecords();
            }
        }
    }

    
    public String getRequiredField(CSVRecord record, String fieldName, String errorMessage) throws Exception {
        if(!record.isMapped(fieldName) || !hasText(record.get(fieldName))) {
            throw new Exception(errorMessage);
        }
        return record.get(fieldName);
    }

    public String getOptionalStringField(CSVRecord record, String fieldName) {
        if(record.isMapped(fieldName) && hasText(record.get(fieldName))) {
            return record.get(fieldName);
        }
        return null;
    }

   
    public Integer getOptionalIntegerField(CSVRecord record, String fieldName) throws Exception {
        if(record.isMapped(fieldName) && hasText(record.get(fieldName))) {
            try {
                return Integer.parseInt(record.get(fieldName));
            }catch(NumberFormatException e) {
                throw new Exception("Invalid " + fieldName + ": must be a number");
            }
        }
        return null;
    }

    public Boolean getOptionalBooleanField(CSVRecord record, String fieldName) {
        if(record.isMapped(fieldName) && hasText(record.get(fieldName))) {
            return Boolean.parseBoolean(record.get(fieldName));
        }
        return null;
    }

   
    private boolean hasText(String str) {
        return str != null && !str.trim().isEmpty();
    }
}
