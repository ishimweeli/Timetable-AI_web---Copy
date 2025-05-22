package com.ist.timetabling.Core.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class ConfigCoreOpenApi {

    @Bean
    public OpenAPI userServiceAPI() {

        final SecurityScheme securityScheme = new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT").name("JWT Authentication");

        final SecurityScheme languageScheme = new SecurityScheme().type(SecurityScheme.Type.APIKEY).in(SecurityScheme.In.HEADER).name("Accept-Language").description("Language preference header");

        StringSchema languageSchema = new StringSchema();
        languageSchema.setDescription("Language abbreviation");
        languageSchema.setExample("en");
        languageSchema.setEnum(Arrays.asList("en", "fr", "rw", "es", "de"));

        HeaderParameter languageParameter = new HeaderParameter();
        languageParameter.name("Accept-Language");
        languageParameter.description("Select language preference");
        languageParameter.required(false);
        languageParameter.schema(languageSchema);

        return new OpenAPI()
                .openapi("3.0.0").info(new Info()
                        .title("User Service API")
                        .description("REST API for AI timetable with session-based authentication\n\n" +
                                "Authentication Methods:\n" +
                                "1. Session-based: Uses JSESSIONID cookie\n" +
                                "2. JWT: Bearer token in Authorization header\n\n" +
                                "Language Support:\n" +
                                "- Uses `Accept-Language` header with supported languages: en, fr, rw, es, de"
                        )
                        .version("v0.0.1")
                        .termsOfService("http://swagger.io/terms/"))
                .addSecurityItem(new SecurityRequirement().addList("bearer-key"))
                .addSecurityItem(new SecurityRequirement().addList("session-auth"))
                .addSecurityItem(new SecurityRequirement().addList("language-header"))
                .components(new Components().addSecuritySchemes("bearer-key", securityScheme).addSecuritySchemes("language-header", languageScheme).addParameters("Accept-Language", languageParameter));
    }

}