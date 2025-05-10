import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-2">
              C
            </div>
            <span className="font-bold text-lg">CareFromAnywhere</span>
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
          
          <Button 
            variant="default" 
            onClick={() => navigate("/start-consultation")}
          >
            Start Consultation
          </Button>
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
            
            <Button 
              className="w-full"
              onClick={() => {
                navigate("/start-consultation");
                setIsMenuOpen(false);
              }}
            >
              Start Consultation
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
