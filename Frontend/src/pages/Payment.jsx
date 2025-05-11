import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
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

  // Initialize Razorpay
  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Create order and initiate payment
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      console.log("Initializing Razorpay...");
      const res = await initializeRazorpay();
      if (!res) {
        console.error("Failed to load Razorpay SDK");
        toast({ 
          title: "Error", 
          description: "Razorpay SDK failed to load" 
        });
        return;
      }
      console.log("Razorpay SDK loaded successfully");

      // Create order - Use payment server URL
      const paymentServerUrl = "https://vitareach-payment-server.onrender.com";
      
      console.log(`Using payment server at: ${paymentServerUrl}`);
      console.log("Creating order with amount:", 1);
      
      const response = await fetch(`${paymentServerUrl}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 1, // Amount in rupees (₹1)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Order creation failed:", errorData);
        throw new Error(`Failed to create order: ${errorData.error || response.statusText}`);
      }

      const order = await response.json();
      console.log("Order created successfully:", order);

      const options = {
        key: "rzp_test_Pts9yxxuweuA1u",
        amount: order.amount,
        currency: "INR",
        name: "VitaReach",
        description: "Medical Consultation Payment",
        order_id: order.id,
        prefill: {
          name: localStorage.getItem('username') || "",
          email: localStorage.getItem('email') || "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async function (response) {
          console.log("Payment successful, verifying...", response);
          // Verify payment
          const verifyResponse = await fetch(`${paymentServerUrl}/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();
          console.log("Verification response:", verifyData);

          if (verifyData.status === "success") {
            console.log("Payment verification successful");
            toast({ title: "Payment Successful" });
            
            if (appointmentData) {
              setIsBookingAppointment(true);
              try {
                const formattedData = {
                  doctor_username: appointmentData.doctor_username,
                  doctor_name: appointmentData.doctor_name,
                  appointment_date: appointmentData.appointment_date,
                  appointment_time: appointmentData.appointment_time,
                  specialty: appointmentData.specialty,
                  symptoms: appointmentData.symptoms
                };

                console.log("Creating appointment with data:", formattedData);
                const response = await appointmentsApi.createAppointment(formattedData);
                console.log("Appointment created successfully:", response);
                
                toast({ 
                  title: "Appointment Booked",
                  description: "Your appointment has been confirmed."
                });
                setIsSuccess(true);
              } catch (error) {
                console.error("Appointment booking error:", error);
                toast({ 
                  title: "Booking Failed", 
                  description: error.message || "Could not create appointment. Please try again later."
                });
                setTimeout(() => navigate("/patient-dashboard"), 2000);
              }
            } else {
              navigate("/consultation", { state: { formData } });
            }
          } else {
            console.error("Payment verification failed:", verifyData);
            toast({ 
              title: "Payment Verification Failed",
              description: verifyData.reason || "Please try again or contact support."
            });
          }
        }
      };

      console.log("Opening Razorpay payment form with options:", {...options, key: "HIDDEN"});
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({ 
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment."
      });
    } finally {
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
  
  // Payment prices
  const originalPrice = "₹1000";
  const discountedPrice = "₹1";
  
  // Main payment UI
  return (
    <div>
      <Navbar />
      <main className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment</h1>
            <p className="text-muted-foreground">Complete your payment to book the appointment</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="border-2 h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <h3 className="font-bold text-2xl text-primary">RazorPay</h3>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Secure Payment</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-center text-muted-foreground leading-relaxed">
                        India's leading payment gateway for secure transactions. 
                        Trusted by millions of users for safe and seamless payments.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>256-bit SSL Security</span>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <span>PCI DSS Compliant</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handlePayment}
                      className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 transition-colors duration-300"
                      disabled={isProcessing || isBookingAppointment}
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Processing...</span>
                        </div>
                      ) : isBookingAppointment ? (
                        <div className="flex items-center space-x-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Creating Appointment...</span>
                        </div>
                      ) : (
                        `Pay ${discountedPrice} with RazorPay`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="border-2">
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-6">Order Summary</h3>
                  
                  {appointmentData && (
                    <div className="mb-6 space-y-3">
                      <p className="mb-2"><strong>Doctor:</strong> {appointmentData.doctor_name}</p>
                      <p className="mb-2"><strong>Specialty:</strong> {appointmentData.specialty}</p>
                      <p className="mb-2"><strong>Date:</strong> {appointmentData.appointment_date}</p>
                      <p className="mb-2"><strong>Time:</strong> {appointmentData.appointment_time}</p>
                    </div>
                  )}
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Price</span>
                        <span className="line-through text-muted-foreground">{originalPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-green-600 font-medium">-₹999</span>
                      </div>
                      <div className="flex justify-between font-bold pt-3 border-t">
                        <span>Total Amount</span>
                        <span className="text-primary">{discountedPrice}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment; 