package com.ist.timetabling.Auth.util;

import com.ist.timetabling.Auth.constant.ConstantEmailI18n;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class EmailTemplateUtil {
    public static String processTemplate(String templateName, Map<String, Object> variables) {
        String templateContent = loadTemplateFile(templateName);
        if(variables != null) {
            for(Map.Entry<String, Object> entry : variables.entrySet()) {
                String key = entry.getKey();
                String value = entry.getValue() != null ? entry.getValue().toString() : "";
                String mustachePlaceholder = "{{" + key + "}}";
                templateContent = templateContent.replace(mustachePlaceholder, value);
                
                String thymeleafAttribute = "th:text=\"${" + key + "}\"";
                templateContent = templateContent.replace(thymeleafAttribute, "");
                
                if(key.equals("code")) {
                    templateContent = templateContent.replace("<div class=\"code\" >123456</div>", 
                                                         "<div class=\"code\">" + value + "</div>");
                    templateContent = templateContent.replace("<div class=\"code\" >{{code}}</div>", 
                                                         "<div class=\"code\">" + value + "</div>");
                }
                
                if(key.equals("firstName")) {
                    templateContent = templateContent.replace("<span >User</span>", 
                                                        "<span>" + value + "</span>");
                    templateContent = templateContent.replace("<span >{{firstName}}</span>", 
                                                        "<span>" + value + "</span>");
                }
            }
        }

        return templateContent;
    }

    private static String loadTemplateFile(String templateName) {
        String resourcePath = "templates/email/" + templateName + ".html";
        try {
            ClassPathResource resource = new ClassPathResource(resourcePath);
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        }catch(IOException e) {
            throw new RuntimeException(ConstantEmailI18n.I18N_EMAIL_SEND_FAILURE + resourcePath, e);
        }
    }
}
