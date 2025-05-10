
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const specialties = [
  {
    name: "General Practice",
    description: "Comprehensive care for adults, including preventative care, diagnosis and treatment of common illnesses.",
    icon: "👨‍⚕️",
    common: ["Colds & Flu", "Allergies", "Minor injuries", "Preventative care"]
  },
  {
    name: "Mental Health",
    description: "Professional support for emotional wellbeing, including therapy, counseling, and medication management.",
    icon: "🧠",
    common: ["Anxiety", "Depression", "Stress", "Insomnia"]
  },
  {
    name: "Pediatrics",
    description: "Specialized healthcare for children from birth through adolescence, focusing on development and childhood illnesses.",
    icon: "👶",
    common: ["Child development", "Vaccinations", "Common illnesses", "Behavioral issues"]
  },
  {
    name: "Dermatology",
    description: "Expert care for skin, hair, and nail conditions, including diagnosis, treatment, and preventative measures.",
    icon: "🧴",
    common: ["Acne", "Rashes", "Moles", "Eczema"]
  },
  {
    name: "Women's Health",
    description: "Specialized care addressing women's unique health concerns, including reproductive and hormonal health.",
    icon: "👩",
    common: ["Reproductive health", "Menopause", "Birth control", "Pregnancy"]
  },
  {
    name: "Men's Health",
    description: "Focused care for men's specific health concerns, including reproductive, hormonal, and aging-related issues.",
    icon: "👨",
    common: ["Prostate health", "Sexual health", "Testosterone", "Hair loss"]
  },
  {
    name: "Nutrition",
    description: "Expert guidance on diet and nutrition to improve health, manage conditions, and achieve wellness goals.",
    icon: "🥗",
    common: ["Weight management", "Dietary planning", "Food allergies", "Sports nutrition"]
  },
  {
    name: "Chronic Care",
    description: "Ongoing management of long-term health conditions with a focus on improving quality of life and preventing complications.",
    icon: "❤️",
    common: ["Diabetes", "Hypertension", "Asthma", "Heart disease"]
  },
  {
    name: "Geriatrics",
    description: "Specialized care for older adults, focusing on age-related conditions and promoting healthy aging.",
    icon: "🧓",
    common: ["Arthritis", "Memory care", "Mobility issues", "Medication management"]
  }
];

const SpecialtiesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredSpecialties = specialties.filter(specialty => 
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    specialty.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    specialty.common.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="hero-gradient py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold mb-6">Our Medical Specialties</h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with experienced healthcare professionals across a wide range of specialties.
            </p>
            <div className="relative max-w-md mx-auto">
              <Input 
                type="search" 
                placeholder="Search specialties..." 
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </section>
        
        {/* Specialties Listing */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            {filteredSpecialties.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No specialties match your search</h3>
                <p className="text-gray-600">Try different keywords or browse all specialties</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSpecialties.map((specialty, index) => (
                  <div 
                    key={index} 
                    className="bg-white p-6 rounded-lg shadow-md border border-gray-100 card-hover"
                  >
                    <div className="text-3xl mb-3">{specialty.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{specialty.name}</h3>
                    <p className="text-gray-600 mb-4">{specialty.description}</p>
                    
                    <h4 className="font-medium text-gray-700 mb-2">Common Conditions:</h4>
                    <ul className="text-gray-600 mb-6 list-disc pl-5 space-y-1">
                      {specialty.common.map((condition, i) => (
                        <li key={i}>{condition}</li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full"
                      onClick={() => navigate("/start-consultation", { state: { specialty: specialty.name } })}
                    >
                      Book Consultation <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Not Sure Which Specialty You Need?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Start with a general consultation, and our healthcare professionals will guide you to the right specialist if needed.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate("/start-consultation", { state: { specialty: "General Practice" } })}
            >
              Start General Consultation
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default SpecialtiesPage;
