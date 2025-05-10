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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Payment
          </h1>
          <p className="text-muted-foreground">
            Complete your payment to start your telehealth consultation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="card" value={paymentTab} onValueChange={setPaymentTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="card">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit Card
                    </TabsTrigger>
                    <TabsTrigger value="paypal">
                      PayPal
                    </TabsTrigger>
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
                          <div>
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
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Lock className="h-4 w-4 mr-2" />
                          Your payment information is encrypted and secure.
                        </div>
                        
                        <div className="flex justify-between mt-6">
                          <Button variant="outline" type="button" onClick={() => navigate("/start-consultation", { state: { formData } })}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                          </Button>
                          <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? "Processing..." : "Pay $49.00"}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="paypal">
                    <div className="space-y-6">
                      <div className="flex justify-center py-8">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-xl">P</span>
                        </div>
                      </div>
                      
                      <p className="text-center">
                        Click the button below to pay securely with PayPal.
                      </p>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleSubmit} 
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Pay with PayPal"}
                      </Button>
                      
                      <div className="text-sm text-center text-muted-foreground mt-4">
                        <Lock className="h-4 w-4 inline mr-1" />
                        You'll be redirected to PayPal to complete your payment.
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Consultation Type</span>
                    <span>{formData.specialty}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Patient Name</span>
                    <span>{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Consultation Fee</span>
                    <span>$49.00</span>
                  </div>
                </div>
                
                <div className="flex justify-between font-bold mb-6">
                  <span>Total</span>
                  <span>$49.00</span>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  By proceeding with payment, you agree to our 
                  <a href="#" className="text-primary hover:underline"> Terms of Service</a> and 
                  <a href="#" className="text-primary hover:underline"> Privacy Policy</a>.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Payment;
