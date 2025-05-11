import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConsultationSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const formData = location.state?.formData;
  
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!formData) {
    navigate("/start-consultation");
    return null;
  }
  
  const handleSubmitFeedback = () => {
    setIsSubmitting(true);
    
    // In a real application, this would send feedback to a database
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Feedback Received",
        description: "Thank you for your feedback. We appreciate your input."
      });
    }, 1000);
  };
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Consultation Summary</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for using our telehealth service. Here's a summary of your consultation.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Consultation Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg">Patient Information</h3>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p>{formData.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">Doctor Information</h3>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Doctor</p>
                        <p>Dr. Sarah Johnson</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Specialty</p>
                        <p>{formData.specialty}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">Consultation Summary</h3>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Reason for Visit</p>
                        <p>{formData.reason}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Diagnosis</p>
                        <p>Sample diagnosis based on symptoms described during consultation.</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Treatment Plan</p>
                        <p>Sample treatment plan recommendation from healthcare provider.</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Follow-up</p>
                        <p>Recommended follow-up in 2 weeks to assess progress.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Your Feedback</h2>
                <div className="mb-4">
                  <p className="mb-2">Rate your experience:</p>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-8 w-8 cursor-pointer ${
                          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="mb-2">Additional comments:</p>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your experience with our service..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitFeedback} 
                  disabled={isSubmitting || rating === 0}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Next Steps</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Prescription</h3>
                    <p className="text-sm text-muted-foreground">
                      If prescribed, medications will be sent to your preferred pharmacy.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Medical Records</h3>
                    <p className="text-sm text-muted-foreground">
                      A record of this consultation has been saved to your account.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Follow-up</h3>
                    <p className="text-sm text-muted-foreground">
                      Schedule a follow-up appointment if recommended by your doctor.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full mb-2"
                      onClick={() => navigate("/")}
                    >
                      Return to Home
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={() => navigate("/start-consultation")}
                    >
                      Book Another Consultation
                    </Button>
                  </div>
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

export default ConsultationSummary;
