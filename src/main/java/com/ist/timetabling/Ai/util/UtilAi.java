package com.ist.timetabling.Ai.util;

import org.apache.http.util.TextUtils;

import java.util.HashMap;
import java.util.Map;


public class UtilAi {


    public static String buildPrompt(final int contextWindow, final String system, final String context, final String history, final String message) {
        final StringBuilder promptBuilder = new StringBuilder();

        final Map<String, Integer> tokenCounts = new HashMap<>();
        tokenCounts.put("system", system != null ? estimateTokens(system) : 0);
        tokenCounts.put("context", context != null ? estimateTokens(context) : 0);
        tokenCounts.put("history", history != null ? estimateTokens(history) : 0);
        tokenCounts.put("message", message != null ? estimateTokens(message) : 0);

        final Map<String, Integer> maxPercents = new HashMap<>();
        maxPercents.put("system", 10);
        maxPercents.put("context", 20);
        maxPercents.put("history", 40);
        maxPercents.put("message", 20);
        maxPercents.put("response", 10);

        final int reservedPercent = 10;
        int remainingTokens = (contextWindow * (100 - reservedPercent)) / 100;
        final Map<String, Integer> allocatedTokens = new HashMap<>();

        for(String key : tokenCounts.keySet()) {
            final int maxTokens = (contextWindow * maxPercents.get(key)) / 100;
            final int actualTokens = tokenCounts.get(key);
            if(actualTokens <= maxTokens) {
                allocatedTokens.put(key, actualTokens);
                remainingTokens -= actualTokens;
            }else {
                allocatedTokens.put(key, maxTokens);
                remainingTokens -= maxTokens;
            }
        }

        if(remainingTokens > 0) {
            for(String key : tokenCounts.keySet()) {
                final int actualTokens = tokenCounts.get(key);
                final int currentAllocation = allocatedTokens.get(key);
                if(actualTokens > currentAllocation) {
                    final int additional = Math.min(remainingTokens, actualTokens - currentAllocation);
                    allocatedTokens.put(key, currentAllocation + additional);
                    remainingTokens -= additional;
                }
            }
        }


        final String trimmedSystem = truncateToTokens(system, allocatedTokens.get("system"));
        promptBuilder.append("System: ").append(trimmedSystem).append("\n\n");

        if(!TextUtils.isEmpty(context)) {
            final String trimmedContext = truncateToTokens(context, allocatedTokens.get("context"));
            promptBuilder.append("Context: ").append(trimmedContext).append("\n\n");
        }

        if(!TextUtils.isEmpty(history)) {
            final String trimmedHistory = truncateToTokens(history, allocatedTokens.get("history"));
            promptBuilder.append("History:\n").append(trimmedHistory).append("\n\n");
        }

        final String trimmedMessage = truncateToTokens(message, allocatedTokens.get("message"));
        promptBuilder.append("User: ").append(trimmedMessage);

        return promptBuilder.toString();
    }

    public static int getContextWindow(final String provider, final String model) {
        final int contextWindow;
        if("openai".equalsIgnoreCase(provider)) {
            if(model.contains("gpt-4")) {
                contextWindow = 8192;
            }else {
                contextWindow = 4096;
            }
        }else if("anthropic".equalsIgnoreCase(provider)) {
            if(model.contains("opus")) {
                contextWindow = 200000;
            }else {
                contextWindow = 100000;
            }
        }else if("gemini".equalsIgnoreCase(provider)) {
            contextWindow = 32768;
        }else if("mistral".equalsIgnoreCase(provider)) {
            contextWindow = 32768;
        }else if("llama".equalsIgnoreCase(provider)) {
            contextWindow = 4096;
        }else {
            contextWindow = 4096;
        }
        return contextWindow;
    }

    public static String truncateToTokens(final String text, final int tokenLimit) {
        if(text == null || text.isEmpty()) return "";

        final int estimatedTokens = estimateTokens(text);
        if(estimatedTokens <= tokenLimit) return text;

        final int charLimit = (tokenLimit * 4);
        if(text.length() <= charLimit) return text;

        return text.substring(0, charLimit) + "...";
    }

    public static int estimateTokens(final String text) {
        if(text == null || text.isEmpty()) {
            return 0;
        }

        final int wordTokens = text.split("\\s+").length;
        final int punctTokens = text.replaceAll("[^!.,;:?]", "").length();
        final int specialTokens = text.replaceAll("[\\w\\s.,!?;:]", "").length();

        final float avgCharsPerToken = 4.0f;
        final int charTokens = (int) Math.ceil(text.length() / avgCharsPerToken);

        return Math.max(wordTokens + punctTokens + specialTokens, charTokens);
    }

}
