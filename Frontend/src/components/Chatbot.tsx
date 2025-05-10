
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, PlusCircle, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  text: string;
  isBot: boolean;
};

const initialMessages: Message[] = [
  {
    id: 1,
    text: "👋 Hi there! I'm your CareFromAnywhere virtual assistant. How can I help you today?",
    isBot: true,
  },
];

const quickQuestions = [
  "How do I schedule a consultation?",
  "What specialties do you offer?",
  "How much does a consultation cost?",
  "Is my data secure?",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const newId = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { id: newId, text: input, isBot: false },
    ]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "";

      // Simple pattern matching for common questions
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes("schedule") || lowerInput.includes("appointment")) {
        botResponse = "To schedule a consultation, click on the 'Start Consultation' button on our homepage, fill in your details, and select your preferred specialist.";
      } else if (lowerInput.includes("special")) {
        botResponse = "We offer consultations in Family Medicine, Cardiology, Dermatology, Pediatrics, Psychiatry, and more. You can view the full list on our Specialties page.";
      } else if (lowerInput.includes("cost") || lowerInput.includes("price") || lowerInput.includes("fee")) {
        botResponse = "Consultation costs vary by specialty. General consultations start at $49, while specialist consultations range from $79 to $149. Insurance coverage is available for most plans.";
      } else if (lowerInput.includes("secure") || lowerInput.includes("privacy") || lowerInput.includes("data")) {
        botResponse = "Your privacy is our priority. All consultations are encrypted and HIPAA-compliant. We never share your health information without your explicit consent.";
      } else {
        botResponse = "Thank you for your message. For specific medical advice, I recommend scheduling a consultation with one of our healthcare professionals who can provide personalized care.";
      }

      setMessages((prev) => [
        ...prev,
        { id: newId + 1, text: botResponse, isBot: true },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    // Focus on input after selecting a quick question
    document.getElementById("chat-input")?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      toast({
        title: "Chat Assistant Activated",
        description: "Ask any questions about our telehealth services.",
      });
    }
  };

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={toggleChat}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-white"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[350px] md:w-[400px] shadow-2xl z-50 border-primary/10 animate-fade-in">
          <CardHeader className="bg-primary text-white rounded-t-lg p-4">
            <CardTitle className="text-lg flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              Healthcare Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isBot
                        ? "bg-muted"
                        : "bg-primary text-white"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick questions */}
            <div className="p-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-3 border-t">
            <div className="flex w-full gap-2">
              <Input
                id="chat-input"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
