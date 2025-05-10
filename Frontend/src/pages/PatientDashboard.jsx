import { useState, useEffect, useCallback } from "react";
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
  Loader2
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
import { doctorsApi, appointmentsApi } from "@/utils/api";
import AnimatedAvatar from "@/components/AnimatedAvatar";

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
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
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

  // Fetch patient profile data
  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchPatientProfile = async () => {
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
    };
    
    fetchPatientProfile();
  }, [navigate]);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
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
    };

    fetchAppointments();
  }, [activeTab, toast]);
  
  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(appointment => 
    (appointment.doctor_name && appointment.doctor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (appointment.specialty && appointment.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (appointment.symptoms && appointment.symptoms.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (appointment.appointment_date && appointment.appointment_date.includes(searchQuery.toLowerCase())) ||
    (appointment.appointment_time && appointment.appointment_time.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Show notification for upcoming appointments
  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    const todayAppointments = appointments.filter(appointment => 
      appointment.appointment_date === new Date().toISOString().split('T')[0] && 
      appointment.status === "upcoming"
    );
    
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
        
        <div className="p-4">
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
                      <p className="text-3xl font-bold">{appointments.filter(a => isToday(a.appointment_date) && a.status === "upcoming").length}</p>
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
                    <CardDescription>View and manage your upcoming appointments</CardDescription>
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
                            
                            {isToday(appointment.appointment_date) && appointment.status === "upcoming" && (
                              <div className="mt-4 flex justify-end">
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
                              </div>
                            )}
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
                        {searchQuery ? "Try adjusting your search" : "You have no appointments scheduled"}
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
                <Button 
                  onClick={() => {
                    setIsAppointmentDialogOpen(false);
                    joinVideoCall(selectedAppointment.id);
                  }}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Join Call
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