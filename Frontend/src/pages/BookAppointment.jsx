import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, ArrowLeft, User, Stethoscope, Star, Clock, Check, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { doctorsApi, appointmentsApi } from "@/utils/api";

// Available time slots for appointments
const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", 
  "04:00 PM", "04:30 PM", "05:00 PM"
];

const BookAppointment = () => {
  const { doctorUsername } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [doctorData, setDoctorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState(addDays(new Date(), 1));
  const [timeSlot, setTimeSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [symptomsError, setSymptomsError] = useState("");
  
  // Animation states
  const [isSuccess, setIsSuccess] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userRole = localStorage.getItem("userRole");
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    // If user is a doctor, they can't book appointments
    if (userRole === "doctor") {
      toast({
        title: "Access Denied",
        description: "Doctors cannot book appointments",
        variant: "destructive",
      });
      navigate("/doctor-dashboard");
      return;
    }
    
    // Fetch doctor data
    const fetchDoctorData = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would call an API to get doctor details by username
        // For now, we'll use the list function and filter for this doctor
        const doctors = await doctorsApi.listDoctors(1, 50);
        const doctor = doctors.find(d => d.username === doctorUsername);
        
        if (!doctor) {
          toast({
            title: "Doctor Not Found",
            description: "The doctor you are trying to book with does not exist",
            variant: "destructive",
          });
          navigate("/patient-dashboard");
          return;
        }
        
        setDoctorData(doctor);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        toast({
          title: "Error",
          description: "Failed to load doctor information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctorData();
  }, [doctorUsername, navigate, toast]);
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate date
    if (!date) {
      setDateError("Please select an appointment date");
      isValid = false;
    } else if (isBefore(date, startOfToday())) {
      setDateError("Appointment date cannot be in the past");
      isValid = false;
    } else {
      setDateError("");
    }
    
    // Validate time slot
    if (!timeSlot) {
      setTimeError("Please select an appointment time");
      isValid = false;
    } else {
      setTimeError("");
    }
    
    // Validate symptoms
    if (!symptoms.trim()) {
      setSymptomsError("Please describe your symptoms or reason for visit");
      isValid = false;
    } else if (symptoms.trim().length < 10) {
      setSymptomsError("Please provide more details about your symptoms");
      isValid = false;
    } else {
      setSymptomsError("");
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare appointment data
      const appointmentData = {
        doctor_username: doctorUsername,
        doctor_name: doctorData.name,
        appointment_date: format(date, "yyyy-MM-dd"),
        appointment_time: timeSlot,
        specialty: doctorData.specialization,
        symptoms: symptoms,
        is_online: true,
        status: "upcoming"
      };
      
      // Instead of directly creating the appointment, redirect to payment page
      // with appointment data as state
      navigate("/payment", { 
        state: { 
          appointmentData,
          bookingSource: "doctor-search",
          doctorData
        }
      });
    } catch (error) {
      console.error("Error preparing appointment:", error);
      toast({
        title: "Booking Failed",
        description: "Failed to prepare appointment details. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading doctor information...</span>
          </div>
        ) : doctorData ? (
          <>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Appointment Confirmed!</h2>
                <p className="text-muted-foreground">
                  Your appointment with {doctorData.name} has been scheduled for{" "}
                  {format(date, "MMMM d, yyyy")} at {timeSlot}.
                </p>
                <p className="mt-4 text-muted-foreground">Redirecting to dashboard...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Doctor Information Card */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Doctor Information</CardTitle>
                      <CardDescription>Booking appointment with</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center mb-4">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                      
                      <h2 className="text-xl font-bold text-center">{doctorData.name}</h2>
                      
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center">
                          <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Specialization:</span>
                          <span className="ml-2">{doctorData.specialization}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Experience:</span>
                          <span className="ml-2">{doctorData.experience} years</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Availability:</span>
                          <span className="ml-2">Mon-Fri, 9AM-5PM</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Appointment Booking Form */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Book Appointment</CardTitle>
                      <CardDescription>Schedule a consultation with {doctorData.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="date">Select Date <span className="text-red-500">*</span></Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) => isBefore(date, startOfToday())}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {dateError && <p className="text-sm text-red-500">{dateError}</p>}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="time">Select Time <span className="text-red-500">*</span></Label>
                          <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={timeSlot === time ? "default" : "outline"}
                                onClick={() => setTimeSlot(time)}
                                className={cn(
                                  "h-10",
                                  timeSlot === time ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                                )}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                          {timeError && <p className="text-sm text-red-500">{timeError}</p>}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="symptoms">
                            Symptoms / Reason for Visit <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="symptoms"
                            placeholder="Please describe your symptoms or reason for the appointment"
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            rows={4}
                          />
                          {symptomsError && <p className="text-sm text-red-500">{symptomsError}</p>}
                        </div>
                      </form>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button 
                        onClick={() => navigate(-1)} 
                        variant="outline" 
                        className="mr-2"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Booking...
                          </>
                        ) : (
                          "Book Appointment"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8">
            <h2 className="text-xl font-bold mb-2">Doctor Not Found</h2>
            <p className="text-muted-foreground">The doctor you are trying to book with does not exist or has been removed.</p>
            <Button 
              onClick={() => navigate("/patient-dashboard")}
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default BookAppointment; 