import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Send, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/utils/api";

const initialMessages = [
  {
    id: 1,
    text: "👋 Hi there! I'm your medical assistant. I provide brief, numbered health information points. Ask me any medical question, and I'll keep my answers organized and to the point.",
    isBot: true,
  },
];

const MedicalChatbot = ({ isCompact = false, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  // Check authentication status when component mounts and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(authStatus);
    };
    
    // Check initially
    checkAuth();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to the backend API
  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message to the chat
    const userMessageId = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, text: input, isBot: false },
    ]);
    
    const userQuery = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userQuery,
          format: "Give a numbered response with 3-5 key points. Format each point as '1. ' with a space after the number. Start each point on a new line. Be concise and direct."
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Add the bot's response to the messages
      setMessages((prev) => [
        ...prev,
        { id: userMessageId + 1, text: data.response, isBot: true },
      ]);
    } catch (error) {
      console.error("Error calling chat API:", error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        { 
          id: userMessageId + 1, 
          text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
          isBot: true 
        },
      ]);
      
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: "Couldn't connect to the AI service. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      toast({
        title: "Medical Assistant Activated",
        description: "Ask me any general medical questions you have.",
      });
    }
  };

  // If user is not authenticated, don't render the chatbot
  if (!isAuthenticated) {
    return null;
  }

  // Compact mode is for embedding in other components
  if (isCompact) {
    return (
      <Card className={`shadow-lg ${className || "w-[450px]"}`}>
        <CardHeader className="bg-primary text-primary-foreground py-2 px-3">
          <CardTitle className="flex items-center text-sm">
            <Bot className="h-4 w-4 mr-2" />
            Medical Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-2 space-y-2">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
              >
                <div className={`rounded-lg px-3 py-2 max-w-[90%] text-sm whitespace-pre-line ${
                  message.isBot ? "bg-muted" : "bg-primary text-primary-foreground"
                }`}>
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75" />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        <CardFooter className="p-2">
          <div className="flex w-full gap-2">
            <Input
              id="medical-chat-input"
              placeholder="Ask a medical question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 text-sm"
            />
            <Button size="sm" onClick={handleSend} disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Full version with toggle button
  return (
    <>
      {/* Chat button */}
      <div className="fixed bottom-6 left-6 z-50">
        {isOpen ? (
          <Button variant="destructive" size="icon" onClick={toggleChat}>
            <X className="h-5 w-5" />
          </Button>
        ) : (
          <Button className="rounded-full shadow-lg" onClick={toggleChat}>
            <Bot className="h-5 w-5 mr-2" />
            Medical Assistant
          </Button>
        )}
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 left-6 w-96 z-50 shadow-xl rounded-lg overflow-hidden">
          <Card className="border-0">
            <CardHeader className="bg-primary text-primary-foreground py-2 px-3">
              <CardTitle className="flex items-center text-sm">
                <Bot className="h-4 w-4 mr-2" />
                Medical Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-3 space-y-2">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                  >
                    <div className={`rounded-lg px-3 py-2 max-w-[90%] text-sm whitespace-pre-line ${
                      message.isBot ? "bg-muted" : "bg-primary text-primary-foreground"
                    }`}>
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75" />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            
            <CardFooter className="p-2">
              <div className="flex w-full gap-2">
                <Input
                  id="medical-chat-input"
                  placeholder="Ask a medical question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-sm"
                />
                <Button size="sm" onClick={handleSend} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export default MedicalChatbot; 