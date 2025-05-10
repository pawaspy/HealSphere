
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "How much does a telehealth consultation cost?",
    answer: "Our telehealth consultations start at $49 for a standard 15-minute consultation. Specialized services may have different pricing. All prices are shown before you make a payment."
  },
  {
    question: "Are telehealth consultations covered by insurance?",
    answer: "Many insurance companies now cover telehealth consultations. We recommend checking with your insurance provider before your consultation to confirm coverage."
  },
  {
    question: "What technology do I need for a telehealth consultation?",
    answer: "You'll need a device with a camera and microphone (smartphone, tablet, or computer) and a stable internet connection. Our platform works on most modern browsers without requiring any software installation."
  },
  {
    question: "How secure is my health information?",
    answer: "We take your privacy seriously. Our platform is HIPAA-compliant and uses end-to-end encryption for all video consultations and messaging. Your health information is securely stored and only accessible to authorized healthcare providers."
  },
  {
    question: "Can doctors prescribe medication through telehealth?",
    answer: "Yes, doctors can prescribe many medications through telehealth consultations. However, there are certain medications (like controlled substances) that may require an in-person visit depending on state regulations."
  }
];

const HowItWorksPage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="hero-gradient py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold mb-6">How Our Telehealth Service Works</h1>
            <p className="text-xl text-gray-600 mb-8">
              Get the healthcare you need in four simple steps, from anywhere, at any time.
            </p>
          </div>
        </section>
        
        {/* How It Works Steps */}
        <HowItWorks />
        
        {/* Benefits Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">The Benefits of Telehealth</h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Discover why millions of patients are choosing telehealth for their healthcare needs.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "No travel or waiting room time",
                "Access care from anywhere",
                "Reduced exposure to other illnesses",
                "Easier to fit into your schedule",
                "Connect with specialists not available locally",
                "Follow-up appointments made simple",
                "Often less expensive than in-person visits",
                "Easy access to your consultation history"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-1">
                    <Check className="h-5 w-5 text-secondary" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                Find answers to common questions about our telehealth services.
              </p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-primary" />
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 bg-primary text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Experience Healthcare Reimagined</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of patients who've discovered a better way to access quality healthcare.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-white text-lg"
              onClick={() => navigate("/start-consultation")}
            >
              Start Your Consultation <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default HowItWorksPage;
