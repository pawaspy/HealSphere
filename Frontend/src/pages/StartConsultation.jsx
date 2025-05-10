import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const specialties = [
  "General Practice",
  "Mental Health",
  "Pediatrics",
  "Dermatology",
  "Women's Health",
  "Men's Health",
  "Nutrition",
  "Chronic Care",
  "Geriatrics"
];

const StartConsultation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const preselectedSpecialty = location.state?.specialty || "";
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    specialty: preselectedSpecialty,
    reason: "",
    symptoms: "",
    existingConditions: ""
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSpecialtyChange = (value) => {
    setFormData(prev => ({ ...prev, specialty: value }));
  };
  
  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.dateOfBirth) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };
  
  const validateStep2 = () => {
    if (!formData.specialty || !formData.reason) {
      toast({
        title: "Missing Information",
        description: "Please select a specialty and enter your reason for consultation",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };
  
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would save the form data to a database
    // and then redirect to payment page
    navigate("/payment", { state: { formData } });
  };
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Start Your Consultation
          </h1>
          <p className="text-muted-foreground">
            Fill in your details to get started with your telehealth consultation.
          </p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span>Personal Info</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span>Consultation Details</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span>Review & Payment</span>
            </div>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={(e) => e.preventDefault()}>
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="dateOfBirth" 
                          name="dateOfBirth" 
                          type="date" 
                          value={formData.dateOfBirth} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Consultation Details</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="specialty">Medical Specialty *</Label>
                      <Select 
                        value={formData.specialty} 
                        onValueChange={handleSpecialtyChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map((specialty, index) => (
                            <SelectItem key={index} value={specialty}>
                              {specialty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason for Consultation *</Label>
                      <Textarea 
                        id="reason" 
                        name="reason" 
                        value={formData.reason} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="symptoms">Current Symptoms</Label>
                      <Textarea 
                        id="symptoms" 
                        name="symptoms" 
                        value={formData.symptoms} 
                        onChange={handleChange} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="existingConditions">Existing Medical Conditions</Label>
                      <Textarea 
                        id="existingConditions" 
                        name="existingConditions" 
                        value={formData.existingConditions} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">Review & Continue to Payment</h2>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Name:</p>
                        <p>{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <p className="font-medium">Email:</p>
                        <p>{formData.email}</p>
                      </div>
                      <div>
                        <p className="font-medium">Phone:</p>
                        <p>{formData.phone}</p>
                      </div>
                      <div>
                        <p className="font-medium">Date of Birth:</p>
                        <p>{formData.dateOfBirth}</p>
                      </div>
                      <div>
                        <p className="font-medium">Specialty:</p>
                        <p>{formData.specialty}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">Reason for Consultation:</p>
                      <p>{formData.reason}</p>
                    </div>
                    
                    {formData.symptoms && (
                      <div>
                        <p className="font-medium">Symptoms:</p>
                        <p>{formData.symptoms}</p>
                      </div>
                    )}
                    
                    {formData.existingConditions && (
                      <div>
                        <p className="font-medium">Existing Medical Conditions:</p>
                        <p>{formData.existingConditions}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-md">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium">Next Available Consultation</p>
                        <p className="text-sm text-muted-foreground">
                          A healthcare provider will be available for your consultation within 15-30 minutes of payment.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium">Important Notice</p>
                        <p className="text-sm text-muted-foreground">
                          If you're experiencing a medical emergency, please call emergency services (911) immediately or go to your nearest emergency room.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                      <p className="text-sm text-muted-foreground">Consultation Fee:</p>
                      <p className="text-2xl font-bold">$49.00</p>
                    </div>
                    <Button onClick={handleSubmit} size="lg">
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}
              
              {step !== 3 && (
                <div className="mt-8 flex justify-between">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  <Button type="button" onClick={handleNext}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
};

export default StartConsultation;
