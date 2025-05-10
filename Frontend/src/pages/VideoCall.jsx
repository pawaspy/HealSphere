import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Download, 
  FileText, 
  MessageSquare, 
  Share2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX
} from "lucide-react";

// Mock appointment data
const appointmentData = {
  1: {
    id: 1,
    patientName: "Ananya Patel",
    patientAge: 34,
    patientGender: "Female",
    symptoms: "Persistent cough and fever",
    time: "09:30 AM",
    date: "15 June, 2023",
    doctorName: "Dr. Arun Mehta",
    specialty: "Cardiology"
  },
  2: {
    id: 2,
    patientName: "Rahul Sharma",
    patientAge: 42,
    patientGender: "Male",
    symptoms: "Back pain and stiffness",
    time: "11:00 AM",
    date: "15 June, 2023",
    doctorName: "Dr. Arun Mehta",
    specialty: "Cardiology"
  },
  3: {
    id: 3,
    patientName: "Priya Verma",
    patientAge: 28,
    patientGender: "Female",
    symptoms: "Migraine and dizziness",
    time: "12:30 PM",
    date: "15 June, 2023",
    doctorName: "Dr. Arun Mehta",
    specialty: "Cardiology"
  },
  4: {
    id: 4,
    patientName: "Vikram Singh",
    patientAge: 45,
    patientGender: "Male",
    symptoms: "Skin rash and itching",
    time: "02:15 PM",
    date: "15 June, 2023",
    doctorName: "Dr. Arun Mehta",
    specialty: "Cardiology"
  },
  5: {
    id: 5,
    patientName: "Neha Gupta",
    patientAge: 52,
    patientGender: "Female",
    symptoms: "Follow-up for hypertension",
    time: "04:00 PM",
    date: "15 June, 2023",
    doctorName: "Dr. Arun Mehta",
    specialty: "Cardiology"
  }
};

const VideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isCallActive, setIsCallActive] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  
  const appointment = appointmentData[appointmentId];
  
  useEffect(() => {
    if (!appointment) {
      toast({
        title: "Appointment Not Found",
        description: "The requested appointment could not be found.",
        variant: "destructive",
      });
      navigate("/doctor-dashboard");
    }
    
    // Simulating a connection
    const timer = setTimeout(() => {
      toast({
        title: "Connected",
        description: `You are now connected with ${appointment?.patientName}`,
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [appointment, navigate, toast]);
  
  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleAudio = () => setIsAudioOn(!isAudioOn);
  
  const endCall = () => {
    setIsCallActive(false);
    setShowFeedbackDialog(true);
  };
  
  const handleFeedbackSubmit = () => {
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    });
    setShowFeedbackDialog(false);
    navigate("/doctor-dashboard");
  };
  
  const downloadReceipt = () => {
    // In a real application, this would generate and download a PDF
    // For now, we'll just show a toast notification
    toast({
      title: "Receipt Downloaded",
      description: "Consultation receipt has been downloaded successfully.",
    });
    
    // Here you would typically use a library like jsPDF to generate the PDF
    // Example code (commented out):
    /*
    const doc = new jsPDF();
    
    // Add content to the PDF
    doc.setFontSize(22);
    doc.text("TeleHealth Consultation Receipt", 20, 20);
    
    doc.setFontSize(14);
    doc.text(`Patient: ${appointment.patientName}`, 20, 40);
    doc.text(`Doctor: ${appointment.doctorName}`, 20, 50);
    doc.text(`Date: ${appointment.date}`, 20, 60);
    doc.text(`Time: ${appointment.time}`, 20, 70);
    doc.text(`Symptoms: ${appointment.symptoms}`, 20, 80);
    
    if (prescription) {
      doc.text("Prescription:", 20, 100);
      doc.text(prescription, 20, 110);
    }
    
    if (notes) {
      doc.text("Notes:", 20, 140);
      doc.text(notes, 20, 150);
    }
    
    // Save the PDF
    doc.save(`receipt_${appointment.patientName.replace(/\s/g, '_')}.pdf`);
    */
  };
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-2">
            T
          </div>
          <span className="font-bold text-lg">TeleHealth</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {isCallActive ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Call in progress
              </span>
            ) : (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Call ended
              </span>
            )}
          </span>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Video area */}
        <div className="flex-1 bg-muted flex flex-col">
          <div className="flex-1 relative">
            {/* Main video (patient) */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isCallActive && isVideoOn ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  {/* This would be replaced with actual video stream */}
                  <div className="text-white text-center">
                    <div className="w-32 h-32 rounded-full bg-primary/20 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-4xl">{appointment?.patientName.charAt(0)}</span>
                    </div>
                    <p className="text-xl">{appointment?.patientName}</p>
                    <p className="text-sm text-gray-400">{appointment?.patientAge} years • {appointment?.patientGender}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <div className="text-white text-center">
                    <VideoOff className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <p className="text-xl">Video {isCallActive ? "Off" : "Ended"}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Small video (doctor) */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
              {isCallActive && isVideoOn ? (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/30 mx-auto mb-2 flex items-center justify-center">
                      <span className="text-lg">D</span>
                    </div>
                    <p className="text-xs">You</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <VideoOff className="h-8 w-8 text-gray-500" />
                </div>
              )}
            </div>
          </div>
          
          {/* Video controls */}
          <div className="h-16 bg-background border-t flex items-center justify-center space-x-4 px-4">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${!isMicOn ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600' : ''}`}
              onClick={toggleMic}
            >
              {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${!isVideoOn ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600' : ''}`}
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${!isAudioOn ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600' : ''}`}
              onClick={toggleAudio}
            >
              {isAudioOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full"
              onClick={endCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={downloadReceipt}
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-96 border-l overflow-y-auto flex flex-col">
          {/* Patient info */}
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">{appointment?.patientName}</h2>
            <p className="text-muted-foreground text-sm">
              {appointment?.patientAge} years • {appointment?.patientGender}
            </p>
            <div className="mt-2">
              <h3 className="text-sm font-medium">Symptoms</h3>
              <p className="text-sm text-muted-foreground">{appointment?.symptoms}</p>
            </div>
          </div>
          
          {/* Prescription */}
          <div className="p-4 border-b flex-1">
            <h3 className="font-medium mb-2">Prescription</h3>
            <Textarea
              placeholder="Write prescription details here..."
              className="min-h-[120px]"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            />
            
            <Separator className="my-4" />
            
            <h3 className="font-medium mb-2">Consultation Notes</h3>
            <Textarea
              placeholder="Add your notes here..."
              className="min-h-[120px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          {/* Actions */}
          <div className="p-4 border-t bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="w-full" onClick={downloadReceipt}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
              <Button variant="destructive" className="w-full" onClick={endCall}>
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Consultation Feedback</DialogTitle>
            <DialogDescription>
              Please rate your experience with this consultation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFeedbackRating(rating)}
                  className={`p-2 rounded-full ${
                    feedbackRating === rating
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Star className="h-6 w-6" />
                </button>
              ))}
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                variant="outline"
                className={`flex items-center ${
                  feedbackRating > 3 ? "bg-green-100 text-green-700 border-green-300" : ""
                }`}
                onClick={() => setFeedbackRating(5)}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Satisfied
              </Button>
              <Button
                variant="outline"
                className={`flex items-center ${
                  feedbackRating < 3 ? "bg-red-100 text-red-700 border-red-300" : ""
                }`}
                onClick={() => setFeedbackRating(1)}
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Unsatisfied
              </Button>
            </div>
            
            <Textarea
              placeholder="Additional comments (optional)"
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/doctor-dashboard")}>
              Skip
            </Button>
            <Button type="submit" onClick={handleFeedbackSubmit}>
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoCall; 