import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  Search, 
  Video, 
  User,
  FileText,
  MessageSquare,
  Bell,
  ChevronRight,
  LogOut,
  UserCircle,
  Moon,
  Sun,
  Stethoscope,
  Mail,
  Phone,
  Star,
  TicketCheck,
  Loader2,
  Download
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { doctorsApi, appointmentsApi, patientsApi, prescriptionsApi } from "@/utils/api";
import AnimatedAvatar from "@/components/AnimatedAvatar";
import { jsPDF } from "jspdf";

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isDoctorDialogOpen, setIsDoctorDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [prescriptionSearchQuery, setPrescriptionSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Use state for patient data instead of hardcoded values
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    gender: ""
  });

  // Function to fetch the initial list of doctors
  const fetchInitialDoctors = useCallback(async () => {
    setIsSearching(true);
    try {
      const response = await doctorsApi.listDoctors(1, 10); // Get first page, 10 doctors
      setDoctors(response);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);
  
  // Add a function to search for doctors
  const searchDoctors = useCallback(async () => {
    if (!doctorSearchQuery.trim()) {
      // If search query is empty, fetch initial list
      fetchInitialDoctors();
      return;
    }
    
    setIsSearching(true);
    try {
      // First, try to search by specialty if it matches exactly
      if (doctorSearchQuery.trim().length > 2) {
        try {
          const specialtyResponse = await doctorsApi.searchDoctorsBySpecialty(doctorSearchQuery);
          if (specialtyResponse && specialtyResponse.length > 0) {
            setDoctors(specialtyResponse);
            setIsSearching(false);
            return;
          }
        } catch (error) {
          console.error("Error searching by specialty, falling back to general search:", error);
        }
      }
      
      // If specialty search returns no results or fails, do a general search
      const response = await doctorsApi.listDoctors(1, 50); // Get more doctors for client-side filtering
      
      // Filter results by name, specialization, or qualification
      const query = doctorSearchQuery.toLowerCase();
      const filtered = response.filter(doctor => 
        (doctor.name && doctor.name.toLowerCase().includes(query)) ||
        (doctor.specialization && doctor.specialization.toLowerCase().includes(query)) ||
        (doctor.qualification && doctor.qualification.toLowerCase().includes(query))
      );
      
      setDoctors(filtered);
    } catch (error) {
      console.error("Error searching doctors:", error);
      toast({
        title: "Search Error",
        description: "Failed to search for doctors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [doctorSearchQuery, fetchInitialDoctors, toast]);

  // Check for URL parameters to set active tab
  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    
    // Set active tab if specified in URL
    if (tabParam === 'doctors') {
      setActiveTab('doctors');
      
      // Check if there's a stored specialty to pre-populate the search
      const selectedSpecialty = localStorage.getItem("selectedSpecialty");
      if (selectedSpecialty) {
        setDoctorSearchQuery(selectedSpecialty);
        // Clear the stored specialty to avoid persistent filter
        localStorage.removeItem("selectedSpecialty");
        // Trigger search after a short delay to allow component to fully render
        setTimeout(() => searchDoctors(), 500);
      }
    }
  }, [location, searchDoctors]);

  // Fetch patient profile data function - moved outside of useEffect and wrapped in useCallback
  const fetchPatientProfile = useCallback(async () => {
    try {
      const userData = await fetch("/api/patients/profile", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      }).then(res => res.json());
      
      setPatientData(userData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to username from localStorage if API fails
      setPatientData(prev => ({
        ...prev,
        name: localStorage.getItem("username") || "User"
      }));
    }
  }, []);

  // Check authentication and fetch profile
  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchPatientProfile();
  }, [navigate, fetchPatientProfile]);

  // Fetch appointments function - moved outside of useEffect and wrapped in useCallback
  const fetchAppointments = useCallback(async () => {
    if (activeTab === "appointments") {
      setIsLoadingAppointments(true);
      try {
        // Get all appointments for the current patient
        const response = await appointmentsApi.listPatientAppointments();
        
        // Make sure response is an array before setting state
        if (Array.isArray(response)) {
          console.log("Appointments loaded successfully:", response);
          setAppointments(response);
        } else {
          console.warn("Invalid appointments data format. Expected array but got:", typeof response);
          // Try a direct fetch as a fallback
          try {
            const token = localStorage.getItem('token');
            const directResponse = await fetch('/patients/appointments', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (directResponse.ok) {
              const data = await directResponse.json();
              if (Array.isArray(data)) {
                console.log("Appointments loaded via direct fetch:", data);
                setAppointments(data);
              } else {
                console.warn("Direct fetch also returned invalid format:", typeof data);
                setAppointments([]);
              }
            } else {
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
        // Don't show toast for JSON parsing errors
        if (!error.toString().includes("JSON")) {
          toast({
            title: "Error",
            description: "Failed to load appointments. Please try again.",
            variant: "destructive",
          });
        }
        // Try a direct fetch as a fallback
        try {
          const token = localStorage.getItem('token');
          const directResponse = await fetch('/patients/appointments', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (directResponse.ok) {
            const data = await directResponse.json();
            if (Array.isArray(data)) {
              console.log("Appointments loaded via direct fetch after error:", data);
              setAppointments(data);
            } else {
              console.warn("Direct fetch after error returned invalid format:", typeof data);
              setAppointments([]);
            }
          } else {
            console.warn("Direct fetch after error failed with status:", directResponse.status);
            setAppointments([]);
          }
        } catch (directError) {
          console.error("Direct fetch error after initial error:", directError);
          setAppointments([]);
        }
      } finally {
        setIsLoadingAppointments(false);
      }
    }
  }, [activeTab, toast]);

  // Fetch appointments when activeTab changes
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  
  // Filter appointments based on search query and status filter
  const filteredAppointments = appointments.filter(appointment => 
    (appointmentStatusFilter === "all" || appointment.status === appointmentStatusFilter) &&
    ((appointment.doctor_name && appointment.doctor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (appointment.specialty && appointment.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (appointment.symptoms && appointment.symptoms.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (appointment.appointment_date && appointment.appointment_date.includes(searchQuery.toLowerCase())) ||
    (appointment.appointment_time && appointment.appointment_time.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  
  // Calculate today's appointments using useMemo
  const todayAppointments = useMemo(() => {
    return appointments.filter(appointment => 
      appointment.appointment_date === new Date().toISOString().split('T')[0] && 
      appointment.status === "upcoming"
    );
  }, [appointments]);
  
  // Show notification for upcoming appointments
  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (todayAppointments.length > 0) {
      setTimeout(() => {
        toast({
          title: "Upcoming Appointment Today",
          description: `${todayAppointments[0].doctor_name} at ${todayAppointments[0].appointment_time}`,
          duration: 5000,
        });
      }, 3000);
    }

    // Load initial doctors when "doctors" tab is selected
    if (activeTab === "doctors") {
      fetchInitialDoctors();
    }
  }, [toast, navigate, activeTab, appointments, fetchInitialDoctors]);

  // Handle appointment click to show details dialog
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentDialogOpen(true);
  };

  // Handle appointment cancellation
  const cancelAppointment = async (appointmentId) => {
    try {
      await appointmentsApi.deleteAppointment(appointmentId);
      
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully.",
      });
      
      // Refresh appointments list
      const response = await appointmentsApi.listPatientAppointments();
      setAppointments(response);
      
      // Close the dialog
      setIsAppointmentDialogOpen(false);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to format a date string to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to check if an appointment is today
  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you'd update the class on the document element
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };
  
  const joinVideoCall = (appointmentId) => {
    // Check if the appointment is online and not completed
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      toast({
        title: "Error",
        description: "Appointment not found.",
        variant: "destructive",
      });
      return;
    }
    
    if (appointment.status === "completed") {
      toast({
        title: "Appointment Completed",
        description: "This appointment has been completed. You cannot join the call.",
        variant: "destructive",
      });
      return;
    }
    
    if (!appointment.is_online) {
      toast({
        title: "Call Not Started",
        description: "Please wait for the doctor to start the call.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/video-call/${appointmentId}`);
  };
  
  const handleLogout = () => {
    // Clear authentication state from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    
    navigate("/login");
  };
  
  // Function to handle doctor card click
  const handleDoctorClick = (doctor) => {
    setSelectedDoctor(doctor);
    setIsDoctorDialogOpen(true);
  };

  // Function to book appointment with selected doctor
  const bookAppointment = () => {
    if (selectedDoctor) {
      navigate(`/book-appointment/${selectedDoctor.username}`);
    }
  };

  // Fetch prescriptions for completed appointments
  const fetchPrescriptions = async () => {
    setIsLoadingPrescriptions(true);
    try {
      // First get all completed appointments
      const completedAppointments = await appointmentsApi.listCompletedPatientAppointments();
      
      // For each completed appointment, try to fetch the prescription
      const prescriptionsData = [];
      
      for (const appointment of completedAppointments) {
        try {
          // Check if prescription exists
          const exists = await prescriptionsApi.checkPrescriptionExists(appointment.id);
          if (exists) {
            const prescription = await prescriptionsApi.getPrescription(appointment.id);
            prescriptionsData.push({
              ...prescription,
              appointment_date: appointment.appointment_date,
              appointment_time: appointment.appointment_time,
              doctor_name: appointment.doctor_name,
              specialty: appointment.specialty
            });
          }
        } catch (error) {
          console.error(`Error fetching prescription for appointment ${appointment.id}:`, error);
        }
      }
      
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setIsLoadingPrescriptions(false);
    }
  };

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
    
    // Doctor and appointment details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text("Doctor Details", 20, 35);
    doc.setFont('helvetica', 'normal');
    doc.text(`Doctor: ${prescription.doctor_name}`, 20, 43);
    doc.text(`Specialty: ${prescription.specialty}`, 20, 51);
    
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
      description: "Your prescription has been downloaded.",
    });
  };

  // Filter prescriptions based on search query
  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.doctor_name?.toLowerCase().includes(prescriptionSearchQuery.toLowerCase()) ||
    prescription.specialty?.toLowerCase().includes(prescriptionSearchQuery.toLowerCase()) ||
    prescription.appointment_date?.includes(prescriptionSearchQuery)
  );

  // Fetch data on component mount
  useEffect(() => {
    fetchPatientProfile();
    fetchAppointments();
  }, [fetchAppointments]);
  
  // Fetch prescriptions when the prescriptions tab is selected
  useEffect(() => {
    if (activeTab === "prescriptions") {
      fetchPrescriptions();
    }
  }, [activeTab]);

  // Download all prescriptions as a single PDF
  const downloadAllPrescriptions = () => {
    if (prescriptions.length === 0) {
      toast({
        title: "No Prescriptions",
        description: "You don't have any prescriptions to download.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new PDF document
    const doc = new jsPDF();
    let currentPage = 1;
    let yPosition = 20;
    
    // Add patient info to first page header
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("Medical Prescriptions Summary", 105, yPosition, { align: 'center' });
    
    // Add separator line
    yPosition += 5;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 51, 102);
    doc.line(20, yPosition, 190, yPosition);
    
    // Add patient info
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient: ${localStorage.getItem('username') || 'Patient'}`, 20, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, yPosition);
    
    yPosition += 10;
    doc.text(`Total Prescriptions: ${prescriptions.length}`, 20, yPosition);
    
    yPosition += 15;
    
    // Sort prescriptions by date (newest first)
    const sortedPrescriptions = [...prescriptions].sort((a, b) => {
      return new Date(b.appointment_date) - new Date(a.appointment_date);
    });
    
    // Add each prescription
    for (let i = 0; i < sortedPrescriptions.length; i++) {
      const prescription = sortedPrescriptions[i];
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        currentPage++;
        yPosition = 20;
      }
      
      // Add prescription header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102);
      doc.text(`Prescription #${i+1}`, 20, yPosition);
      
      // Add prescription date and doctor
      yPosition += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Date: ${prescription.appointment_date}`, 20, yPosition);
      doc.text(`Doctor: ${prescription.doctor_name}`, 120, yPosition);
      
      // Add specialty
      yPosition += 8;
      doc.text(`Specialty: ${prescription.specialty}`, 20, yPosition);
      
      // Add prescription text
      yPosition += 10;
      doc.setFont('helvetica', 'bold');
      doc.text("Prescription:", 20, yPosition);
      
      // Handle long prescription text
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      const splitPrescription = doc.splitTextToSize(prescription.prescription_text, 170);
      doc.text(splitPrescription, 20, yPosition);
      
      // Update yPosition based on prescription text length
      yPosition += splitPrescription.length * 7;
      
      // Add consultation notes if available
      if (prescription.consultation_notes) {
        yPosition += 8;
        doc.setFont('helvetica', 'bold');
        doc.text("Consultation Notes:", 20, yPosition);
        
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(prescription.consultation_notes, 170);
        doc.text(splitNotes, 20, yPosition);
        
        // Update yPosition based on notes length
        yPosition += splitNotes.length * 7;
      }
      
      // Add separator line
      yPosition += 10;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(20, yPosition, 190, yPosition);
      
      yPosition += 15;
    }
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }
    
    // Save the PDF
    const fileName = `all_prescriptions_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "Prescriptions Downloaded",
      description: `All ${prescriptions.length} prescriptions have been downloaded.`,
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-muted border-r">
        <div className="p-4 flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
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
                variant={activeTab === "appointments" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("appointments")}
              >
                <Calendar className="mr-2 h-4 w-4" />
                My Appointments
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "doctors" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("doctors")}
              >
                <Stethoscope className="mr-2 h-4 w-4" />
                Find Doctors
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === "history" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("history")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Medical History
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
            <h1 className="text-xl font-bold">Welcome, {patientData.name}</h1>
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
                <Button variant="ghost" className="relative h-8 w-8 p-0 rounded-full">
                  <AnimatedAvatar 
                    name={patientData.name} 
                    size="md" 
                    className="shadow-md hover:shadow-lg transition-shadow"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{patientData.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {patientData.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
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
          {activeTab === "doctors" ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Find Doctors</CardTitle>
                  <CardDescription>Search for doctors by name or specialty</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex w-full space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="search" 
                        placeholder="Search by name, specialty or qualification..." 
                        className="pl-8" 
                        value={doctorSearchQuery}
                        onChange={(e) => setDoctorSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchDoctors()}
                      />
                    </div>
                    <Button 
                      onClick={searchDoctors}
                      disabled={isSearching}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>
                  
                  {/* Search results */}
                  <div className="grid gap-4 mt-4">
                    {isSearching ? (
                      <div className="text-center p-8">
                        <p className="text-muted-foreground">Loading doctors...</p>
                      </div>
                    ) : doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <Card key={doctor.username} className="overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={() => handleDoctorClick(doctor)}>
                          <CardContent className="p-4">
                            <div className="flex">
                              <div className="mr-4">
                                <AnimatedAvatar 
                                  name={doctor.name} 
                                  size="xl" 
                                  className="shadow-md"
                                />
                              </div>
                              <div className="space-y-1 flex-1">
                                <h3 className="font-medium">{doctor.name}</h3>
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline">{doctor.specialization}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    Experience: {doctor.experience} years
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{doctor.qualification}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : doctorSearchQuery ? (
                      <div className="text-center p-8">
                        <p className="text-muted-foreground">No doctors found matching "{doctorSearchQuery}". Try a different search term.</p>
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <p className="text-muted-foreground">No doctors available at the moment.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : activeTab === "prescriptions" ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Prescriptions</CardTitle>
                  <CardDescription>View and download your prescriptions</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input 
                      placeholder="Search prescriptions..." 
                      className="pl-10"
                      value={prescriptionSearchQuery}
                      onChange={(e) => setPrescriptionSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadAllPrescriptions}
                    disabled={prescriptions.length === 0 || isLoadingPrescriptions}
                    className="whitespace-nowrap"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download All
                  </Button>
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
                        className="hover:border-primary transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <AnimatedAvatar 
                                name={prescription.doctor_name} 
                                size="md" 
                                className="shadow-md"
                              />
                              <div className="ml-3">
                                <h3 className="font-medium">{prescription.doctor_name}</h3>
                                <p className="text-sm text-muted-foreground">{prescription.specialty}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center">
                                <Badge variant="outline">
                                  {formatDate(prescription.appointment_date)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{prescription.appointment_time}</p>
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
                          
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => downloadPrescription(prescription)}
                              className="flex items-center"
                            >
                              <Download className="mr-1 h-4 w-4" />
                              Download Prescription
                            </Button>
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
                        : "You have no prescriptions yet"}
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
                      <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                      <p className="text-3xl font-bold">{appointments.filter(a => a.status === "upcoming").length}</p>
                    </div>
                    <Calendar className="h-10 w-10 text-primary/60" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Appointments</p>
                      <p className="text-3xl font-bold">{todayAppointments.length}</p>
                    </div>
                    <Clock className="h-10 w-10 text-primary/60" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Consultations</p>
                      <p className="text-3xl font-bold">{appointments.filter(a => a.status === "completed").length}</p>
                    </div>
                    <FileText className="h-10 w-10 text-primary/60" />
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Appointments</CardTitle>
                    <CardDescription>View and manage your {appointmentStatusFilter === "all" ? "all" : appointmentStatusFilter} appointments</CardDescription>
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
                        <Card 
                          key={appointment.id} 
                          className="cursor-pointer hover:border-primary transition-colors"
                          onClick={() => handleAppointmentClick(appointment)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                <AnimatedAvatar 
                                  name={appointment.doctor_name} 
                                  size="md" 
                                  className="shadow-md"
                                />
                                <div className="ml-3">
                                  <h3 className="font-medium">{appointment.doctor_name}</h3>
                                  <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center">
                                  <Badge variant={isToday(appointment.appointment_date) ? "default" : "outline"}>
                                    {isToday(appointment.appointment_date) ? "Today" : formatDate(appointment.appointment_date)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{appointment.appointment_time}</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <h4 className="text-sm font-medium">Symptoms:</h4>
                              <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                            </div>
                            
                            <div className="mt-2 flex justify-end">
                              {appointment.is_online && appointment.status === "upcoming" ? (
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    joinVideoCall(appointment.id);
                                  }}
                                  className="flex items-center"
                                >
                                  <Video className="mr-1 h-4 w-4" />
                                  Join Video Call
                                </Button>
                              ) : appointment.is_online && appointment.status === "completed" ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled
                                  className="flex items-center opacity-70"
                                >
                                  <TicketCheck className="mr-1 h-4 w-4" />
                                  Completed
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled
                                  className="flex items-center opacity-70"
                                >
                                  <Video className="mr-1 h-4 w-4" />
                                  In-person Visit
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
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="default" 
                    onClick={() => {
                      // Navigate to doctor search page instead
                      setActiveTab("doctors");
                    }}
                  >
                    Book New Consultation
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </main>
      </div>

      {/* Doctor Details Dialog */}
      {selectedDoctor && (
        <Dialog open={isDoctorDialogOpen} onOpenChange={setIsDoctorDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Doctor Profile</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedDoctor.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex justify-center mb-2">
                <AnimatedAvatar 
                  name={selectedDoctor.name} 
                  size="2xl" 
                  className="shadow-lg"
                />
              </div>
              <h2 className="text-xl font-semibold text-center">{selectedDoctor.name}</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Specialization:</span>
                  <span className="ml-2">{selectedDoctor.specialization}</span>
                </div>
                
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Experience:</span>
                  <span className="ml-2">{selectedDoctor.experience} years</span>
                </div>
                
                <div className="flex items-center">
                  <TicketCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Qualification:</span>
                  <span className="ml-2">{selectedDoctor.qualification}</span>
                </div>
                
                {selectedDoctor.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{selectedDoctor.email}</span>
                  </div>
                )}
                
                {selectedDoctor.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{selectedDoctor.phone}</span>
                  </div>
                )}
                
                {selectedDoctor.gender && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Gender:</span>
                    <span className="ml-2">{selectedDoctor.gender}</span>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDoctorDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={bookAppointment}>
                Book Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Your appointment with {selectedAppointment.doctor_name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center mb-2">
                <AnimatedAvatar 
                  name={selectedAppointment.doctor_name} 
                  size="xl" 
                  className="shadow-lg mb-2"
                />
                <div className="mt-1 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">{formatDate(selectedAppointment.appointment_date)}</span>
                  <span className="text-muted-foreground">•</span>
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{selectedAppointment.appointment_time}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Doctor:</span>
                  <span className="ml-2">{selectedAppointment.doctor_name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Specialty:</span>
                  <span className="ml-2">{selectedAppointment.specialty}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={selectedAppointment.status === "completed" ? "outline" : "default"}>
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </Badge>
                </div>
                
                <Separator />
                
                <div>
                  <span className="font-medium">Symptoms / Reason:</span>
                  <p className="mt-1 text-sm">{selectedAppointment.symptoms}</p>
                </div>
                
                {selectedAppointment.notes && (
                  <div>
                    <span className="font-medium">Doctor's Notes:</span>
                    <p className="mt-1 text-sm">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              {selectedAppointment.status === "upcoming" && (
                <Button 
                  variant="destructive" 
                  onClick={() => cancelAppointment(selectedAppointment.id)}
                >
                  Cancel Appointment
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setIsAppointmentDialogOpen(false)}
              >
                Close
              </Button>
              
              {isToday(selectedAppointment.appointment_date) && selectedAppointment.status === "upcoming" && (
                selectedAppointment.is_online ? (
                  <Button 
                    onClick={() => {
                      setIsAppointmentDialogOpen(false);
                      joinVideoCall(selectedAppointment.id);
                    }}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Call
                  </Button>
                ) : (
                  <Button 
                    variant="outline"
                    disabled
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Waiting for Doctor
                  </Button>
                )
              )}
              
              {selectedAppointment.status === "completed" && (
                <Button
                  onClick={async () => {
                    try {
                      // Check if prescription exists
                      const exists = await prescriptionsApi.checkPrescriptionExists(selectedAppointment.id);
                      if (exists) {
                        const prescription = await prescriptionsApi.getPrescription(selectedAppointment.id);
                        const prescriptionWithDetails = {
                          ...prescription,
                          appointment_date: selectedAppointment.appointment_date,
                          appointment_time: selectedAppointment.appointment_time,
                          doctor_name: selectedAppointment.doctor_name,
                          specialty: selectedAppointment.specialty
                        };
                        downloadPrescription(prescriptionWithDetails);
                      } else {
                        toast({
                          title: "No Prescription",
                          description: "No prescription is available for this appointment.",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      console.error("Error downloading prescription:", error);
                      toast({
                        title: "Error",
                        description: "Could not download prescription.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Prescription
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PatientDashboard; 