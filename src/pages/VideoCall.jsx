import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import MedicalChatbot from "@/components/medical/MedicalChatbot";
import { appointmentsApi, prescriptionsApi } from "@/utils/api";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  VolumeX,
  Loader2,
  Save
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
  
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCallActive, setIsCallActive] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [showMedicalChat, setShowMedicalChat] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Fetch the appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      setIsLoading(true);
      try {
        const data = await appointmentsApi.getAppointment(parseInt(appointmentId));
        
        // Format doctor name if it exists but doesn't have "Dr." prefix
        if (data.doctor_name && !data.doctor_name.startsWith('Dr.')) {
          data.doctor_name = `Dr. ${data.doctor_name}`;
        }
        
        // Ensure doctor_name is set from localStorage if missing
        if (!data.doctor_name && userRole === 'doctor') {
          const username = localStorage.getItem('username');
          data.doctor_name = username ? (username.startsWith('Dr.') ? username : `Dr. ${username}`) : 'Doctor';
        }
        
        setAppointment(data);
        
        // Check if appointment is already completed
        if (data.status === "completed") {
          toast({
            title: "Appointment Completed",
            description: "This appointment has already been completed. You cannot join the call again.",
            variant: "destructive",
          });
          // Navigate back to dashboard after a short delay
          setTimeout(() => {
            const role = localStorage.getItem('userRole') || 'patient';
            navigate(role === 'doctor' ? "/doctor-dashboard" : "/patient-dashboard");
          }, 2000);
          return;
        }
        
        // Get user role from localStorage - check both userRole and role keys
        const userRoleFromStorage = localStorage.getItem('userRole');
        const savedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        const role = userRoleFromStorage || savedUser?.role || 'patient';
        
        console.log("User role detected:", role);
        setUserRole(role);

        // If user is a patient, check if the doctor has initiated the call
        if (role === 'patient' && !data.is_online) {
          toast({
            title: "Call Not Started",
            description: "Please wait for the doctor to start the call. You'll be redirected to your dashboard.",
            variant: "destructive",
          });
          // Navigate back to dashboard after a short delay
          setTimeout(() => {
            navigate("/patient-dashboard");
          }, 3000);
          return;
        }
        
        // Mark the appointment as online
        await appointmentsApi.updateOnlineStatus(parseInt(appointmentId), true);
        
        toast({
          title: "Connected",
          description: `You are now connected to your ${role === 'doctor' ? 'patient' : 'doctor'}`,
        });
      } catch (error) {
        console.error("Error fetching appointment:", error);
        toast({
          title: "Error",
          description: "Failed to load appointment details",
          variant: "destructive",
        });
        
        navigate(userRole === 'doctor' ? "/doctor-dashboard" : "/patient-dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
    
    // When leaving the page, mark the appointment as offline
    return () => {
      if (appointmentId) {
        appointmentsApi.updateOnlineStatus(parseInt(appointmentId), false)
          .catch(err => console.error("Error updating online status:", err));
      }
    };
  }, [appointmentId, navigate, toast, userRole]);

  // Debug user role
  useEffect(() => {
    console.log("Current user role:", userRole);
    console.log("localStorage userRole:", localStorage.getItem('userRole'));
    console.log("localStorage user:", localStorage.getItem('user'));
    console.log("Can edit prescription:", userRole === 'doctor');
  }, [userRole]);

  // Check if there's an existing prescription
  useEffect(() => {
    if (appointment) {
      const fetchPrescription = async () => {
        try {
          console.log("Checking if prescription exists for appointment:", appointmentId);
          const exists = await prescriptionsApi.checkPrescriptionExists(parseInt(appointmentId));
          
          if (exists) {
            console.log("Prescription exists, fetching data");
            const data = await prescriptionsApi.getPrescription(parseInt(appointmentId));
            if (data) {
              console.log("Prescription data loaded:", data);
              setPrescription(data.prescription_text);
              setNotes(data.consultation_notes);
            }
          } else {
            console.log("No prescription exists yet for this appointment");
          }
        } catch (error) {
          console.error("Error checking/fetching prescription:", error);
          toast({
            title: "Error",
            description: "Could not load prescription data",
            variant: "destructive",
          });
        }
      };

      fetchPrescription();
    }
  }, [appointment, appointmentId, toast]);
  
  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleAudio = () => setIsAudioOn(!isAudioOn);
  
  const endCall = async () => {
    // Save prescription and notes before ending call (if doctor)
    if (userRole === 'doctor' && (prescription.trim() || notes.trim())) {
      await savePrescription();
    }
    
    setIsCallActive(false);
    
    // Mark the appointment as offline
    try {
      await appointmentsApi.updateOnlineStatus(parseInt(appointmentId), false);
      
      // If doctor is ending the call, mark the appointment as completed
      if (userRole === 'doctor') {
        console.log("Doctor ended call, marking appointment as completed");
        await appointmentsApi.updateAppointmentStatus(parseInt(appointmentId), "completed");
        toast({
          title: "Appointment Completed",
          description: "This appointment has been marked as completed. The patient will need to book a new appointment for further consultation.",
        });
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
    
    // Show feedback dialog for patients
    if (userRole === 'patient') {
      setShowFeedbackDialog(true);
    } else {
      // Doctors go back to their dashboard
      navigate("/doctor-dashboard");
    }
  };
  
  const savePrescription = async () => {
    if (!appointment) return;
    
    setIsSaving(true);
    
    try {
      // Ensure we have doctor name
      const doctorName = appointment.doctor_name || 
                         (localStorage.getItem('username') ? 
                          (localStorage.getItem('username').startsWith('Dr.') ? 
                           localStorage.getItem('username') : 
                           `Dr. ${localStorage.getItem('username')}`) : 
                          'Doctor');
      
      // Check if prescription already exists
      console.log("Checking if prescription exists for appointment:", appointmentId);
      const prescriptionExists = await prescriptionsApi.checkPrescriptionExists(parseInt(appointmentId));
      console.log("Prescription exists:", prescriptionExists);
      
      if (prescriptionExists) {
        // Update existing prescription
        console.log("Updating existing prescription");
        await prescriptionsApi.updatePrescription(
          parseInt(appointmentId), 
          prescription, 
          notes
        );
      } else {
        // Create new prescription
        console.log("Creating new prescription");
        await prescriptionsApi.savePrescription(
          parseInt(appointmentId), 
          prescription, 
          notes
        );
      }
      
      toast({
        title: "Saved",
        description: "Prescription and notes saved successfully",
      });
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast({
        title: "Error",
        description: "Failed to save prescription: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await prescriptionsApi.submitFeedback(
        parseInt(appointmentId),
        feedbackRating,
        feedbackComment
      );
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      
      setShowFeedbackDialog(false);
      navigate("/patient-dashboard");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const downloadReceipt = () => {
    if (!appointment) return;
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("TeleHealth Consultation Receipt", 105, 20, { align: 'center' });
    
    // Add separator line
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 51, 102);
    doc.line(20, 25, 190, 25);
    
    // Patient and appointment details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text("Patient Details", 20, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient: ${appointment.patient_username}`, 20, 43);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Doctor Details", 105, 35);
    doc.setFont('helvetica', 'normal');
    // Use the formatted doctor name without adding Dr. again
    doc.text(`${appointment.doctor_name}`, 105, 43);
    doc.text(`Specialty: ${appointment.specialty}`, 105, 51);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Appointment Details", 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${appointment.appointment_date}`, 20, 73);
    doc.text(`Time: ${appointment.appointment_time}`, 20, 81);
    doc.text(`Symptoms: ${appointment.symptoms}`, 20, 89);
    
    // Add prescription if available
    if (prescription) {
      doc.setFont('helvetica', 'bold');
      doc.text("Prescription", 20, 105);
      doc.setFont('helvetica', 'normal');
      
      // Handle long prescription text
      const splitPrescription = doc.splitTextToSize(prescription, 170);
      doc.text(splitPrescription, 20, 113);
      
      // Calculate height of prescription text
      const prescriptionHeight = splitPrescription.length * 7;
      
      // Add consultation notes if available
      if (notes) {
        doc.setFont('helvetica', 'bold');
        doc.text("Consultation Notes", 20, 113 + prescriptionHeight + 10);
        doc.setFont('helvetica', 'normal');
        
        const splitNotes = doc.splitTextToSize(notes, 170);
        doc.text(splitNotes, 20, 113 + prescriptionHeight + 18);
      }
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("This is an electronically generated receipt", 105, 280, { align: 'center' });
    
    // Save the PDF
    const fileName = `telehealth_receipt_${appointment.id}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "Receipt Downloaded",
      description: "Your consultation receipt has been downloaded.",
    });
  };
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading appointment...</span>
      </div>
    );
  }
  
  if (!appointment) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-2">Appointment Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested appointment could not be found.</p>
          <Button onClick={() => navigate(userRole === 'doctor' ? "/doctor-dashboard" : "/patient-dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
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
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 relative">
          <div className="w-full h-full bg-black relative flex items-center justify-center">
            {/* Main video (patient/doctor view) */}
            {isCallActive && isVideoOn ? (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/30 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl font-bold">
                      {userRole === 'doctor' ? appointment.patient_username?.charAt(0).toUpperCase() : appointment.doctor_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xl">
                    {userRole === 'doctor' ? appointment.patient_username : `Dr. ${appointment.doctor_name}`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <VideoOff className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-xl">Video {isCallActive ? "Off" : "Ended"}</p>
                </div>
              </div>
            )}
            
            {/* Small video (doctor/patient self view) */}
            <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
              {isCallActive && isVideoOn ? (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/30 mx-auto mb-2 flex items-center justify-center">
                      <span className="text-lg font-bold">
                        {userRole === 'doctor' ? 'D' : 'P'}
                      </span>
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
            
            {/* Allow both doctors and patients to download receipt */}
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
            <h2 className="font-bold text-lg">
              {userRole === 'doctor' ? appointment.patient_username : appointment.doctor_name}
            </h2>
            <div className="mt-2">
              <h3 className="text-sm font-medium">Symptoms</h3>
              <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
            </div>
          </div>
          
          {/* Toggle between Prescription and Medical AI Chat */}
          <div className="p-2 border-b bg-muted/30">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={!showMedicalChat ? "default" : "outline"} 
                className="w-full" 
                onClick={() => setShowMedicalChat(false)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Prescription
              </Button>
              <Button 
                variant={showMedicalChat ? "default" : "outline"} 
                className="w-full" 
                onClick={() => setShowMedicalChat(true)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Medical AI
              </Button>
            </div>
          </div>
          
          {/* Prescription or Medical Chatbot */}
          {!showMedicalChat ? (
            <div className="flex-1 flex flex-col p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Prescription</h3>
                {userRole === 'doctor' && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Doctor Mode - You can edit
                  </span>
                )}
                {userRole === 'patient' && prescription && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadReceipt}
                    className="flex items-center"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </Button>
                )}
              </div>
              
              <Textarea
                placeholder="Write prescription details here..."
                className={`min-h-[120px] mb-4 ${userRole === 'doctor' ? 'border-primary focus:ring-2 focus:ring-primary/20' : ''}`}
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                disabled={userRole !== 'doctor'}
              />
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Consultation Notes</h3>
              </div>
              
              <Textarea
                placeholder="Add your notes here..."
                className={`flex-1 ${userRole === 'doctor' ? 'border-primary focus:ring-2 focus:ring-primary/20' : ''}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={userRole !== 'doctor'}
              />
              
              {userRole === 'doctor' && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="default" 
                    onClick={savePrescription}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save and Submit
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <MedicalChatbot isCompact={true} className="h-full" />
            </div>
          )}
          
          {/* Actions */}
          <div className="p-4 border-t bg-muted/30">
            <div className="grid grid-cols-1 gap-2">
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
            <Button variant="outline" onClick={() => navigate("/patient-dashboard")}>
              Skip
            </Button>
            <Button 
              type="submit" 
              onClick={handleFeedbackSubmit}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoCall; 