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
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Patients Say
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The telehealth consultation was incredibly convenient. I got the care I needed without leaving home."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20" />
                <div className="ml-3">
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
    <section className="bg-primary text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Talk to a Doctor?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Start your telehealth consultation today and get the care you need from anywhere.
        </p>
        <Button 
          size="lg" 
          variant="secondary" 
          className="text-primary font-bold"
          onClick={() => navigate("/start-consultation")}
        >
          Start Your Consultation <ArrowRight className="ml-2" />
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
        <SpecialtiesSection />
        <HowItWorks />
        <Testimonial />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
};

export default Index;
