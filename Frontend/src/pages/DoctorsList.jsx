import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, User, Star, Calendar, Phone, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { doctorsApi } from "@/utils/api";

// Specializations for filter dropdown
const specializations = [
  "All Specialties",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Urology"
];

const DoctorsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialization, setSpecialization] = useState("All Specialties");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const doctorsPerPage = 6;

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, specialization]);

  // Filter doctors when search changes
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const results = doctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query) ||
          doctor.specialization.toLowerCase().includes(query) ||
          doctor.qualification.toLowerCase().includes(query)
      );
      setFilteredDoctors(results);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchQuery, doctors]);

  const fetchDoctors = async () => {
    setIsLoading(true);
    
    try {
      // Call the appropriate API based on whether a specialty filter is applied
      let response;
      
      if (specialization && specialization !== "All Specialties") {
        response = await doctorsApi.searchDoctorsBySpecialty(
          specialization, 
          currentPage, 
          doctorsPerPage
        );
      } else {
        response = await doctorsApi.listDoctors(
          currentPage, 
          doctorsPerPage
        );
      }
      
      // In development mode, use mock data
      if (process.env.NODE_ENV === 'development') {
        // Mock data for development
        setTimeout(() => {
          const mockDoctors = [
            {
              id: 1,
              username: "dr.sharma",
              name: "Dr. Priya Sharma",
              specialization: "Cardiology",
              qualification: "MBBS, MD (Cardiology)",
              experience: 8,
              gender: "Female",
              email: "priya.sharma@example.com",
              phone: "9876543210"
            },
            {
              id: 2,
              username: "dr.patel",
              name: "Dr. Amit Patel",
              specialization: "Neurology",
              qualification: "MBBS, DM (Neurology)",
              experience: 12,
              gender: "Male",
              email: "amit.patel@example.com",
              phone: "9876543211"
            },
            {
              id: 3,
              username: "dr.gupta",
              name: "Dr. Sunita Gupta",
              specialization: "Dermatology",
              qualification: "MBBS, MD (Dermatology)",
              experience: 6,
              gender: "Female",
              email: "sunita.gupta@example.com",
              phone: "9876543212"
            },
            {
              id: 4,
              username: "dr.reddy",
              name: "Dr. Krishna Reddy",
              specialization: "Orthopedics",
              qualification: "MBBS, MS (Orthopedics)",
              experience: 15,
              gender: "Male",
              email: "krishna.reddy@example.com",
              phone: "9876543213"
            },
            {
              id: 5,
              username: "dr.khan",
              name: "Dr. Salman Khan",
              specialization: "Psychiatry",
              qualification: "MBBS, MD (Psychiatry)",
              experience: 9,
              gender: "Male",
              email: "salman.khan@example.com",
              phone: "9876543214"
            },
            {
              id: 6,
              username: "dr.iyer",
              name: "Dr. Lakshmi Iyer",
              specialization: "Pediatrics",
              qualification: "MBBS, MD (Pediatrics)",
              experience: 7,
              gender: "Female",
              email: "lakshmi.iyer@example.com",
              phone: "9876543215"
            }
          ];
          
          // Filter by specialization if needed
          const filtered = specialization !== "All Specialties" 
            ? mockDoctors.filter(d => d.specialization === specialization)
            : mockDoctors;
            
          setDoctors(filtered);
          setFilteredDoctors(filtered);
          setTotalPages(Math.ceil(filtered.length / doctorsPerPage));
          setIsLoading(false);
        }, 1000);
      } else {
        // Use real API response
        setDoctors(response);
        setFilteredDoctors(response);
        
        // Calculate total pages - this would normally come from the API
        // but we're calculating it here for simplicity
        setTotalPages(Math.ceil(response.length / doctorsPerPage));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleSpecializationChange = (value) => {
    setSpecialization(value);
    setCurrentPage(1); // Reset to first page when filter changes
    setSearchQuery(""); // Clear search when changing specialization
  };

  const handleBookAppointment = (doctorUsername) => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment",
        variant: "default",
      });
      navigate("/login");
      return;
    }
    
    // Navigate to appointment booking page
    navigate(`/book-appointment/${doctorUsername}`);
  };

  // Get current page doctors
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">Find the Right Doctor</h1>
          <p className="text-muted-foreground">
            Search from our network of experienced healthcare professionals
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by doctor name, specialty, or qualification..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          
          <div>
            <Select value={specialization} onValueChange={handleSpecializationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Specializations</SelectLabel>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-16">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No doctors found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentDoctors.map((doctor) => (
                    <Card key={doctor.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="bg-primary/10 p-6">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16 border-2 border-background">
                              <AvatarFallback>{doctor.name.charAt(0)}{doctor.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{doctor.name}</h3>
                              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                              <div className="mt-1">
                                <Badge variant="secondary">
                                  {doctor.experience} years exp.
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <Star className="h-4 w-4 mr-2 text-amber-500" />
                              <span>{doctor.qualification}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-muted-foreground">{doctor.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-muted-foreground">{doctor.phone}</span>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <Button 
                            onClick={() => handleBookAppointment(doctor.username)}
                            className="w-full"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Appointment
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default DoctorsList; 