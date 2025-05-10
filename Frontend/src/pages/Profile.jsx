import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  GraduationCap, 
  Stethoscope, 
  Clock,
  Save,
  ArrowLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    // Doctor specific fields
    specialization: "",
    qualification: "",
    experience: ""
  });

  useEffect(() => {
    // Check if user is logged in
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your profile",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Get user role and data
    const role = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    setUserRole(role);

    // In a real app, you would fetch user data from the database
    // For now, we'll simulate it with mock data
    if (role === "doctor") {
      setUserData({
        username: username || "dr.sharma",
        name: "Dr. Priya Sharma",
        email: "priya.sharma@gmail.com",
        phone: "9876543210",
        gender: "Female",
        specialization: "Cardiology",
        qualification: "MBBS, MD",
        experience: "8"
      });
    } else {
      setUserData({
        username: username || "rajesh.kumar",
        name: "Rajesh Kumar",
        email: "rajesh.kumar@gmail.com",
        phone: "9876543210",
        age: "34",
        gender: "Male"
      });
    }
  }, [navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsLoading(true);
    
    // In a real app, you would save the data to the database
    // For now, we'll just simulate a successful update
    setTimeout(() => {
      setIsLoading(false);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    }, 1000);
  };

  const goBack = () => {
    if (userRole === "doctor") {
      navigate("/doctor-dashboard");
    } else {
      navigate("/patient/dashboard");
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={goBack} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">My Profile</CardTitle>
                <CardDescription>View and manage your personal information</CardDescription>
              </div>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-end">
              <Button 
                variant={isEditing ? "default" : "outline"} 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={isLoading}
              >
                {isEditing ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </>
                ) : (
                  "Edit Profile"
                )}
              </Button>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="username" 
                    name="username" 
                    value={userData.username} 
                    onChange={handleChange} 
                    disabled={!isEditing || isLoading} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    name="name" 
                    value={userData.name} 
                    onChange={handleChange} 
                    disabled={!isEditing || isLoading} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={userData.email} 
                    onChange={handleChange} 
                    disabled={!isEditing || isLoading} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={userData.phone} 
                    onChange={handleChange} 
                    disabled={!isEditing || isLoading} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="gender" 
                    name="gender" 
                    value={userData.gender} 
                    onChange={handleChange} 
                    disabled={!isEditing || isLoading} 
                  />
                </div>
              </div>
              
              {userRole === "patient" && (
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="age" 
                      name="age" 
                      type="number" 
                      value={userData.age} 
                      onChange={handleChange} 
                      disabled={!isEditing || isLoading} 
                    />
                  </div>
                </div>
              )}
              
              {userRole === "doctor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <div className="flex items-center">
                      <Stethoscope className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="specialization" 
                        name="specialization" 
                        value={userData.specialization} 
                        onChange={handleChange} 
                        disabled={!isEditing || isLoading} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <div className="flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="qualification" 
                        name="qualification" 
                        value={userData.qualification} 
                        onChange={handleChange} 
                        disabled={!isEditing || isLoading} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="experience" 
                        name="experience" 
                        type="number" 
                        value={userData.experience} 
                        onChange={handleChange} 
                        disabled={!isEditing || isLoading} 
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)} 
                className="mr-2"
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            {isEditing && (
              <Button 
                onClick={handleSave}
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </>
  );
};

export default Profile; 