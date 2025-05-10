
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import SpecialtiesSection from "@/components/SpecialtiesSection";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Testimonial = () => {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">What Our Patients Say</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The telehealth consultation was so convenient. I got the care I needed without having to leave my home. The doctor was professional and thorough."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-gray-500">Patient</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CallToAction = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 px-4 bg-primary text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Talk to a Doctor?</h2>
        <p className="text-xl mb-8 opacity-90">
          Start your telehealth consultation today and get the care you need from anywhere.
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
  );
};

const Index = () => {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <SpecialtiesSection />
        <Testimonial />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
};

export default Index;
