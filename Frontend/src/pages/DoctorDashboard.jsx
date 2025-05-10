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
import { appointmentsApi } from "@/utils/api";
import AnimatedAvatar from "@/components/AnimatedAvatar";

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
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
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
  
  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (activeTab === "appointments" || activeTab === "dashboard") {
      setIsLoadingAppointments(true);
      try {
        // Get all appointments for the current doctor
        let response;
        if (activeTab === "dashboard") {
          response = await appointmentsApi.listTodayDoctorAppointments();
        } else {
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
          
          // Try direct fetch as fallback
          try {
            const token = localStorage.getItem('token');
            const endpoint = activeTab === "dashboard" ? 
              '/doctors/appointments/today' : '/doctors/appointments';
              
            const directResponse = await fetch(endpoint, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
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
        
        // Try with direct fetch as fallback after error
        try {
          const token = localStorage.getItem('token');
          const endpoint = activeTab === "dashboard" ? 
            '/doctors/appointments/today' : '/doctors/appointments';
            
          const directResponse = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (directResponse.ok) {
            const data = await directResponse.json();
            if (Array.isArray(data)) {
              console.log(`Loaded ${data.length} appointments via direct fetch after error`);
              setAppointments(data);
            } else {
              setAppointments([]);
            }
          } else {
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
  }, [activeTab]);

  // Refetch appointments when tab changes
  useEffect(() => {
    fetchAppointments();
  }, [activeTab, fetchAppointments]);
  
  // Filter appointments for today
  const todayAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return appointmentDate === today && appointment.status === "upcoming";
  });
  
  // Filter appointments based on search query
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => 
      (appointment.patient_name && appointment.patient_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (appointment.symptoms && appointment.symptoms.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (appointment.appointment_date && appointment.appointment_date.includes(searchQuery.toLowerCase())) ||
      (appointment.appointment_time && appointment.appointment_time.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [appointments, searchQuery]);
  
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
  
  return (
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
                    <CardDescription>You have {filteredAppointments.length} appointments today</CardDescription>
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
                        No appointments matching "{searchQuery}"
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="flex justify-center mb-3">
                        <Calendar className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">No appointments today</h3>
                      <p className="text-muted-foreground">
                        You have no appointments scheduled for today
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
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard; 