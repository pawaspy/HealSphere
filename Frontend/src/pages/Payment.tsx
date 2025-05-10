
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formData = location.state?.formData;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentTab, setPaymentTab] = useState("card");
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvc: ""
  });
  
  if (!formData) {
    navigate("/start-consultation");
    return null;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // In a real application, this would submit payment to a payment processor
    setTimeout(() => {
      setIsProcessing(false);
      // Simulating a successful payment
      toast({
        title: "Payment Successful",
        description: "Your consultation is being prepared. You will be redirected to the consultation room."
      });
      
      // Redirect to consultation room after a brief delay
      setTimeout(() => {
        navigate("/consultation", { state: { formData } });
      }, 1500);
    }, 2000);
  };
  
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment</h1>
            <p className="text-gray-600">
              Complete your payment to start your telehealth consultation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <Tabs 
                    value={paymentTab} 
                    onValueChange={setPaymentTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="card">Credit Card</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="card">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <div className="relative">
                            <Input 
                              id="cardNumber"
                              name="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={paymentData.cardNumber}
                              onChange={handleChange}
                              required
                            />
                            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="cardName">Name on Card</Label>
                          <Input 
                            id="cardName"
                            name="cardName"
                            placeholder="John Doe"
                            value={paymentData.cardName}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardExpiry">Expiry Date (MM/YY)</Label>
                            <Input 
                              id="cardExpiry"
                              name="cardExpiry"
                              placeholder="MM/YY"
                              value={paymentData.cardExpiry}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardCvc">CVC</Label>
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
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-4">
                          <Lock className="h-4 w-4" />
                          <span>Your payment information is encrypted and secure.</span>
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => navigate("/start-consultation", { state: { formData } })}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                          </Button>
                          <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? "Processing..." : "Pay $49.00"}
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="paypal">
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" 
                            alt="PayPal" 
                            className="h-10 mx-auto"
                          />
                        </div>
                        <p className="text-gray-600 mb-6">
                          Click the button below to pay securely with PayPal.
                        </p>
                        <Button className="w-full" onClick={handleSubmit} disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Pay with PayPal"}
                        </Button>
                        
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mt-4">
                          <Lock className="h-4 w-4" />
                          <span>You'll be redirected to PayPal to complete your payment.</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            {/* Order Summary */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Consultation Type</span>
                      <span>{formData.specialty}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Patient Name</span>
                      <span>{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span>$49.00</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>$49.00</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    By proceeding with payment, you agree to our 
                    <a href="/terms" className="text-primary"> Terms of Service</a> and 
                    <a href="/privacy" className="text-primary"> Privacy Policy</a>.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Payment;
