import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-background/5">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-secondary/5 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Healthcare Access Anytime, Anywhere
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Connect with licensed healthcare professionals through secure video consultations. Get the care you need without leaving home.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => navigate("/start-consultation")}
              >
                Start Consultation <ArrowRight className="ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg"
                onClick={() => navigate("/how-it-works")}
              >
                How It Works
              </Button>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center lg:justify-start">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span>24/7 Availability</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span>Licensed Doctors</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="relative">
              <div className="bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl p-1">
                <div className="bg-background rounded-xl overflow-hidden">
                  <img 
                    src="/images/hero-image.jpg" 
                    alt="Doctor consultation" 
                    className="w-full h-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/600x400/e2e8f0/64748b?text=Telehealth+Consultation";
                    }}
                  />
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-secondary/10 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
