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
  ArrowLeft,
  Trash2,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authApi } from "@/utils/api";
import AnimatedAvatar from "@/components/AnimatedAvatar";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
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

    // Check if delete dialog should be shown (from URL query param)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('showDeleteDialog') === 'true') {
      setIsDeleteDialogOpen(true);
    }

    // Fetch user profile data from API
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const profileFunction = role === "doctor" 
          ? authApi.getDoctorProfile 
          : authApi.getPatientProfile;
        
        const userData = await profileFunction();
        setUserData(userData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Profile Error",
          description: "Failed to load your profile information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Always fetch the profile data from the API
    fetchUserProfile();
  }, [navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Call the appropriate API based on user role
      const updateFunction = userRole === "doctor" 
        ? authApi.updateDoctorProfile 
        : authApi.updatePatientProfile;
      
      // Prepare the data based on role
      let data = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        gender: userData.gender,
      };
      
      // Add role-specific fields
      if (userRole === "doctor") {
        data = {
          ...data,
          specialization: userData.specialization,
          qualification: userData.qualification,
          experience: parseInt(userData.experience)
        };
      } else {
        data = {
          ...data,
          age: parseInt(userData.age)
        };
      }
      
      // Make the API call to update profile
      const response = await updateFunction(data);
      
      // Update local state with the response data
      setUserData(response);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (userRole === "doctor") {
      navigate("/doctor-dashboard");
    } else {
      navigate("/patient/dashboard");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    
    try {
      // Call the appropriate API based on user role
      const deleteFunction = userRole === "doctor" 
        ? authApi.deleteDoctorAccount 
        : authApi.deletePatientAccount;
      
      // Make the API call to delete account
      await deleteFunction();
      
      // Clear user data from localStorage
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userRole");
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setIsDeletingAccount(false);
      
      toast({
        title: "Error",
        description: "Failed to delete your account. Please try again later.",
        variant: "destructive",
      });
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
              <div className="w-20 h-20 flex items-center justify-center">
                <AnimatedAvatar 
                  name={userData.name || localStorage.getItem("username")} 
                  size="2xl" 
                  className="shadow-lg"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
              
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
        
        {/* Delete Account Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-destructive">
                <AlertCircle className="mr-2 h-5 w-5" />
                Delete Account
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your account? This action cannot be undone
                and all your data will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeletingAccount}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </>
  );
};

export default Profile; 