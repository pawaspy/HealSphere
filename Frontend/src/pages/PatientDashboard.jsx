import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Sun
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

// Mock data for appointments
const myAppointments = [
  {
    id: 1,
    doctorName: "Dr. Arun Mehta",
    specialty: "Cardiology",
    date: "2023-06-15", // Today's date for demo
    time: "09:30 AM",
    symptoms: "Persistent cough and fever",
    status: "upcoming",
    isToday: true,
  },
  {
    id: 2,
    doctorName: "Dr. Priya Sharma",
    specialty: "Dermatology",
    date: "2023-06-18",
    time: "11:00 AM",
    symptoms: "Skin rash and itching",
    status: "upcoming",
    isToday: false,
  },
  {
    id: 3,
    doctorName: "Dr. Vikram Singh",
    specialty: "Orthopedics",
    date: "2023-06-20",
    time: "02:15 PM",
    symptoms: "Back pain and stiffness",
    status: "upcoming",
    isToday: false,
  },
  {
    id: 4,
    doctorName: "Dr. Neha Gupta",
    specialty: "Neurology",
    date: "2023-06-10", // Past appointment
    time: "04:00 PM",
    symptoms: "Migraine and dizziness",
    status: "completed",
    isToday: false,
  }
];

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Simulated patient data - in a real app this would come from authentication
  const patientData = {
    name: localStorage.getItem("username") || "Rajesh Kumar",
    age: 34,
    email: "rajesh.kumar@gmail.com",
    phone: "9876543210",
    gender: "Male"
  };
  
  // Filter appointments based on search query
  const filteredAppointments = myAppointments.filter(appointment => 
    appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.symptoms.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Show notification for upcoming appointments
  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    const todayAppointments = myAppointments.filter(appointment => appointment.isToday);
    if (todayAppointments.length > 0) {
      setTimeout(() => {
        toast({
          title: "Upcoming Appointment Today",
          description: `${todayAppointments[0].doctorName} at ${todayAppointments[0].time}`,
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
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                  <p className="text-3xl font-bold">{myAppointments.filter(a => a.status === "upcoming").length}</p>
                </div>
                <Calendar className="h-10 w-10 text-primary/60" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Appointments</p>
                  <p className="text-3xl font-bold">{myAppointments.filter(a => a.isToday).length}</p>
                </div>
                <Clock className="h-10 w-10 text-primary/60" />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Consultations</p>
                  <p className="text-3xl font-bold">{myAppointments.filter(a => a.status === "completed").length}</p>
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
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="ml-3">
                              <h3 className="font-medium">{appointment.doctorName}</h3>
                              <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center">
                              <Badge variant={appointment.isToday ? "default" : "outline"}>
                                {appointment.isToday ? "Today" : appointment.date}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{appointment.time}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium">Symptoms:</h4>
                          <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                        </div>
                        
                        {appointment.isToday && (
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => joinVideoCall(appointment.id)}
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
                onClick={() => navigate("/start-consultation")}
              >
                Book New Consultation
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard; 