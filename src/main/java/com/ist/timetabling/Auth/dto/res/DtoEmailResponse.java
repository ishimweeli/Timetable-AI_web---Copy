package com.ist.timetabling.Auth.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoEmailResponse {
    private boolean success;
    private String message;
    private List<String> recipients;
    private String subject;
    private String messageId;
    private String errorDetails;
}
