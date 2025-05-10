import Hero from "@/components/Hero";
import Features from "@/components/Features";
import SpecialtiesSection from "@/components/SpecialtiesSection";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Patient",
    stars: 5,
    text: "The telehealth consultation was incredibly convenient. I got the care I needed without leaving home. The doctor was very professional and thorough."
  },
  {
    name: "Priya Patel",
    role: "Patient",
    stars: 4,
    text: "I was skeptical at first, but the video consultation was clear and the doctor addressed all my concerns. Saved me hours of travel and waiting time."
  },
  {
    name: "Amit Singh",
    role: "Patient",
    stars: 5,
    text: "The platform is user-friendly and the consultation was very helpful. The doctor prescribed medications that were delivered to my doorstep the same day."
  }
];

const Testimonial = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
          What Our Patients Say
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="flex mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star 
                    key={j} 
                    className={`h-5 w-5 ${j < testimonial.stars 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"}`} 
                  />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-medium">{testimonial.name.charAt(0)}</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
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
          Start your TeleHealth consultation today and get the care you need from anywhere.
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
