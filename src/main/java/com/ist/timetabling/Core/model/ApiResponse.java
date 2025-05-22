package com.ist.timetabling.Core.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.JsonElement;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    public static final int DEFAULT_PAGE_SIZE = 10;

    public static final int DEFAULT_PAGE_NUMBER = 0;

    private int status;

    private boolean success;

    private long time;

    private String language;

    private String message;

    private String error;

    private T data;

    private long totalItems;

    private Integer totalPages;

    private Boolean hasNext;

    private Boolean hasPrevious;

    private Integer currentPage;


    public static <T> ApiResponse<T> success(final HttpStatus httpStatus, final String message, final T data) {
        return ApiResponse.<T>builder()
                .status(httpStatus.value())
                .success(true)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(final String message) {
        return ApiResponse.<T>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> success(final T data, final String message) {
        return ApiResponse.<T>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<List<T>> success(final Page<T> page, final String message) {
        return ApiResponse.<List<T>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .message(message)
                .data(page.getContent())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .currentPage(page.getNumber())
                .build();
    }

    public static <T> ApiResponse<T> error(final HttpStatus httpStatus, final String... errors) {
        return ApiResponse.<T>builder()
                .status(httpStatus.value())
                .success(false)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .error(Arrays.toString(errors))
                .build();
    }

    public void setException(final Exception e) {
        this.error = e.getMessage();
    }

    public ResponseEntity<ApiResponse<T>> toResponseEntity() {
        return new ResponseEntity<>(this, HttpStatus.valueOf(status));
    }

    public void sendResponse(final HttpServletResponse httpServletResponse) throws IOException {
        httpServletResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
        httpServletResponse.setStatus(this.status);
        httpServletResponse.getWriter().write(new ObjectMapper().writeValueAsString(this));
    }

    public JsonElement toJsonData() {
        return new ObjectMapper().convertValue(data, JsonElement.class);
    }

}
