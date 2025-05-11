import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, MessageCircle, FileText, Lock, Clock, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";

const features = [
  {
    title: "Video Consultations",
    description: "Face-to-face consultations with healthcare professionals from anywhere.",
    icon: Video
  },
  {
    title: "Secure Messaging",
    description: "Securely chat with your doctor before, during, and after consultations.",
    icon: MessageCircle
  },
  {
    title: "Consultation Transcripts",
    description: "Get transcripts of your consultation for future reference.",
    icon: FileText
  },
  {
    title: "Privacy Protected",
    description: "Your health information is encrypted and securely stored.",
    icon: Lock
  },
  {
    title: "24/7 Availability",
    description: "Access healthcare professionals around the clock.",
    icon: Clock
  },
  {
    title: "Easy Payments",
    description: "Hassle-free payment process before your consultation.",
    icon: CreditCard
  }
];

const Features = () => {
  const [visibleItems, setVisibleItems] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const section = document.getElementById('features-section');
      if (!section) return;
      
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (sectionTop < windowHeight * 0.75) {
        // Start animation when section is in view
        const timer = setInterval(() => {
          setVisibleItems(prev => {
            if (prev >= features.length) {
              clearInterval(timer);
              return prev;
            }
            return prev + 1;
          });
        }, 150);
        
        return () => clearInterval(timer);
      }
    };
    
    handleScroll(); // Check on initial render
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <section id="features-section" className="py-16 bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Our Telehealth Service?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed to make healthcare accessible, convenient, and secure for everyone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`transition-all duration-500 transform ${
                index < visibleItems ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
