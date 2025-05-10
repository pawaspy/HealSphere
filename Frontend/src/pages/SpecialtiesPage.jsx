import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Heart, Brain, Baby, User, UserPlus, Apple, 
  Bone, Activity, Eye, Stethoscope, Microscope, Pill
} from "lucide-react";

const specialtiesList = [
  { name: "Cardiology", icon: Heart, description: "Heart and cardiovascular health" },
  { name: "Neurology", icon: Brain, description: "Nervous system disorders" },
  { name: "Pediatrics", icon: Baby, description: "Child and adolescent health" },
  { name: "General Practice", icon: User, description: "Primary healthcare services" },
  { name: "Mental Health", icon: UserPlus, description: "Psychological wellbeing" },
  { name: "Nutrition", icon: Apple, description: "Diet and nutritional guidance" },
  { name: "Orthopedics", icon: Bone, description: "Musculoskeletal conditions" },
  { name: "Chronic Care", icon: Activity, description: "Long-term condition management" },
  { name: "Ophthalmology", icon: Eye, description: "Eye and vision care" },
  { name: "Pulmonology", icon: Stethoscope, description: "Respiratory system health" },
  { name: "Pathology", icon: Microscope, description: "Disease diagnosis" },
  { name: "Pharmacy", icon: Pill, description: "Medication management" }
];

const SpecialtiesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const filteredSpecialties = specialtiesList.filter(specialty => 
    specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    specialty.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSpecialtyClick = (specialty) => {
    navigate("/start-consultation", { state: { specialty: specialty.name } });
  };
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Our Medical Specialties</h1>
          <p className="text-muted-foreground mb-8">
            Connect with specialists across a wide range of medical fields for comprehensive care.
          </p>
          
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search specialties..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {filteredSpecialties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecialties.map((specialty, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleSpecialtyClick(specialty)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <specialty.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{specialty.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{specialty.description}</p>
                    <Button className="mt-auto">
                      Book Consultation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-lg font-medium">No specialties match your search</p>
                <p className="text-muted-foreground mb-4">Try adjusting your search query</p>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-12 bg-muted p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Not sure which specialty you need?</h2>
            <p className="mb-4">
              Start with a general consultation and our healthcare professionals will guide you to the right specialist if needed.
            </p>
            <Button onClick={() => navigate("/start-consultation")}>
              Book a General Consultation
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SpecialtiesPage;
