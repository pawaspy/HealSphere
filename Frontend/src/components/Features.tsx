
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
        // Start showing items one by one with a delay
        const timer = setInterval(() => {
          setVisibleItems(prev => {
            if (prev < features.length) {
              return prev + 1;
            } else {
              clearInterval(timer);
              return prev;
            }
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
    <section id="features-section" className="py-16 px-4 bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 left-20 w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-12 transition-all duration-700">
          <h2 className="text-3xl font-bold">Why Choose Our Telehealth Service?</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Our platform is designed to make healthcare accessible, convenient, and secure for everyone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`card-hover border-none shadow-lg transition-all duration-500 ${
                index < visibleItems 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <CardHeader>
                <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
