import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, VideoIcon, MessageSquare, Stethoscope } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Book Your Appointment",
    description: "Select your preferred specialist and choose a convenient time slot."
  },
  {
    icon: VideoIcon,
    title: "Join Video Consultation",
    description: "Connect with your healthcare provider through our secure platform."
  },
  {
    icon: MessageSquare,
    title: "Receive Treatment Plan",
    description: "Get personalized advice, prescriptions, and follow-up instructions."
  },
  {
    icon: Stethoscope,
    title: "Ongoing Care",
    description: "Access your medical records and schedule follow-up appointments as needed."
  }
];

const HowItWorks = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our telehealth platform makes it easy to receive quality healthcare from the comfort of your home.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="bg-background rounded-lg p-6 shadow-sm border relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => navigate("/start-consultation")}
          >
            Start Your Consultation <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
