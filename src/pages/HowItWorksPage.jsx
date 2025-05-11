import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  CalendarCheck, 
  VideoIcon, 
  ClipboardList, 
  MessageSquare, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowRight 
} from "lucide-react";

const steps = [
  {
    title: "Book Your Appointment",
    description: "Fill out a brief form with your medical concerns and select a convenient time slot.",
    icon: CalendarCheck,
    details: [
      "Create an account or sign in",
      "Select your medical specialty",
      "Describe your symptoms or concerns",
      "Choose an available appointment time"
    ]
  },
  {
    title: "Complete Pre-Consultation Form",
    description: "Provide your medical history and specific concerns to help your doctor prepare.",
    icon: ClipboardList,
    details: [
      "Share relevant medical history",
      "List current medications",
      "Describe symptoms in detail",
      "Upload any relevant medical documents or images"
    ]
  },
  {
    title: "Secure Payment",
    description: "Pay for your consultation using our secure payment system.",
    icon: CreditCard,
    details: [
      "Transparent pricing with no hidden fees",
      "Multiple payment options accepted",
      "Insurance information can be added if applicable",
      "Receipts provided for insurance reimbursement"
    ]
  },
  {
    title: "Join Video Consultation",
    description: "Connect with your healthcare provider through our secure video platform.",
    icon: VideoIcon,
    details: [
      "Receive email and SMS reminders",
      "One-click join from any device",
      "High-quality, secure video connection",
      "Text chat available if needed"
    ]
  },
  {
    title: "Receive Treatment Plan",
    description: "Get personalized medical advice and treatment recommendations.",
    icon: MessageSquare,
    details: [
      "Detailed diagnosis explanation",
      "Personalized treatment plan",
      "Electronic prescriptions sent to your pharmacy",
      "Follow-up instructions"
    ]
  }
];

const faqs = [
  {
    question: "How long does a typical consultation last?",
    answer: "Most consultations last between 15-30 minutes, depending on the complexity of your health concern. If additional time is needed, your healthcare provider will let you know during the session."
  },
  {
    question: "Can doctors prescribe medication through telehealth?",
    answer: "Yes, our healthcare providers can prescribe many medications through telehealth consultations. However, there are certain medications (like controlled substances) that may require an in-person visit depending on state regulations."
  },
  {
    question: "Is my personal and medical information secure?",
    answer: "Yes, we take your privacy very seriously. Our platform is HIPAA-compliant and uses end-to-end encryption for all video consultations and messaging. Your health information is securely stored and only accessible to authorized healthcare providers involved in your care."
  },
  {
    question: "What if I need to reschedule my appointment?",
    answer: "You can reschedule your appointment up to 2 hours before the scheduled time without any penalty. Simply log into your account, go to your upcoming appointments, and select the reschedule option."
  }
];

const HowItWorksPage = () => {
  const [activeTab, setActiveTab] = useState("process");
  const navigate = useNavigate();
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">How It Works</h1>
          <p className="text-muted-foreground mb-8">
            Our telehealth platform makes it easy to receive quality healthcare from the comfort of your home.
          </p>
          
          <Tabs defaultValue="process" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="process">The Process</TabsTrigger>
              <TabsTrigger value="faqs">Common Questions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="process" className="mt-6">
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <step.icon className="h-7 w-7 text-primary" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <div className="bg-muted text-foreground text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center mr-2">
                              {index + 1}
                            </div>
                            <h3 className="text-xl font-semibold">{step.title}</h3>
                          </div>
                          <p className="text-muted-foreground mb-4">{step.description}</p>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-primary mr-2 mt-1" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="flex justify-center mt-8">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/start-consultation")}
                  >
                    Start Your Consultation <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="faqs" className="mt-6">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="mt-8 bg-muted p-6 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="h-10 w-10 text-primary mr-4" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Your Privacy & Security</h3>
                      <p className="mb-4">
                        We prioritize your privacy and security. Our platform is HIPAA-compliant, using end-to-end encryption for all consultations. Your medical information is securely stored and only accessible to authorized healthcare providers.
                      </p>
                      <Button variant="outline" onClick={() => navigate("/privacy-policy")}>
                        Learn About Our Privacy Policy
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HowItWorksPage;
