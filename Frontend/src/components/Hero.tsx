
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="hero-gradient py-20 px-4 sm:py-32 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div 
            className={`flex-1 text-center lg:text-left space-y-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Healthcare Access <span className="text-primary">Anytime, Anywhere</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Connect with qualified healthcare professionals from the comfort of your home. 
              Secure, convenient, and personalized care when you need it most.
            </p>
            <div 
              className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <Button 
                size="lg" 
                className="text-lg group transition-all duration-300"
                onClick={() => navigate("/start-consultation")}
              >
                Start Consultation 
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg hover:bg-secondary/20 transition-all duration-300"
                onClick={() => navigate("/how-it-works")}
              >
                How It Works
              </Button>
            </div>
          </div>
          <div 
            className={`flex-1 transition-all duration-700 delay-150 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-primary/20 z-0 animate-pulse" />
              <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-secondary/20 z-0 animate-pulse" />
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80" 
                alt="Doctor with patient" 
                className="w-full rounded-xl shadow-xl relative z-10 hover:-translate-y-2 transition-all duration-300"
              />
              
              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full border-4 border-accent z-20 hidden md:block" />
              <div className="absolute -bottom-3 -left-3 w-16 h-16 rounded-full border-4 border-primary/30 z-20 hidden md:block" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
