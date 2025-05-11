import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-background/5 dark:from-gray-900 dark:to-gray-900/90">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />
        <div className="absolute top-1/4 -left-20 w-60 h-60 rounded-full bg-secondary/5 dark:bg-secondary/10 blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight dark:text-white">
              Healthcare Access Anytime, Anywhere
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
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
                className="text-lg dark:text-white dark:border-gray-600"
                onClick={() => navigate("/how-it-works")}
              >
                How It Works
              </Button>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center lg:justify-start">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span className="dark:text-gray-300">24/7 Availability</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span className="dark:text-gray-300">Licensed Doctors</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-primary mr-2" />
                <span className="dark:text-gray-300">Secure & Private</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="relative">
              <div className="bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-2xl p-1">
                <div className="bg-background dark:bg-gray-800 rounded-xl overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" className="w-full h-auto">
                    {/* Background */}
                    <rect width="800" height="600" fill="#f8fafc" className="dark:fill-gray-800" />
                    
                    {/* Doctor's Side */}
                    <rect x="50" y="100" width="300" height="400" rx="20" fill="#e2e8f0" className="dark:fill-gray-700" />
                    <rect x="70" y="120" width="260" height="360" rx="10" fill="#ffffff" className="dark:fill-gray-600" />
                    
                    {/* Doctor Avatar */}
                    <circle cx="200" cy="220" r="80" fill="#10b981" opacity="0.2" />
                    <circle cx="200" cy="200" r="60" fill="#10b981" />
                    <path d="M200,160 C180,160 165,175 165,195 C165,215 180,230 200,230 C220,230 235,215 235,195 C235,175 220,160 200,160 Z" fill="#f8fafc" />
                    <path d="M165,270 C165,240 180,230 200,230 C220,230 235,240 235,270" stroke="#f8fafc" strokeWidth="10" fill="none" />
                    
                    {/* Doctor's Stethoscope */}
                    <path d="M240,180 C260,180 270,200 270,220 C270,240 260,250 240,250" stroke="#f8fafc" strokeWidth="4" fill="none" />
                    <circle cx="240" cy="250" r="8" fill="#f8fafc" />
                    
                    {/* Doctor's Name Tag */}
                    <rect x="150" y="290" width="100" height="30" rx="5" fill="#f1f5f9" className="dark:fill-gray-700" />
                    <text x="200" y="310" fontFamily="Arial" fontSize="14" textAnchor="middle" fill="#0f172a" className="dark:fill-white">Dr. Arun Mehta</text>
                    <text x="200" y="330" fontFamily="Arial" fontSize="12" textAnchor="middle" fill="#64748b" className="dark:fill-gray-300">Cardiologist</text>
                    
                    {/* Patient's Side */}
                    <rect x="450" y="100" width="300" height="400" rx="20" fill="#e2e8f0" className="dark:fill-gray-700" />
                    <rect x="470" y="120" width="260" height="360" rx="10" fill="#ffffff" className="dark:fill-gray-600" />
                    
                    {/* Patient Avatar */}
                    <circle cx="600" cy="220" r="80" fill="#f59e0b" opacity="0.2" />
                    <circle cx="600" cy="200" r="60" fill="#f59e0b" opacity="0.8" />
                    <path d="M600,160 C580,160 565,175 565,195 C565,215 580,230 600,230 C620,230 635,215 635,195 C635,175 620,160 600,160 Z" fill="#f8fafc" />
                    <path d="M565,270 C565,240 580,230 600,230 C620,230 635,240 635,270" stroke="#f8fafc" strokeWidth="10" fill="none" />
                    
                    {/* Patient's Name */}
                    <text x="600" y="330" fontFamily="Arial" fontSize="14" textAnchor="middle" fill="#0f172a" className="dark:fill-white">Priya Sharma</text>
                    <text x="600" y="350" fontFamily="Arial" fontSize="12" textAnchor="middle" fill="#64748b" className="dark:fill-gray-300">Patient</text>
                    
                    {/* Connection Line */}
                    <path d="M350,250 L450,250" stroke="#10b981" strokeWidth="4" strokeDasharray="10,5" />
                    <circle cx="350" cy="250" r="10" fill="#10b981" />
                    <circle cx="450" cy="250" r="10" fill="#10b981" />
                    
                    {/* Medical Icons */}
                    <circle cx="120" cy="400" r="20" fill="#10b981" opacity="0.2" />
                    <path d="M120,390 L120,410 M110,400 L130,400" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                    
                    <circle cx="200" cy="400" r="20" fill="#10b981" opacity="0.2" />
                    <path d="M190,390 L210,410 M210,390 L190,410" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                    
                    <circle cx="280" cy="400" r="20" fill="#10b981" opacity="0.2" />
                    <path d="M270,400 L290,400 M280,400 C280,390 285,380 290,380" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
                    
                    {/* Health Metrics on Patient Side */}
                    <rect x="520" y="400" width="160" height="60" rx="5" fill="#f1f5f9" className="dark:fill-gray-700" />
                    <text x="530" y="420" fontFamily="Arial" fontSize="12" fill="#64748b" className="dark:fill-gray-300">Heart Rate: 72 bpm</text>
                    <text x="530" y="440" fontFamily="Arial" fontSize="12" fill="#64748b" className="dark:fill-gray-300">Blood Pressure: 120/80</text>
                    <text x="530" y="460" fontFamily="Arial" fontSize="12" fill="#64748b" className="dark:fill-gray-300">Temperature: 37°C</text>
                    
                    {/* TeleHealth Logo */}
                    <circle cx="400" cy="80" r="30" fill="#10b981" />
                    <text x="400" y="85" fontFamily="Arial" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#ffffff">TH</text>
                    <text x="400" y="120" fontFamily="Arial" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#0f172a" className="dark:fill-white">TeleHealth</text>
                    
                    {/* Video Call Interface Elements */}
                    <rect x="350" y="500" width="100" height="30" rx="15" fill="#10b981" />
                    <text x="400" y="520" fontFamily="Arial" fontSize="12" textAnchor="middle" fill="#ffffff">CONNECTED</text>
                  </svg>
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
