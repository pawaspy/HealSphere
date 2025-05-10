
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const specialties = [
  {
    name: "General Practice",
    description: "Routine care, preventative medicine, and non-emergency health concerns.",
    icon: "👨‍⚕️"
  },
  {
    name: "Mental Health",
    description: "Support for anxiety, depression, stress management, and other mental health concerns.",
    icon: "🧠"
  },
  {
    name: "Pediatrics",
    description: "Healthcare for children, including routine checkups and common childhood illnesses.",
    icon: "👶"
  },
  {
    name: "Dermatology",
    description: "Diagnosis and treatment for skin conditions and concerns.",
    icon: "🧴"
  },
  {
    name: "Nutrition",
    description: "Dietary advice, nutrition planning, and guidance for managing health through diet.",
    icon: "🥗"
  },
  {
    name: "Chronic Care",
    description: "Ongoing care for long-term conditions like diabetes, hypertension, and heart disease.",
    icon: "❤️"
  }
];

const SpecialtiesSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Our Medical Specialties</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Connect with specialists across a wide range of medical fields to address your specific health needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((specialty, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-md border border-gray-100 card-hover"
            >
              <div className="text-3xl mb-3">{specialty.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{specialty.name}</h3>
              <p className="text-gray-600 mb-4">{specialty.description}</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/start-consultation", { state: { specialty: specialty.name } })}
              >
                Book Consultation
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button 
            variant="link" 
            className="text-lg"
            onClick={() => navigate("/specialties")}
          >
            See all medical specialties
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesSection;
