import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, Baby, User, UserPlus, Apple, Bone, Activity } from "lucide-react";

const specialties = [
  { name: "Cardiology", icon: Heart, description: "Heart and cardiovascular health" },
  { name: "Neurology", icon: Brain, description: "Nervous system disorders" },
  { name: "Pediatrics", icon: Baby, description: "Child and adolescent health" },
  { name: "General Practice", icon: User, description: "Primary healthcare services" },
  { name: "Mental Health", icon: UserPlus, description: "Psychological wellbeing" },
  { name: "Nutrition", icon: Apple, description: "Diet and nutritional guidance" },
  { name: "Orthopedics", icon: Bone, description: "Musculoskeletal conditions" },
  { name: "Chronic Care", icon: Activity, description: "Long-term condition management" },
];

const SpecialtiesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  
  const handleSpecialtyClick = (specialty) => {
    navigate("/start-consultation", { state: { specialty: specialty.name } });
  };
  
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Our Medical Specialties
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with specialists across a wide range of medical fields for comprehensive care.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialties.map((specialty, index) => (
            <Card 
              key={index}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleSpecialtyClick(specialty)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  hoveredIndex === index ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <specialty.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{specialty.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{specialty.description}</p>
                <Button 
                  variant={hoveredIndex === index ? "default" : "outline"} 
                  size="sm"
                  className="mt-auto"
                >
                  Book Consultation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/specialties")}
          >
            View All Specialties
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesSection;
