import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  MessageSquare, 
  Bell, 
  Search, 
  Video, 
  ChevronRight, 
  User,
  Moon,
  Sun,
  LogOut,
  UserCircle,
  UserX,
  AlertCircle,
  Loader2,
  Download,
  Phone,
  Mail,
  Activity,
  ClipboardList
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { appointmentsApi, prescriptionsApi, patientsApi } from "@/utils/api";
import AnimatedAvatar from "@/components/AnimatedAvatar";
import { jsPDF } from "jspdf";

// Mock data for appointments
const todayAppointments = [
  {
    id: 1,
    patientName: "Ananya Patel",
    time: "09:30 AM",
    symptoms: "Persistent cough and fever",
    status: "upcoming",
    isOnline: true,
  },
  {
    id: 2,
    patientName: "Rahul Sharma",
    time: "11:00 AM",
    symptoms: "Back pain and stiffness",
    status: "upcoming",
    isOnline: false,
  },
  {
    id: 3,
    patientName: "Priya Verma",
    time: "12:30 PM",
    symptoms: "Migraine and dizziness",
    status: "upcoming",
    isOnline: true,
  },
  {
    id: 4,
    patientName: "Vikram Singh",
    time: "02:15 PM",
    symptoms: "Skin rash and itching",
    status: "upcoming",
    isOnline: false,
  },
  {
    id: 5,
    patientName: "Neha Gupta",
    time: "04:00 PM",
    symptoms: "Follow-up for hypertension",
    status: "upcoming",
    isOnline: true,
  }
];

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("upcoming");
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [prescriptionSearchQuery, setPrescriptionSearchQuery] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Doctor profile data
  const [doctorData, setDoctorData] = useState({
    name: localStorage.getItem("username") || "Dr. Arun Mehta",
    specialty: "General Medicine",
    totalPatients: 0,
    totalAppointments: 0,
    rating: 4.8
  });
  
  // Fetch prescriptions for completed appointments
  const fetchPrescriptions = useCallback(async () => {
    if (activeTab === "prescriptions") {
      setIsLoadingPrescriptions(true);
      try {
        // First get all completed appointments
        const completedAppointments = await appointmentsApi.listDoctorAppointments();
        const filtered = completedAppointments.filter(appt => appt.status === "completed");
        
        // For each completed appointment, try to fetch the prescription
        const prescriptionsData = [];
        
        for (const appointment of filtered) {
          try {
            // Check if prescription exists
            const exists = await prescriptionsApi.checkPrescriptionExists(appointment.id);
            if (exists) {
              const prescription = await prescriptionsApi.getPrescription(appointment.id);
              prescriptionsData.push({
                ...prescription,
                appointment_id: appointment.id,
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                patient_name: appointment.patient_name,
                patient_id: appointment.patient_id
              });
            }
          } catch (error) {
            console.error(`Error fetching prescription for appointment ${appointment.id}:`, error);
          }
        }
        
        setPrescriptions(prescriptionsData);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        toast({
          title: "Error",
          description: "Failed to load prescriptions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPrescriptions(false);
      }
    }
  }, [activeTab, toast]);
  
  // Fetch patients for the doctor
  const fetchPatients = useCallback(async () => {
    if (activeTab === "patients") {
      setIsLoadingPatients(true);
      try {
        // Get all appointments for the current doctor
        const allAppointments = await appointmentsApi.listDoctorAppointments();
        
        // Extract unique patients from appointments
        const uniquePatients = [];
        const patientIds = new Set();
        
        allAppointments.forEach(appointment => {
          if (!patientIds.has(appointment.patient_id)) {
            patientIds.add(appointment.patient_id);
            uniquePatients.push({
              id: appointment.patient_id,
              name: appointment.patient_name || appointment.patient_username,
              username: appointment.patient_username,
              lastVisit: appointment.appointment_date,
              lastVisitTime: appointment.appointment_time,
              symptoms: appointment.symptoms,
              appointmentCount: 1,
              completedAppointments: appointment.status === "completed" ? 1 : 0
            });
          } else {
            // Update existing patient data
            const existingPatient = uniquePatients.find(p => p.id === appointment.patient_id);
            if (existingPatient) {
              // Check if this appointment is more recent
              const lastVisitDate = new Date(existingPatient.lastVisit);
              const currentAppointmentDate = new Date(appointment.appointment_date);
              
              if (currentAppointmentDate > lastVisitDate) {
                existingPatient.lastVisit = appointment.appointment_date;
                existingPatient.lastVisitTime = appointment.appointment_time;
                existingPatient.symptoms = appointment.symptoms;
              }
              
              existingPatient.appointmentCount += 1;
              if (appointment.status === "completed") {
                existingPatient.completedAppointments += 1;
              }
            }
          }
        });
        
        // Sort patients by most recent visit
        uniquePatients.sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));
        
        setPatients(uniquePatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPatients(false);
      }
    }
  }, [activeTab, toast]);
  
  // Fetch patient details when selected
  const fetchPatientDetails = useCallback(async (patientId) => {
    try {
      // Fetch patient appointments
      const allAppointments = await appointmentsApi.listDoctorAppointments();
      const patientAppts = allAppointments.filter(appt => appt.patient_id === patientId);
      setPatientAppointments(patientAppts);
      
      // Fetch patient prescriptions
      const patientPrescs = [];
      for (const appt of patientAppts.filter(a => a.status === "completed")) {
        try {
          const exists = await prescriptionsApi.checkPrescriptionExists(appt.id);
          if (exists) {
            const prescription = await prescriptionsApi.getPrescription(appt.id);
            patientPrescs.push({
              ...prescription,
              appointment_id: appt.id,
              appointment_date: appt.appointment_date,
              appointment_time: appt.appointment_time
            });
          }
        } catch (error) {
          console.error(`Error fetching prescription for appointment ${appt.id}:`, error);
        }
      }
      setPatientPrescriptions(patientPrescs);
      
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast({
        title: "Error",
        description: "Failed to load patient details",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (activeTab === "appointments" || activeTab === "dashboard") {
      setIsLoadingAppointments(true);
      try {
        // Check authentication data
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        const userRole = localStorage.getItem('userRole');
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        
        console.log("Auth Debug:", { 
          hasToken: !!token, 
          tokenLength: token ? token.length : 0,
          username, 
          userRole, 
          isAuthenticated
        });
        
        if (!token || userRole !== 'doctor') {
          console.error("Authentication issue - Missing token or not a doctor. Role:", userRole);
          setAppointments([]);
          setIsLoadingAppointments(false);
          toast({
            title: "Authentication Error",
            description: "Please login again as a doctor",
            variant: "destructive",
          });
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        // Get all appointments for the current doctor
        let response;
        if (activeTab === "dashboard") {
          console.log("Fetching today's appointments for doctor");
          response = await appointmentsApi.listTodayDoctorAppointments();
        } else {
          console.log("Fetching all appointments for doctor");
          response = await appointmentsApi.listDoctorAppointments();
        }
        
        // Make sure response is an array before setting state
        if (Array.isArray(response)) {
          console.log(`Loaded ${response.length} appointments for doctor`);
          setAppointments(response);
          
          // Update stats
          const totalPatients = new Set(response.map(appt => appt.patient_id)).size;
          setDoctorData(prev => ({
            ...prev,
            totalPatients,
            totalAppointments: response.length
          }));
        } else {
          console.warn("Invalid appointments data format. Expected array but got:", typeof response);
          
          // Try direct fetch as fallback with proper API_BASE_URL prefix
          try {
            const apiBaseUrl = "/api"; // Same as API_BASE_URL in utils/api.js
            const endpoint = activeTab === "dashboard" ? 
              `${apiBaseUrl}/doctors/appointments/today` : `${apiBaseUrl}/doctors/appointments`;
              
            console.log(`Attempting direct fetch to ${endpoint} with auth token`);
            
            const directResponse = await fetch(endpoint, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Username': username,
                'X-Role': userRole
              }
            });
            
            console.log(`Direct fetch response status: ${directResponse.status}`);
            
            if (directResponse.ok) {
              const data = await directResponse.json();
              if (Array.isArray(data)) {
                console.log(`Loaded ${data.length} appointments via direct fetch`);
                setAppointments(data);
              } else {
                console.warn("Direct fetch returned invalid format:", typeof data);
                setAppointments([]);
              }
            } else {
              // Try to read error message
              try {
                const errorText = await directResponse.text();
                console.warn("Direct fetch error response:", errorText);
              } catch (e) {
                console.warn("Could not read error response");
              }
              
              console.warn("Direct fetch failed with status:", directResponse.status);
              setAppointments([]);
            }
          } catch (directError) {
            console.error("Direct fetch error:", directError);
            setAppointments([]);
          }
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setIsLoadingAppointments(false);
      }
    }
  }, [activeTab, toast, navigate]);

  // Refetch appointments when tab changes
  useEffect(() => {
    fetchAppointments();
  }, [activeTab, fetchAppointments]);
  
  // Fetch prescriptions when the prescriptions tab is selected
  useEffect(() => {
    if (activeTab === "prescriptions") {
      fetchPrescriptions();
    }
  }, [activeTab, fetchPrescriptions]);
  
  // Fetch patients when the patients tab is selected
  useEffect(() => {
    if (activeTab === "patients") {
      fetchPatients();
    }
  }, [activeTab, fetchPatients]);
  
  // Filter appointments for today
  const todayAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return appointmentDate === today && appointment.status === "upcoming";
    });
  }, [appointments]);
  
  // Filter appointments based on search query and status filter
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => 
      (appointmentStatusFilter === "all" || appointment.status === appointmentStatusFilter) &&
      ((appointment.patient_name && appointment.patient_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (appointment.symptoms && appointment.symptoms.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (appointment.appointment_date && appointment.appointment_date.includes(searchQuery.toLowerCase())) ||
      (appointment.appointment_time && appointment.appointment_time.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [appointments, searchQuery, appointmentStatusFilter]);
  
  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => 
      (patient.name && patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase())) ||
      (patient.username && patient.username.toLowerCase().includes(patientSearchQuery.toLowerCase())) ||
      (patient.symptoms && patient.symptoms.toLowerCase().includes(patientSearchQuery.toLowerCase()))
    );
  }, [patients, patientSearchQuery]);
  
  // Check authentication and show notification for upcoming appointments
  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userRole = localStorage.getItem("userRole");
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // If not a doctor, redirect to appropriate dashboard
    if (userRole !== "doctor") {
      navigate("/patient/dashboard");
      return;
    }
    
    const nextAppointment = todayAppointments[0];
    if (nextAppointment) {
      setTimeout(() => {
        toast({
          title: "Upcoming Appointment",
          description: `${nextAppointment.patient_name} at ${nextAppointment.appointment_time}`,
          duration: 5000,
        });
      }, 3000);
    }
  }, [toast, navigate]);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you'd update the class on the document element
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };
  
  const startVideoCall = (appointmentId) => {
    navigate(`/video-call/${appointmentId}`);
  };
  
  const handleLogout = () => {
    // Clear authentication state from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    
    navigate("/login");
  };
  
  // Extract unique patients from appointments
  const recentPatients = appointments
    .filter((appointment, index, self) => {
      // Keep only the first occurrence of each patient_id
      return index === self.findIndex(a => a.patient_id === appointment.patient_id);
    })
    .map(appointment => ({
      id: appointment.patient_id,
      name: appointment.patient_name,
      lastVisit: new Date(appointment.appointment_date).toLocaleDateString(),
      condition: appointment.symptoms
    }))
    .slice(0, 5); // Just show the first 5 patients

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if a date is today
  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };
  
  // Filter prescriptions based on search query
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter(prescription => 
      (prescription.patient_name && prescription.patient_name.toLowerCase().includes(prescriptionSearchQuery.toLowerCase())) ||
      (prescription.prescription_text && prescription.prescription_text.toLowerCase().includes(prescriptionSearchQuery.toLowerCase())) ||
      (prescription.appointment_date && prescription.appointment_date.includes(prescriptionSearchQuery.toLowerCase()))
    );
  }, [prescriptions, prescriptionSearchQuery]);
  
  // Download prescription as PDF
  const downloadPrescription = (prescription) => {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("Medical Prescription", 105, 20, { align: 'center' });
    
    // Add separator line
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 51, 102);
    doc.line(20, 25, 190, 25);
    
    // Doctor and patient details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text("Doctor Details", 20, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`Doctor: ${doctorData.name}`, 20, 43);
    doc.text(`Specialty: ${doctorData.specialty}`, 20, 51);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Patient Details", 105, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient: ${prescription.patient_name}`, 105, 43);
    
    doc.setFont('helvetica', 'bold');
    doc.text("Appointment Details", 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${prescription.appointment_date}`, 20, 73);
    doc.text(`Time: ${prescription.appointment_time}`, 20, 81);
    
    // Add prescription
    doc.setFont('helvetica', 'bold');
    doc.text("Prescription", 20, 95);
    doc.setFont('helvetica', 'normal');
    
    // Handle long prescription text
    const splitPrescription = doc.splitTextToSize(prescription.prescription_text, 170);
    doc.text(splitPrescription, 20, 103);
    
    // Calculate height of prescription text
    const prescriptionHeight = splitPrescription.length * 7;
    
    // Add consultation notes if available
    if (prescription.consultation_notes) {
      doc.setFont('helvetica', 'bold');
      doc.text("Consultation Notes", 20, 103 + prescriptionHeight + 10);
      doc.setFont('helvetica', 'normal');
      
      const splitNotes = doc.splitTextToSize(prescription.consultation_notes, 170);
      doc.text(splitNotes, 20, 103 + prescriptionHeight + 18);
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("This is an electronically generated prescription", 105, 280, { align: 'center' });
    
    // Save the PDF
    const fileName = `prescription_${prescription.appointment_id}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "Prescription Downloaded",
      description: "Prescription has been downloaded.",
    });
  };
  
  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 flex-col bg-muted border-r">
          <div className="p-4 flex items-center space-x-2">
            <img 
              src="/telehealth-logo.svg" 
              alt="TeleHealth Logo" 
              className="h-8 w-8"
            />
            <span className="font-bold text-lg">TeleHealth</span>
          </div>
          
          <Separator />
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Button 
                  variant={activeTab === "dashboard" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("dashboard")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </li>
              <li>
                <Button 
                  variant={activeTab === "appointments" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("appointments")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Appointments
                </Button>
              </li>
              <li>
                <Button 
                  variant={activeTab === "patients" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("patients")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Patients
                </Button>
              </li>
              <li>
                <Button 
                  variant={activeTab === "prescriptions" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("prescriptions")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Prescriptions
                </Button>
              </li>
              <li>
                <Button 
                  variant={activeTab === "messages" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("messages")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>
              </li>
            </ul>
          </nav>
          
          <div className="p-4 relative z-50">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-background border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Welcome, {doctorData.name}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-0 h-10 w-10 rounded-full">
                    <AnimatedAvatar 
                      name={doctorData.name} 
                      size="md" 
                      className="shadow-md hover:shadow-lg transition-shadow"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{doctorData.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {doctorData.specialty}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile?showDeleteDialog=true")}
                    className="text-red-500 hover:text-red-600 focus:text-red-600"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    <span>Delete Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-4">
            {activeTab === "patients" ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Patients</CardTitle>
                    <CardDescription>View and manage your patients</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="Search patients..." 
                      className="pl-10"
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingPatients ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading patients...</span>
                    </div>
                  ) : filteredPatients.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPatients.slice(0, 10).map((patient) => (
                        <Card 
                          key={patient.id} 
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => {
                            setSelectedPatient(patient);
                            fetchPatientDetails(patient.id);
                            setIsPatientDialogOpen(true);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <AnimatedAvatar 
                                  name={patient.name} 
                                  size="md" 
                                  className="shadow-md"
                                />
                                <div className="ml-3">
                                  <h3 className="font-medium">{patient.name}</h3>
                                  <p className="text-sm text-muted-foreground">Last visit: {formatDate(patient.lastVisit)}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge variant="outline">
                                  {patient.appointmentCount} appointments
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <h4 className="text-sm font-medium">Last Symptoms:</h4>
                              <p className="text-sm text-muted-foreground">
                                {patient.symptoms || "No symptoms recorded"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="flex justify-center mb-3">
                        <Users className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No patients found</h3>
                      <p className="text-muted-foreground">
                        {patientSearchQuery 
                          ? "Try adjusting your search" 
                          : "You haven't seen any patients yet"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : activeTab === "prescriptions" ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Prescriptions</CardTitle>
                    <CardDescription>Manage and view prescriptions for your patients</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="Search prescriptions..." 
                      className="pl-10"
                      value={prescriptionSearchQuery}
                      onChange={(e) => setPrescriptionSearchQuery(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingPrescriptions ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading prescriptions...</span>
                    </div>
                  ) : filteredPrescriptions.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPrescriptions.map((prescription) => (
                        <Card 
                          key={prescription.id} 
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setIsPrescriptionDialogOpen(true);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <AnimatedAvatar 
                                  name={prescription.patient_name} 
                                  size="md" 
                                  className="shadow-md"
                                />
                                <div className="ml-3">
                                  <h3 className="font-medium">{prescription.patient_name}</h3>
                                  <p className="text-sm text-muted-foreground">{formatDate(prescription.appointment_date)}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <Badge variant="outline">
                                  {prescription.appointment_time}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <h4 className="text-sm font-medium">Prescription:</h4>
                              <p className="text-sm text-muted-foreground">
                                {prescription.prescription_text.length > 100
                                  ? `${prescription.prescription_text.substring(0, 100)}...`
                                  : prescription.prescription_text}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="flex justify-center mb-3">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No prescriptions found</h3>
                      <p className="text-muted-foreground">
                        {prescriptionSearchQuery 
                          ? "Try adjusting your search" 
                          : "You haven't written any prescriptions yet"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : activeTab === "appointments" ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Appointments</CardTitle>
                    <CardDescription>Manage your appointments</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant={appointmentStatusFilter === "upcoming" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setAppointmentStatusFilter("upcoming")}
                      >
                        Upcoming
                      </Button>
                      <Button 
                        variant={appointmentStatusFilter === "completed" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setAppointmentStatusFilter("completed")}
                      >
                        Completed
                      </Button>
                      <Button 
                        variant={appointmentStatusFilter === "all" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setAppointmentStatusFilter("all")}
                      >
                        All
                      </Button>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="Search appointments..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAppointments ? (
                    <div className="flex justify-center items-center py-10">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Loading appointments...</span>
                    </div>
                  ) : filteredAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {filteredAppointments.map((appointment) => (
                        <Card key={appointment.id} className="cursor-pointer hover:border-primary transition-colors">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <AnimatedAvatar 
                                  name={appointment.patient_name} 
                                  size="md" 
                                  className="shadow-md"
                                />
                                <div className="ml-3">
                                  <h3 className="font-medium">{appointment.patient_name}</h3>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <span>{formatDate(appointment.appointment_date)}</span>
                                    <span className="mx-1">•</span>
                                    <span>{appointment.appointment_time}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={appointment.status === "completed" ? "secondary" : "default"}>
                                  {appointment.status}
                                </Badge>
                                <Badge variant={appointment.is_online ? "outline" : "secondary"}>
                                  {appointment.is_online ? "Online" : "In-person"}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-3">
                              <h4 className="text-sm font-medium">Symptoms:</h4>
                              <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                            </div>
                            <div className="mt-4 flex justify-end">
                              {appointment.is_online && appointment.status === "upcoming" && (
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  onClick={() => startVideoCall(appointment.id)}
                                >
                                  <Video className="mr-2 h-4 w-4" />
                                  Start Call
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="flex justify-center mb-3">
                        <Calendar className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No appointments found</h3>
                      <p className="text-muted-foreground">
                        {searchQuery 
                          ? "No appointments matching your search criteria" 
                          : appointmentStatusFilter === "all"
                            ? "You have no appointments"
                            : `You have no ${appointmentStatusFilter} appointments`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Patients</p>
                        <p className="text-3xl font-bold">{doctorData.totalPatients}</p>
                      </div>
                      <Users className="h-10 w-10 text-primary/60" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Appointments</p>
                        <p className="text-3xl font-bold">{doctorData.totalAppointments}</p>
                      </div>
                      <Calendar className="h-10 w-10 text-primary/60" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Rating</p>
                        <p className="text-3xl font-bold">{doctorData.rating}/5.0</p>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`w-5 h-5 ${i < Math.floor(doctorData.rating) ? "opacity-100" : "opacity-30"}`}
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="mb-6">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>Today's Appointments</CardTitle>
                          <CardDescription>You have {todayAppointments.length} upcoming appointments today</CardDescription>
                        </div>
                        <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input 
                            placeholder="Search upcoming appointments..." 
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isLoadingAppointments ? (
                          <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Loading appointments...</span>
                          </div>
                        ) : filteredAppointments.length > 0 ? (
                          <div className="space-y-4">
                            {filteredAppointments.map((appointment) => (
                              <Card key={appointment.id} className="cursor-pointer hover:border-primary transition-colors">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                      <AnimatedAvatar 
                                        name={appointment.patient_name} 
                                        size="md" 
                                        className="shadow-md"
                                      />
                                      <div className="ml-3">
                                        <h3 className="font-medium">{appointment.patient_name}</h3>
                                        <p className="text-sm text-muted-foreground">{appointment.appointment_time}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center">
                                      <Badge variant={appointment.is_online ? "default" : "outline"}>
                                        {appointment.is_online ? "Online" : "In-person"}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <h4 className="text-sm font-medium">Symptoms:</h4>
                                    <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                                  </div>
                                  <div className="mt-4 flex justify-end">
                                    {appointment.is_online && (
                                      <Button 
                                        variant="default" 
                                        size="sm" 
                                        onClick={() => startVideoCall(appointment.id)}
                                      >
                                        <Video className="mr-2 h-4 w-4" />
                                        Start Call
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : searchQuery ? (
                          <div className="text-center py-10">
                            <div className="flex justify-center mb-3">
                              <AlertCircle className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No appointments found</h3>
                            <p className="text-muted-foreground">
                              No upcoming appointments matching "{searchQuery}"
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-10">
                            <div className="flex justify-center mb-3">
                              <Calendar className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No upcoming appointments</h3>
                            <p className="text-muted-foreground">
                              You have no upcoming appointments scheduled for today
                            </p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <Button variant="outline" onClick={() => setActiveTab("appointments")}>
                          View All Appointments <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Patients</CardTitle>
                        <CardDescription>Recently consulted patients</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {recentPatients.length > 0 ? (
                            recentPatients.map((patient) => (
                              <div key={patient.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <AnimatedAvatar 
                                    name={patient.name} 
                                    size="sm" 
                                    className="shadow-md"
                                  />
                                  <div className="ml-3">
                                    <h3 className="font-medium text-sm">{patient.name}</h3>
                                    <p className="text-xs text-muted-foreground">Last visit: {patient.lastVisit}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <div className="flex justify-center mb-3">
                                <Users className="h-8 w-8 text-muted-foreground" />
                              </div>
                              <p className="text-muted-foreground">No patients yet</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <Button variant="outline" onClick={() => setActiveTab("patients")}>
                          View All Patients <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          Write New Prescription
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message to Patient
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Appointment
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Report Emergency
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Prescription Details Dialog */}
      {selectedPrescription && (
        <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Prescription Details</DialogTitle>
              <DialogDescription>
                Prescription for {selectedPrescription.patient_name} on {formatDate(selectedPrescription.appointment_date)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm">Patient</h3>
                    <p>{selectedPrescription.patient_name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Date</h3>
                    <p>{formatDate(selectedPrescription.appointment_date)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-sm">Prescription</h3>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{selectedPrescription.prescription_text}</p>
                  </div>
                </div>
                
                {selectedPrescription.consultation_notes && (
                  <div>
                    <h3 className="font-medium text-sm">Consultation Notes</h3>
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="whitespace-pre-wrap">{selectedPrescription.consultation_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsPrescriptionDialogOpen(false)}
              >
                Close
              </Button>
              <Button 
                onClick={() => downloadPrescription(selectedPrescription)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
              <DialogDescription>
                Information about {selectedPatient.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center">
                <AnimatedAvatar 
                  name={selectedPatient.name} 
                  size="lg" 
                  className="shadow-md"
                />
                <div className="ml-4">
                  <h2 className="text-xl font-bold">{selectedPatient.name}</h2>
                  <p className="text-muted-foreground">Username: {selectedPatient.username}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Appointments</h3>
                  </div>
                  <p className="text-2xl font-bold mt-1">{selectedPatient.appointmentCount}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.completedAppointments} completed
                  </p>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Last Visit</h3>
                  </div>
                  <p className="text-md font-medium mt-1">{formatDate(selectedPatient.lastVisit)}</p>
                  <p className="text-sm text-muted-foreground">{selectedPatient.lastVisitTime}</p>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div>
                <h3 className="font-medium mb-2">Recent Appointments</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {patientAppointments.length > 0 ? (
                    patientAppointments.map(appointment => (
                      <div 
                        key={appointment.id} 
                        className="p-2 border rounded-md flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{formatDate(appointment.appointment_date)}</span>
                            <span className="mx-2 text-muted-foreground">•</span>
                            <span>{appointment.appointment_time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{appointment.symptoms}</p>
                        </div>
                        <div>
                          <Badge variant={appointment.status === "completed" ? "default" : "outline"}>
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No appointments found</p>
                  )}
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div>
                <h3 className="font-medium mb-2">Prescriptions</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {patientPrescriptions.length > 0 ? (
                    patientPrescriptions.map(prescription => (
                      <div 
                        key={prescription.id} 
                        className="p-2 border rounded-md cursor-pointer hover:bg-muted/30"
                        onClick={() => {
                          setIsPatientDialogOpen(false);
                          setTimeout(() => {
                            setSelectedPrescription({
                              ...prescription,
                              patient_name: selectedPatient.name
                            });
                            setIsPrescriptionDialogOpen(true);
                          }, 100);
                        }}
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{formatDate(prescription.appointment_date)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {prescription.prescription_text.substring(0, 60)}
                          {prescription.prescription_text.length > 60 ? "..." : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No prescriptions found</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsPatientDialogOpen(false)}
              >
                Close
              </Button>
              {patientAppointments.some(a => a.status !== "completed" && a.is_online) && (
                <Button 
                  onClick={() => {
                    const appointment = patientAppointments.find(a => a.status !== "completed" && a.is_online);
                    if (appointment) {
                      startVideoCall(appointment.id);
                    }
                  }}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Start Call
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default DoctorDashboard; 