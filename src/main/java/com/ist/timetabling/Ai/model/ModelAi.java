package com.ist.timetabling.Ai.model;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.ist.timetabling.Ai.config.ConfigAi;
import com.ist.timetabling.Ai.entity.EntityAi;
import com.ist.timetabling.Ai.util.UtilAi;
import com.ist.timetabling.Core.model.ApiResponse;
import dev.langchain4j.model.anthropic.AnthropicChatModel;
import dev.langchain4j.model.mistralai.MistralAiChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;


@Component
public final class ModelAi {

    private final ConfigAi confAi;


    @Autowired
    public ModelAi(ConfigAi confAi) {
        this.confAi = confAi;
    }

    public ApiResponse<EntityAi> chat(final String message) {
        return chat("", "", message);
    }

    public ApiResponse<EntityAi> chat(final String system, final String context, final String message) {
        return chat(system, context, "", message);
    }

    public ApiResponse<EntityAi> chat(final String system, final String context, final String history, final String message) {
        return chat(confAi.getLocalLlm(), confAi.getLocalModel(), system, context, history, message);
    }

    public ApiResponse<EntityAi> chat(final String provider, final String model, final String system, final String context, final String history, final String message) {
        ApiResponse<EntityAi> apiResponse = new ApiResponse<>();
        try {

            final int contextWindow = UtilAi.getContextWindow(provider, model);
            final String prompt = UtilAi.buildPrompt(contextWindow, system, context, history, message);

            if("openai".equalsIgnoreCase(provider)) {
                apiResponse = chatOpenAi(model, prompt);
            } else if("anthropic".equalsIgnoreCase(provider)) {
                apiResponse = chatAnthropic(model, prompt);
            } else if("gemini".equalsIgnoreCase(provider)) {
                apiResponse = chatGemini(model, prompt);
            } else if("mistral".equalsIgnoreCase(provider)) {
                apiResponse = chatMistral(model, prompt);
            } else if("deepseek".equalsIgnoreCase(provider)) {
                apiResponse = chatDeepSeek(model, prompt);
            } else if("llama".equalsIgnoreCase(provider)) {
                apiResponse = chatLlama(model, prompt);
            }else {
                apiResponse.setError("Unsupported provider");
            }

        }catch(final Exception e) {
            apiResponse.setException(e);
        }
        return apiResponse;
    }

    private ApiResponse<EntityAi> chatOpenAi(final String model, final String prompt) {
        final ApiResponse<EntityAi> apiResponse = new ApiResponse<>();

        final OpenAiChatModel openAiChatModel = OpenAiChatModel.builder()
                .apiKey(confAi.getOpenaiApiKey())
                .modelName(model)
                .temperature(0.7)
                .build();

        final String response = openAiChatModel.generate(prompt);
        final EntityAi entityAi = new EntityAi();
        entityAi.setRole("ai");
        entityAi.setResponse(response);

        apiResponse.setSuccess(true);
        apiResponse.setMessage("Chat responded successfully");
        apiResponse.setData(entityAi);
        return apiResponse;
    }

    private ApiResponse<EntityAi> chatAnthropic(final String model, final String prompt) {
        final ApiResponse<EntityAi> apiResponse = new ApiResponse<>();

        final AnthropicChatModel anthropicChatModel = AnthropicChatModel.builder()
                .apiKey(confAi.getAnthropicApiKey())
                .modelName(model)
                .temperature(0.7)
                .build();

        final String response = anthropicChatModel.generate(prompt);
        final EntityAi entityAi = new EntityAi();
        entityAi.setRole("ai");
        entityAi.setResponse(response);

        apiResponse.setSuccess(true);
        apiResponse.setMessage("Chat responded successfully");
        apiResponse.setData(entityAi);
        return apiResponse;
    }

    private ApiResponse<EntityAi> chatGemini(final String model, final String prompt) {
        final ApiResponse<EntityAi> apiResponse = new ApiResponse<>();

        try {
            final JsonObject textPart = new JsonObject();
            textPart.addProperty("text", prompt);

            final JsonArray parts = new JsonArray();
            parts.add(textPart);

            final JsonObject contentItem = new JsonObject();
            contentItem.add("parts", parts);

            final JsonArray contents = new JsonArray();
            contents.add(contentItem);

            final JsonObject requestBody = new JsonObject();
            requestBody.add("contents", contents);

            final String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent" +
                    "?key=" + confAi.getGeminiApiKey();

            final HttpClient httpClient = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_2)
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            final HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if(response.statusCode() == HttpStatus.SC_OK) {
                final String responseContent = response.body();

                final JsonObject jsonResponse = JsonParser.parseString(responseContent).getAsJsonObject();
                final JsonArray candidates = jsonResponse.getAsJsonArray("candidates");
                final JsonObject firstCandidate = candidates.get(0).getAsJsonObject();

                final JsonObject content = firstCandidate.getAsJsonObject("content");
                final JsonArray contentParts = content.getAsJsonArray("parts");
                final JsonObject firstPart = contentParts.get(0).getAsJsonObject();
                final String textResponse = firstPart.get("text").getAsString();

                final EntityAi entityAi = new EntityAi();
                entityAi.setRole("ai");
                entityAi.setResponse(textResponse);
                entityAi.setContent(responseContent);

                apiResponse.setSuccess(true);
                apiResponse.setMessage("Chat responded successfully");
                apiResponse.setData(entityAi);

            }else {
                apiResponse.setSuccess(false);
                apiResponse.setStatus(response.statusCode());
                apiResponse.setMessage(response.body());
            }

        }catch(Exception e) {
            apiResponse.setSuccess(false);
            apiResponse.setMessage("Error: " + e.getMessage());
        }

        return apiResponse;
    }

    private ApiResponse<EntityAi> chatMistral(final String model, final String prompt) {
        final ApiResponse<EntityAi> apiResponse = new ApiResponse<>();

        final MistralAiChatModel mistralModel = MistralAiChatModel.builder()
                .apiKey(confAi.getMistralApiKey())
                .modelName(model)
                .temperature(0.7)
                .build();

        final String response = mistralModel.generate(prompt);
        final EntityAi entityAi = new EntityAi();
        entityAi.setRole("ai");
        entityAi.setResponse(response);

        apiResponse.setSuccess(true);
        apiResponse.setMessage("Chat responded successfully");
        apiResponse.setData(entityAi);
        return apiResponse;
    }

    private ApiResponse<EntityAi> chatDeepSeek(final String model, final String prompt) {
        final ApiResponse<EntityAi> apiResponse = new ApiResponse<>();

        try {
            final JsonObject requestBody = new JsonObject();
            requestBody.addProperty("model", model);
            requestBody.addProperty("messages", prompt);
            requestBody.addProperty("stream", false);

            final HttpClient httpClient = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_2)
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            final HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(confAi.getDeepseekApi()))
                    .header("Authorization", "Bearer " + confAi.getDeepseekKey())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if(response.statusCode() >= 200 && response.statusCode() < 300) {
                final String responseContent = response.body();

                final JsonObject jsonResponse = JsonParser.parseString(responseContent).getAsJsonObject();
                final JsonArray choices = jsonResponse.getAsJsonArray("choices");
                final JsonObject firstChoice = choices.get(0).getAsJsonObject();
                final String textResponse = firstChoice.get("text").getAsString();

                final EntityAi entityAi = new EntityAi();
                entityAi.setRole("ai");
                entityAi.setResponse(textResponse);
                entityAi.setContent(responseContent);

                apiResponse.setSuccess(true);
                apiResponse.setMessage("Chat responded successfully");
                apiResponse.setData(entityAi);

            }else {
                apiResponse.setSuccess(false);
                apiResponse.setStatus(response.statusCode());
                apiResponse.setMessage(response.body());
            }

        }catch(Exception e) {
            apiResponse.setSuccess(false);
            apiResponse.setMessage("Error: " + e.getMessage());
        }

        return apiResponse;
    }

    private ApiResponse<EntityAi> chatLlama(final String model, final String prompt) {
        final ApiResponse<EntityAi> apiResponse = new ApiResponse<>();

        try {
            final JsonObject requestBody = new JsonObject();
            requestBody.addProperty("model", model);
            requestBody.addProperty("prompt", prompt);
            requestBody.addProperty("temperature", 0.7);

            final HttpClient httpClient = HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_2)
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            final HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(confAi.getLlamaApi()))
                    .header("Authorization", "Bearer " + confAi.getLlamaApi())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            final HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if(response.statusCode() >= 200 && response.statusCode() < 300) {
                final String responseContent = response.body();

                final JsonObject jsonResponse = JsonParser.parseString(responseContent).getAsJsonObject();
                final JsonArray choices = jsonResponse.getAsJsonArray("choices");
                final JsonObject firstChoice = choices.get(0).getAsJsonObject();
                final String textResponse = firstChoice.get("text").getAsString();

                final EntityAi entityAi = new EntityAi();
                entityAi.setRole("ai");
                entityAi.setResponse(textResponse);

                apiResponse.setSuccess(true);
                apiResponse.setMessage("Chat responded successfully");
                apiResponse.setData(entityAi);

            }else {
                apiResponse.setSuccess(false);
                apiResponse.setStatus(response.statusCode());
                apiResponse.setMessage(response.body());
            }

        }catch(Exception e) {
            apiResponse.setSuccess(false);
            apiResponse.setMessage("Error: " + e.getMessage());
        }

        return apiResponse;
    }

}
