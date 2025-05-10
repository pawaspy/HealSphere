
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mic, MicOff, Camera, CameraOff, Phone, MessageSquare, FileText, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DoctorProfile = () => {
  return (
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
          alt="Doctor"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h3 className="font-semibold">Dr. Sarah Johnson</h3>
        <p className="text-sm text-gray-600">Family Medicine Specialist</p>
      </div>
    </div>
  );
};

const VideoSection = ({
  isMuted,
  setIsMuted,
  isVideoOn,
  setIsVideoOn,
}: {
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  isVideoOn: boolean;
  setIsVideoOn: (value: boolean) => void;
}) => {
  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden h-[400px] md:h-[500px] relative">
      <div className="absolute inset-0 consultation-background"></div>
      
      {/* Patient's video (small) */}
      <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded overflow-hidden border-2 border-white shadow-lg z-10">
        {isVideoOn ? (
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80" 
            alt="You"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
            <CameraOff size={24} />
          </div>
        )}
      </div>
      
      {/* Doctor's video (main) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80" 
              alt="Doctor"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <h3 className="font-medium text-lg">Dr. Sarah Johnson is joining...</h3>
          <p className="text-gray-600">Your consultation will begin shortly</p>
        </div>
      </div>
      
      {/* Controls bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 p-3 flex justify-center space-x-3">
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700", 
            isMuted && "bg-red-600 hover:bg-red-700 border-red-500"
          )}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className={cn(
            "rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700", 
            !isVideoOn && "bg-red-600 hover:bg-red-700 border-red-500"
          )}
          onClick={() => setIsVideoOn(!isVideoOn)}
        >
          {isVideoOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant="destructive" 
          size="icon" 
          className="rounded-full"
        >
          <Phone className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

const MessageItem = ({ message, isDoctor }: { message: string, isDoctor: boolean }) => {
  return (
    <div className={cn("flex", isDoctor ? "justify-start" : "justify-end")}>
      <div 
        className={cn(
          "max-w-[80%] rounded-lg p-3 mb-2",
          isDoctor ? "bg-gray-100" : "bg-primary text-white"
        )}
      >
        <p>{message}</p>
      </div>
    </div>
  );
};

const ChatSection = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'll be with you shortly. How are you feeling today?", isDoctor: true }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, { text: newMessage, isDoctor: false }]);
      setNewMessage("");
      
      // Simulate doctor response after a delay
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { 
            text: "Thanks for sharing that information. Can you tell me more about when these symptoms started?", 
            isDoctor: true 
          }
        ]);
      }, 3000);
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-[400px] md:h-[500px]">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <MessageItem 
            key={index} 
            message={message.text} 
            isDoctor={message.isDoctor} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-3">
        <div className="flex space-x-2">
          <Input 
            placeholder="Type your message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button type="button" size="icon" onClick={sendMessage}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const TranscriptSection = () => {
  const [transcripts, setTranscripts] = useState([
    { time: "00:05", speaker: "Doctor", text: "Hello, I'm Dr. Johnson. How are you feeling today?" },
    { time: "00:10", speaker: "You", text: "I've been having headaches for the past week." },
    { time: "00:15", speaker: "Doctor", text: "I'm sorry to hear that. Can you describe the headaches? Where is the pain located?" },
    { time: "00:21", speaker: "You", text: "It's mostly on the right side of my head, and it feels like a throbbing pain." },
  ]);
  
  return (
    <div className="h-[400px] md:h-[500px] overflow-y-auto p-4">
      <div className="text-xs text-gray-500 mb-4">
        Transcription is being generated in real-time and may contain errors.
      </div>
      
      {transcripts.map((item, index) => (
        <div key={index} className="mb-4">
          <div className="flex items-center mb-1">
            <span className="text-gray-500 text-xs">{item.time}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className={cn(
              "font-medium",
              item.speaker === "Doctor" ? "text-primary" : "text-gray-700"
            )}>
              {item.speaker}
            </span>
          </div>
          <p className="text-gray-800">{item.text}</p>
        </div>
      ))}
    </div>
  );
};

const Consultation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formData = location.state?.formData;
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConsultationActive, setIsConsultationActive] = useState(true);
  const [activeTab, setActiveTab] = useState("video");
  
  // If there's no form data, redirect to start consultation
  useEffect(() => {
    if (!formData) {
      navigate("/start-consultation");
    }
  }, [formData, navigate]);
  
  const endConsultation = () => {
    setIsConsultationActive(false);
    toast({
      title: "Consultation Ended",
      description: "Thank you for using our telehealth service. We hope you found it helpful."
    });
    setTimeout(() => {
      navigate("/consultation-summary", { state: { formData } });
    }, 2000);
  };
  
  if (!formData) return null;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="font-bold text-lg tracking-tight">CareFromAnywhere</span>
          </div>
          
          <Button 
            variant="destructive" 
            size="sm"
            className="flex items-center"
            onClick={endConsultation}
          >
            <X className="h-4 w-4 mr-1" /> End Consultation
          </Button>
        </div>
      </header>
      
      <main className="flex-1 py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <DoctorProfile />
          
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b px-6 py-3">
                <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-flex">
                  <TabsTrigger value="video" className="data-[state=active]:bg-primary/10">
                    <Camera className="h-4 w-4 mr-2" /> Video
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="data-[state=active]:bg-primary/10">
                    <MessageSquare className="h-4 w-4 mr-2" /> Chat
                  </TabsTrigger>
                  <TabsTrigger value="transcript" className="data-[state=active]:bg-primary/10">
                    <FileText className="h-4 w-4 mr-2" /> Transcript
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="video">
                <VideoSection 
                  isMuted={isMuted} 
                  setIsMuted={setIsMuted} 
                  isVideoOn={isVideoOn} 
                  setIsVideoOn={setIsVideoOn} 
                />
              </TabsContent>
              
              <TabsContent value="chat">
                <ChatSection />
              </TabsContent>
              
              <TabsContent value="transcript">
                <TranscriptSection />
              </TabsContent>
            </Tabs>
          </Card>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Consultation Details</h3>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Patient</h4>
                    <p>{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Specialty</h4>
                    <p>{formData.specialty}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Reason for Visit</h4>
                    <p>{formData.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Consultation;
