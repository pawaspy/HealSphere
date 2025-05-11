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
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 rounded-full bg-primary/20 mr-3"></div>
      <div>
        <h3 className="font-medium">Dr. Sarah Johnson</h3>
        <p className="text-sm text-muted-foreground">Family Medicine Specialist</p>
      </div>
    </div>
  );
};

const VideoSection = ({
  isMuted,
  setIsMuted,
  isVideoOn,
  setIsVideoOn,
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden">
      
      {/* Patient's video (small) */}
      <div className="absolute top-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg">
        {isVideoOn ? (
          <div className="w-full h-full bg-gray-800"></div>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
      
      {/* Doctor's video (main) */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
            <Camera className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="font-medium">Dr. Sarah Johnson is joining...</h3>
          <p className="text-sm text-muted-foreground">Your consultation will begin shortly</p>
        </div>
      </div>
      
      {/* Controls bar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
        <Button variant="outline" size="icon" className="rounded-full bg-background" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button variant="outline" size="icon" className="rounded-full bg-background" onClick={() => setIsVideoOn(!isVideoOn)}>
          {isVideoOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
        </Button>
        <Button variant="destructive" size="icon" className="rounded-full">
          <Phone className="h-5 w-5" />
        </Button>
      </div>
      </div>
    </div>
  );
};

const MessageItem = ({ message, isDoctor }) => {
  return (
    <div className={`flex mb-4 ${isDoctor ? 'justify-start' : 'justify-end'}`}>
      <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
        isDoctor ? 'bg-muted' : 'bg-primary text-primary-foreground'
      }`}>
        {message}
      </div>
    </div>
  );
};

const ChatSection = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'll be with you shortly. How are you feeling today?", isDoctor: true }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <MessageItem key={index} message={message.text} isDoctor={message.isDoctor} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-3 flex gap-2">
        <Input 
          placeholder="Type your message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <Button size="icon" onClick={sendMessage}>
          <Send className="h-4 w-4" />
        </Button>
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
    <div className="p-4">
      <div className="mb-4 text-sm text-muted-foreground italic">
        Transcription is being generated in real-time and may contain errors.
      </div>
      
      <div className="space-y-4">
      {transcripts.map((item, index) => (
        <div key={index} className="border-b pb-3">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            {item.time}
            <span className="mx-2">•</span>
            <span className={item.speaker === "Doctor" ? "text-primary" : ""}>
              {item.speaker}
            </span>
          </div>
          {item.text}
        </div>
      ))}
      </div>
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
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b py-3 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-2">
              C
            </div>
            <span className="font-bold">CareFromAnywhere</span>
          </div>
          <div>
            <Button variant="destructive" onClick={endConsultation}>
              <X className="h-4 w-4 mr-2" /> End Consultation
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          <div className="md:col-span-2 h-full">
            <Card className="h-full flex flex-col">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="border-b px-4">
                  <TabsList className="justify-start">
                    <TabsTrigger value="video" className="data-[state=active]:bg-muted">
                      <Camera className="h-4 w-4 mr-2" /> Video
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="data-[state=active]:bg-muted">
                      <MessageSquare className="h-4 w-4 mr-2" /> Chat
                    </TabsTrigger>
                    <TabsTrigger value="transcript" className="data-[state=active]:bg-muted">
                      <FileText className="h-4 w-4 mr-2" /> Transcript
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex-1">
                  <TabsContent value="video" className="mt-0 h-full">
                    <VideoSection 
                      isMuted={isMuted}
                      setIsMuted={setIsMuted}
                      isVideoOn={isVideoOn}
                      setIsVideoOn={setIsVideoOn}
                    />
                  </TabsContent>
                  <TabsContent value="chat" className="mt-0 h-full">
                    <ChatSection />
                  </TabsContent>
                  <TabsContent value="transcript" className="mt-0 h-full overflow-auto">
                    <TranscriptSection />
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">Consultation Details</h2>
                <DoctorProfile />
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient</span>
                    <span>{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialty</span>
                    <span>{formData.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reason for Visit</span>
                    <span>{formData.reason}</span>
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
