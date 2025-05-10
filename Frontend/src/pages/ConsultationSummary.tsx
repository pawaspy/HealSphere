
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Download, Calendar, CheckCircle2 } from "lucide-react";

const ConsultationSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formData = location.state?.formData;
  
  // If there's no form data, redirect to home
  useEffect(() => {
    if (!formData) {
      navigate("/");
    }
  }, [formData, navigate]);
  
  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your consultation summary is being downloaded."
    });
    // In a real app, this would trigger a PDF download
  };
  
  if (!formData) return null;
  
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Consultation Complete</h1>
            <p className="text-gray-600 mt-2">
              Thank you for using our telehealth service. Here is your consultation summary.
            </p>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Consultation Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                  <p>{new Date().toLocaleString()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Healthcare Provider</h3>
                  <p>Dr. Sarah Johnson (Family Medicine Specialist)</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Patient</h3>
                  <p>{formData.firstName} {formData.lastName}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Reason for Visit</h3>
                  <p>{formData.reason}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Diagnosis</h3>
                  <p>Tension headache with potential triggers from stress and eye strain.</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Recommendations</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Over-the-counter pain reliever as needed (e.g., ibuprofen)</li>
                    <li>Regular breaks from screen time using the 20-20-20 rule</li>
                    <li>Stress management techniques and proper hydration</li>
                    <li>Follow up if symptoms persist beyond 1 week</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Prescribed Medications</h3>
                  <p>No prescription medications recommended at this time.</p>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4 mr-2" /> Download Summary
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="flex items-center"
                    onClick={() => navigate("/schedule-follow-up")}
                  >
                    <Calendar className="h-4 w-4 mr-2" /> Schedule Follow-up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6 border-primary/20">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">How was your experience?</h2>
              <p className="text-gray-600 mb-4">
                Your feedback helps us improve our telehealth services.
              </p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => toast({
                    title: "Feedback Received",
                    description: "Thank you for your feedback."
                  })}
                >
                  Rate Your Experience
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center">
            <Button 
              className="flex items-center mx-auto"
              onClick={() => navigate("/")}
            >
              Return to Home <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ConsultationSummary;
