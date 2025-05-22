import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Textarea } from "@/component/Ui/textarea";
import { useI18n } from "@/hook/useI18n";
import { useState } from "react";
import { Send, Mic, Loader2 } from "lucide-react";

const AiAssistant = () => {
  const { t } = useI18n();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const handleSendMessage = async () => {
    if(!message.trim()) return;

    // Add user message to conversation
    setConversation((prev) => [...prev, { role: "user", content: message }]);

    // Clear input field
    setMessage("");

    // Set loading state
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add a mock response
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm an AI assistant here to help you with your scheduling needs. How can I assist you today?",
        },
      ]);
    }catch(error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if(e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t("ai.assistant")}</CardTitle>
        <CardDescription>{t("ai.assistantDescription")}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-gray-50 rounded-md">
          {conversation.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              {t("ai.startConversation")}
            </div>
          ) : (
            conversation.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted mr-auto"
                }`}
              >
                {msg.content}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted max-w-[80%] mr-auto">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("ai.thinking")}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="flex-shrink-0"
            title={t("ai.voiceInput")}
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t("ai.typeMessage")}
            className="min-h-10 flex-1 resize-none"
            rows={1}
          />

          <Button
            type="button"
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className="flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiAssistant;
