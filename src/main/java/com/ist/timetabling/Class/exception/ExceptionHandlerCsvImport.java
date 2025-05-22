package com.ist.timetabling.Class.exception;

import com.ist.timetabling.Core.model.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;


@ControllerAdvice
@Slf4j
public class ExceptionHandlerCsvImport {

   
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<String>> handleMaxSizeException(MaxUploadSizeExceededException exc) {
        log.error("File size limit exceeded: {}", exc.getMessage());
        ApiResponse<String> response = ApiResponse.<String>builder()
                .status(HttpStatus.PAYLOAD_TOO_LARGE.value())
                .success(false)
                .message("File size exceeds the maximum allowed limit.")
                .time(System.currentTimeMillis())
                .build();
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(response);
    }

   
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiResponse<String>> handleMultipartException(MultipartException exc) {
        log.error("Multipart file upload error: {}", exc.getMessage());
        ApiResponse<String> response = ApiResponse.<String>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .success(false)
                .message("Error processing the uploaded file: " + exc.getMessage())
                .time(System.currentTimeMillis())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

   
    @ExceptionHandler(CsvImportException.class)
    public ResponseEntity<ApiResponse<String>> handleCsvImportException(CsvImportException exc) {
        log.error("CSV import error: {}", exc.getMessage());
        ApiResponse<String> response = ApiResponse.<String>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .success(false)
                .message("Error processing CSV file: " + exc.getMessage())
                .time(System.currentTimeMillis())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}