package com.ist.timetabling.Ai.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;


@Configuration
@Component
@Getter
public class ConfigAi {

    @Value("${local.llm}")
    private String localLlm;

    @Value("${local.model}")
    private String localModel;

    @Value("${openai.api-key}")
    private String openaiApiKey;

    @Value("${anthropic.api-key}")
    private String anthropicApiKey;

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    @Value("${mistral.api-key}")
    private String mistralApiKey;

    @Value("${llama.base-url}")
    private String llamaBaseUrl;

    @Value("${deepseek.key}")
    private String deepseekKey;

    @Value("${deepseek.api}")
    private String deepseekApi;

    @Value("${llama.api}")
    private String llamaApi;

    @Value("${llama.key}")
    private String llamaKey;

}
