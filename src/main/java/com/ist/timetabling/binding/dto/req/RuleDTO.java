package com.ist.timetabling.binding.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleDTO {
    private Long id;
    private String uuid;
    private String name;
    private String type;
}