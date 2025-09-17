import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const quickSuggestions = [
  "What should I eat for breakfast?",
  "How can I increase my protein intake?",
  "Suggest a healthy lunch recipe",
  "What are good snacks for weight loss?",
  "How much water should I drink daily?"
];

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI nutrition assistant. I can help you with meal planning, nutrition questions, dietary advice, and healthy eating tips. What would you like to know?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL || "https://your-ai-meal-api.onrender.com"}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ text: m.text, role: m.isBot ? "assistant" : "user" })) })
      });
      const data = await resp.json();
      const text = data?.reply || data?.error || "Sorry, I couldn’t generate a response.";
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (e) {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I’m having trouble connecting to the AI service.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // generateAIResponse removed; using backend GPT

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <Card className="soft-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          AI Nutrition Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-48 mb-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.isBot
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  } rounded-lg p-2 text-xs`}
                >
                  {message.isBot && <Bot className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                  <span>{message.text}</span>
                  {!message.isBot && <User className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg p-2 text-xs flex gap-2">
                  <Bot className="h-3 w-3 mt-0.5" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => handleQuickSuggestion(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about nutrition, meals..."
            className="text-xs"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            size="sm"
            disabled={isLoading || !inputValue.trim()}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}