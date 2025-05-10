import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Moon, Sun, LogOut, UserCircle } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AnimatedAvatar from "@/components/AnimatedAvatar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'patient' or 'doctor'
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;
  
  // Check if user is logged in (in a real app, this would use authentication)
  useEffect(() => {
    // Simulate checking auth status
    const checkAuth = () => {
      // Check localStorage for authentication state
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      const role = localStorage.getItem("userRole");
      const username = localStorage.getItem("username");
      
      if (isAuthenticated) {
        setIsLoggedIn(true);
        setUserRole(role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };
    
    checkAuth();
  }, [location.pathname]);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real app, you'd update the class on the document element
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };
  
  const handleLogout = () => {
    // Clear authentication state from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };
  
  const getDashboardLink = () => {
    if (userRole === 'doctor') {
      return "/doctor-dashboard";
    } else if (userRole === 'patient') {
      return "/patient-dashboard";
    }
    return "/";
  };
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/telehealth-logo.svg" 
              alt="TeleHealth Logo" 
              className="h-8 w-8 mr-2"
            />
            <span className="font-bold text-lg">TeleHealth</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-foreground/60"
            }`}
          >
            Home
          </Link>
          <Link 
            to="/how-it-works" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/how-it-works") ? "text-primary" : "text-foreground/60"
            }`}
          >
            How It Works
          </Link>
          <Link 
            to="/specialties" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/specialties") ? "text-primary" : "text-foreground/60"
            }`}
          >
            Specialties
          </Link>
          <Link 
            to="/faq" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/faq") ? "text-primary" : "text-foreground/60"
            }`}
          >
            FAQ
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              {userRole !== 'doctor' && (
                <Button 
                  variant="default" 
                  onClick={() => navigate("/start-consultation")}
                >
                  Start Consultation
                </Button>
              )}
              
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-0 h-10 w-10 rounded-full">
                    <AnimatedAvatar 
                      name={localStorage.getItem("username")} 
                      size="md" 
                      className="shadow-md hover:shadow-lg transition-shadow"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userRole === 'doctor' ? 'Doctor' : 'Patient'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              
              <Button 
                variant="default" 
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </div>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`py-2 text-base font-medium ${isActive("/") ? "text-primary" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/how-it-works" 
              className={`py-2 text-base font-medium ${isActive("/how-it-works") ? "text-primary" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              to="/specialties" 
              className={`py-2 text-base font-medium ${isActive("/specialties") ? "text-primary" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Specialties
            </Link>
            <Link 
              to="/faq" 
              className={`py-2 text-base font-medium ${isActive("/faq") ? "text-primary" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              {isLoggedIn ? (
                <div className="flex space-x-2">
                  <div className="flex items-center mr-2">
                    <AnimatedAvatar 
                      name={localStorage.getItem("username")} 
                      size="sm" 
                      className="shadow-md"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigate(getDashboardLink());
                      setIsMenuOpen(false);
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      navigate("/signup");
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
            
            {/* Only show Start Consultation button if not a doctor */}
            {(!isLoggedIn || userRole !== 'doctor') && (
              <Button 
                className="w-full mt-2"
                onClick={() => {
                  navigate("/start-consultation");
                  setIsMenuOpen(false);
                }}
              >
                Start Consultation
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
