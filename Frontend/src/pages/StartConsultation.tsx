
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSpecialtyChange = (value: string) => {
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would save the form data to a database
    // and then redirect to payment page
    navigate("/payment", { state: { formData } });
  };
  
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Start Your Consultation</h1>
            <p className="text-gray-600">
              Fill in your details to get started with your telehealth consultation.
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm mt-1">Personal Info</span>
              </div>
              <div className={`h-1 flex-grow mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm mt-1">Consultation Details</span>
              </div>
              <div className={`h-1 flex-grow mx-4 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="text-sm mt-1">Review & Payment</span>
              </div>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <div className="relative">
                          <Input 
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            required
                          />
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Consultation Details</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
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
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Consultation *</Label>
                        <Textarea 
                          id="reason"
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          placeholder="Briefly describe the reason for your consultation"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="symptoms">Current Symptoms</Label>
                        <Textarea 
                          id="symptoms"
                          name="symptoms"
                          value={formData.symptoms}
                          onChange={handleChange}
                          placeholder="Describe any symptoms you're experiencing"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="existingConditions">Existing Medical Conditions</Label>
                        <Textarea 
                          id="existingConditions"
                          name="existingConditions"
                          value={formData.existingConditions}
                          onChange={handleChange}
                          placeholder="List any existing medical conditions or medications"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Review & Continue to Payment</h2>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-y-2">
                        <div className="font-medium">Name:</div>
                        <div>{formData.firstName} {formData.lastName}</div>
                        
                        <div className="font-medium">Email:</div>
                        <div>{formData.email}</div>
                        
                        <div className="font-medium">Phone:</div>
                        <div>{formData.phone}</div>
                        
                        <div className="font-medium">Date of Birth:</div>
                        <div>{formData.dateOfBirth}</div>
                        
                        <div className="font-medium">Specialty:</div>
                        <div>{formData.specialty}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-1">Reason for Consultation:</div>
                        <div className="text-gray-700">{formData.reason}</div>
                      </div>
                      
                      {formData.symptoms && (
                        <div>
                          <div className="font-medium mb-1">Symptoms:</div>
                          <div className="text-gray-700">{formData.symptoms}</div>
                        </div>
                      )}
                      
                      {formData.existingConditions && (
                        <div>
                          <div className="font-medium mb-1">Existing Medical Conditions:</div>
                          <div className="text-gray-700">{formData.existingConditions}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
                      <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-700">Next Available Consultation</p>
                        <p className="text-blue-600">
                          A healthcare provider will be available for your consultation within 15-30 minutes of payment.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-700">Important Notice</p>
                        <p className="text-amber-600">
                          If you're experiencing a medical emergency, please call emergency services (911) immediately or go to your nearest emergency room.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between font-medium text-lg mb-2">
                        <span>Consultation Fee:</span>
                        <span>$49.00</span>
                      </div>
                      <Button className="w-full" type="submit">
                        Continue to Payment
                      </Button>
                    </div>
                  </div>
                )}
                
                {step !== 3 && (
                  <div className="flex justify-between mt-6">
                    {step > 1 ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleBack}
                      >
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
        </div>
      </main>
      <Footer />
    </>
  );
};

export default StartConsultation;
