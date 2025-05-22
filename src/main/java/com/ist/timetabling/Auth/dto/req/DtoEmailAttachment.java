package com.ist.timetabling.Auth.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoEmailAttachment {

    private String filename;

    private String contentType;

    private String data;

}
