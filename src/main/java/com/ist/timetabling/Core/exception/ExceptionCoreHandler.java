package com.ist.timetabling.Core.exception;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.*;


@RestControllerAdvice
@Slf4j
public class ExceptionCoreHandler {

    @Autowired
    private I18n i18n;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(final MethodArgumentNotValidException methodArgumentNotValidException) {

        final List<String> listError = new ArrayList<>();

        methodArgumentNotValidException.getBindingResult().getAllErrors().forEach((error) -> {
            final String fieldName = ((FieldError) error).getField();
            final String messageKey = error.getDefaultMessage();
            listError.add(fieldName + ": " + i18n.get(messageKey));
        });

        final ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpStatus.BAD_REQUEST,
                listError.toArray(new String[0])
        );

        return apiResponse.toResponseEntity();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(final Exception exception) {
        final String message = i18n.get(exception.getMessage());
        final ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                message
        );
        return apiResponse.toResponseEntity();
    }

    @ExceptionHandler(ExceptionCoreNotFound.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(final ExceptionCoreNotFound exceptionCoreNotFound) {
        final String message = i18n.get(exceptionCoreNotFound.getMessage());
        final ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpStatus.NOT_FOUND,
                message
        );
        return apiResponse.toResponseEntity();
    }

    @ExceptionHandler(ExceptionCoreNoChange.class)
    public ResponseEntity<ApiResponse<Void>> handleNoChangeException(final ExceptionCoreNoChange exceptionCoreNoChange) {
        final String message = i18n.get(exceptionCoreNoChange.getMessage());
        final ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpStatus.NO_CONTENT,
                message
        );
        return apiResponse.toResponseEntity();
    }

    @ExceptionHandler(ExceptionCoreAlreadyExists.class)
    public ResponseEntity<ApiResponse<Void>> handleAlreadyExistsException(final ExceptionCoreAlreadyExists exceptionCoreAlreadyExists) {
        final String message = i18n.get(exceptionCoreAlreadyExists.getMessage());
        final ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpStatus.CONFLICT,
                message
        );
        return apiResponse.toResponseEntity();
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(final AccessDeniedException accessDeniedException) {
        log.error("Access denied: {}", accessDeniedException.getMessage());
        final ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpStatus.FORBIDDEN,
                "Access Denied: You don't have permission to access this resource"
        );
        return apiResponse.toResponseEntity();
    }

}
