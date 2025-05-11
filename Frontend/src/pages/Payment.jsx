import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Lock, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { appointmentsApi } from "@/utils/api";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const formData = location.state?.formData;
  const appointmentData = location.state?.appointmentData;
  const doctorData = location.state?.doctorData;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentTab, setPaymentTab] = useState("card");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvc: ""
  });
  
  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!token || !isAuthenticated) {
      toast({ title: "Authentication Required" });
      navigate("/login");
    }
  }, [navigate, toast]);
  
  // Handle redirect after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate("/patient-dashboard");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);
  
  // Check if form data exists
  useEffect(() => {
    if (!formData && !appointmentData) {
      navigate("/");
    }
  }, [formData, appointmentData, navigate]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle submit for payment and appointment creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({ title: "Payment Successful" });
      
      if (appointmentData) {
        setIsBookingAppointment(true);
        
        try {
          // Debug info
          console.log("Token:", localStorage.getItem('token'));
          console.log("User role:", localStorage.getItem('userRole'));
          console.log("Username:", localStorage.getItem('username'));
          
          const formattedData = {
            doctor_username: appointmentData.doctor_username,
            doctor_name: appointmentData.doctor_name,
            appointment_date: appointmentData.appointment_date,
            appointment_time: appointmentData.appointment_time,
            specialty: appointmentData.specialty,
            symptoms: appointmentData.symptoms
          };
          
          console.log("Booking appointment with data:", formattedData);
          
          // Attempt to use appointmentsApi first
          try {
            console.log("Using appointmentsApi.createAppointment...");
            const response = await appointmentsApi.createAppointment(formattedData);
            
            console.log("Appointment created successfully:", response);
            
            toast({ 
              title: "Appointment Booked",
              description: "Your appointment has been confirmed."
            });
            setIsSuccess(true);
          } catch (apiError) {
            // If the API utility fails, try direct fetch as fallback
            console.log("API utility failed, trying direct fetch...");
            const token = localStorage.getItem('token');
            
            // Use URL formats without trailing slashes
            const urls = ['/appointments', '/api/appointments', 'https://vitareach-backend.onrender.com/appointments'];
            let success = false;
            
            for (const url of urls) {
              try {
                console.log(`Trying direct fetch to ${url}...`);
                const directResponse = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Username': localStorage.getItem('username'),
                    'X-Role': localStorage.getItem('userRole')
                  },
                  body: JSON.stringify(formattedData)
                });
                
                console.log(`Direct response from ${url}:`, directResponse.status);
                
                if (directResponse.ok) {
                  success = true;
                  toast({ 
                    title: "Appointment Booked",
                    description: "Your appointment has been confirmed (direct method)."
                  });
                  setIsSuccess(true);
                  break;
                }
              } catch (directError) {
                console.error(`Error with ${url}:`, directError);
              }
            }
            
            // If both approaches failed, show error
            if (!success) {
              // Try one last approach - using the test endpoint
              try {
                console.log("Trying test appointment endpoint as last resort...");
                const testResponse = await fetch('/appointments-test', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Username': localStorage.getItem('username'),
                    'X-Role': localStorage.getItem('userRole')
                  },
                  body: JSON.stringify(formattedData)
                });
                
                if (testResponse.ok) {
                  const testData = await testResponse.json();
                  console.log("Test appointment response:", testData);
                  
                  toast({ 
                    title: "Test Appointment Logged", 
                    description: "Your appointment was recorded in test mode."
                  });
                  setIsSuccess(true);
                  return;
                } else {
                  console.log("Test appointment failed with status:", testResponse.status);
                }
              } catch (testError) {
                console.error("Test appointment error:", testError);
              }
              
              throw apiError;
            }
          }
        } catch (error) {
          console.error("Appointment booking error:", error);
          toast({ 
            title: "Booking Failed", 
            description: error.message || "Could not create appointment. Please try again later."
          });
          setTimeout(() => navigate("/patient-dashboard"), 2000);
        }
      } else {
        // Handle consultation flow
        try {
          console.log("Navigating to consultation with form data:", formData);
          navigate("/consultation", { state: { formData } });
        } catch (error) {
          console.error("Consultation navigation error:", error);
          toast({ 
            title: "Navigation Failed", 
            description: "Could not proceed to consultation"
          });
          setIsProcessing(false);
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({ title: "Payment Failed" });
      setIsProcessing(false);
    }
  };
  
  // If no data, don't render anything
  if (!formData && !appointmentData) {
    return null;
  }
  
  // Success screen component
  if (isSuccess) {
    return (
      <div>
        <Navbar />
        <main className="container mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold">Appointment Confirmed!</h2>
          <p>Redirecting to dashboard...</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Payment price
  const price = "₹1";
  
  // Main payment UI
  return (
    <div>
      <Navbar />
      <main className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Payment</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="card" value={paymentTab} onValueChange={setPaymentTab}>
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="card">Credit/Debit Card</TabsTrigger>
                    <TabsTrigger value="upi">UPI Payment</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="card">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input 
                            id="cardNumber"
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={paymentData.cardNumber}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input 
                            id="cardName"
                            name="cardName"
                            placeholder="John Smith"
                            value={paymentData.cardName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardExpiry">Expiry Date</Label>
                            <Input 
                              id="cardExpiry"
                              name="cardExpiry"
                              placeholder="MM/YY"
                              value={paymentData.cardExpiry}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardCvc">CVV</Label>
                            <Input 
                              id="cardCvc"
                              name="cardCvc"
                              placeholder="123"
                              value={paymentData.cardCvc}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={isProcessing || isBookingAppointment}
                        >
                          {isProcessing ? "Processing..." : `Pay ${price}`}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="upi">
                    <div className="space-y-4">
                      <div className="flex justify-center py-4">
                        <div className="bg-gray-100 p-4 rounded-lg w-48 h-48 flex items-center justify-center">
                          QR Code
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input 
                          id="upiId" 
                          name="upiId"
                          value="payment@vitareach"
                          readOnly
                        />
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleSubmit} 
                        disabled={isProcessing || isBookingAppointment}
                      >
                        {isProcessing ? "Processing..." : 
                         isBookingAppointment ? "Creating Appointment..." :
                         `Pay via UPI (${price})`}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                
                {appointmentData && (
                  <div className="mb-4">
                    <p className="mb-2"><strong>Doctor:</strong> {appointmentData.doctor_name}</p>
                    <p className="mb-2"><strong>Specialty:</strong> {appointmentData.specialty}</p>
                    <p className="mb-2"><strong>Date:</strong> {appointmentData.appointment_date}</p>
                    <p className="mb-2"><strong>Time:</strong> {appointmentData.appointment_time}</p>
                  </div>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment; 