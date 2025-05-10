import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Mail, Phone, CalendarDays, UserRound, GraduationCap, Stethoscope, Clock, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    age: "",
    gender: "",
    specialization: "",
    qualification: "",
    experience: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate phone to only accept numbers
    if (name === "phone" && !/^\d*$/.test(value)) {
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    
    // Common validations for both patient and doctor
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }
    
    // Patient-specific validations
    if (role === "patient") {
      if (!formData.age) {
        newErrors.age = "Age is required";
      } else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
        newErrors.age = "Please enter a valid age between 1 and 120";
      }
    }
    
    // Doctor-specific validations
    if (role === "doctor") {
      if (!formData.specialization) {
        newErrors.specialization = "Specialization is required";
      }
      
      if (!formData.qualification.trim()) {
        newErrors.qualification = "Qualification is required";
      }
      
      if (!formData.experience) {
        newErrors.experience = "Years of experience is required";
      } else if (parseInt(formData.experience) < 0 || parseInt(formData.experience) > 70) {
        newErrors.experience = "Please enter a valid experience between 0 and 70 years";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSignup = (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Form Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Here you would typically make an API call to register the user
    // For now, we'll simulate a successful registration after a delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Store authentication state in localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", role);
      localStorage.setItem("username", formData.username);
      
      // Successful registration simulation
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!",
      });
      
      // Navigate to appropriate dashboard based on role
      if (role === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    }, 1500);
  };
  
  const specializations = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "General Practice",
    "Mental Health",
    "Nutrition",
    "Orthopedics",
    "Chronic Care",
    "Ophthalmology",
    "Pulmonology",
    "Pathology",
    "Pharmacy",
    "Dermatology",
    "ENT",
    "Gynecology"
  ];
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mb-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Join TeleHealth</h1>
            <p className="text-muted-foreground mt-2">Create your account to get started</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Sign Up</CardTitle>
              <CardDescription className="text-center">Please fill in your details to create an account</CardDescription>
            </CardHeader>
            
            <Tabs defaultValue="patient" value={role} onValueChange={(value) => {
              // Reset role-specific fields when switching roles
              if (value === "patient") {
                setFormData(prev => ({
                  ...prev,
                  age: "",
                  // Clear doctor-specific fields
                  specialization: "",
                  qualification: "",
                  experience: ""
                }));
              } else {
                setFormData(prev => ({
                  ...prev,
                  // Clear patient-specific fields
                  age: ""
                }));
              }
              // Set the new role
              setRole(value);
              // Clear any validation errors
              setErrors({});
            }} className="w-full">
              <TabsList className="grid grid-cols-2 w-[80%] mx-auto mb-4">
                <TabsTrigger value="patient">Patient</TabsTrigger>
                <TabsTrigger value="doctor">Doctor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="patient">
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                            required
                          />
                        </div>
                        {errors.username && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.username}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                        <div className="relative">
                          <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Rajesh Kumar"
                            value={formData.name}
                            onChange={handleChange}
                            className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                            required
                          />
                        </div>
                        {errors.name && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="example@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                            required
                          />
                        </div>
                        {errors.email && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className={`pl-3 pr-10 ${errors.password ? "border-red-500" : ""}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.password}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`pl-3 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                            required
                          />
                        </div>
                        {errors.phone && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.phone}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="age" className="text-sm font-medium">Age</label>
                        <div className="relative">
                          <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="age"
                            name="age"
                            type="number"
                            placeholder="25"
                            value={formData.age}
                            onChange={handleChange}
                            className={`pl-10 ${errors.age ? "border-red-500" : ""}`}
                            min="1"
                            max="120"
                            required
                          />
                        </div>
                        {errors.age && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.age}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => handleSelectChange("gender", value)}
                        >
                          <SelectTrigger id="gender" className={errors.gender ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.gender}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="doctor">
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">Username</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                            required
                          />
                        </div>
                        {errors.username && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.username}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                        <div className="relative">
                          <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Dr. Priya Sharma"
                            value={formData.name}
                            onChange={handleChange}
                            className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                            required
                          />
                        </div>
                        {errors.name && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="doctor@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                            required
                          />
                        </div>
                        {errors.email && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.email}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className={`pl-3 pr-10 ${errors.password ? "border-red-500" : ""}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.password}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`pl-3 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                            required
                          />
                        </div>
                        {errors.phone && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.phone}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="specialization" className="text-sm font-medium">Specialization</label>
                        <div className="relative">
                          <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Select
                            value={formData.specialization}
                            onValueChange={(value) => handleSelectChange("specialization", value)}
                          >
                            <SelectTrigger id="specialization" className={`pl-10 ${errors.specialization ? "border-red-500" : ""}`}>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                            <SelectContent>
                              {specializations.map((spec) => (
                                <SelectItem key={spec} value={spec.toLowerCase()}>
                                  {spec}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {errors.specialization && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.specialization}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="qualification" className="text-sm font-medium">Qualification</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="qualification"
                            name="qualification"
                            type="text"
                            placeholder="MBBS, MD, MS"
                            value={formData.qualification}
                            onChange={handleChange}
                            className={`pl-10 ${errors.qualification ? "border-red-500" : ""}`}
                            required
                          />
                        </div>
                        {errors.qualification && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.qualification}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="experience" className="text-sm font-medium">Years of Experience</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="experience"
                            name="experience"
                            type="number"
                            placeholder="5"
                            value={formData.experience}
                            onChange={handleChange}
                            className={`pl-10 ${errors.experience ? "border-red-500" : ""}`}
                            min="0"
                            max="70"
                            required
                          />
                        </div>
                        {errors.experience && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.experience}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => handleSelectChange("gender", value)}
                        >
                          <SelectTrigger id="gender" className={errors.gender ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && (
                          <div className="text-red-500 text-xs flex items-center mt-1">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {errors.gender}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
            
            <CardFooter className="flex flex-col space-y-4 pt-0">
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Signup; 