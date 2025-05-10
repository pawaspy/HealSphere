import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mr-2">
                C
              </div>
              <h3 className="text-lg font-bold">CareFromAnywhere</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Providing healthcare access anytime, anywhere through secure telehealth consultations.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="text-gray-500 hover:text-primary transition-colors">
                <Facebook size={20} />
              </Link>
              <Link to="#" className="text-gray-500 hover:text-primary transition-colors">
                <Twitter size={20} />
              </Link>
              <Link to="#" className="text-gray-500 hover:text-primary transition-colors">
                <Instagram size={20} />
              </Link>
              <Link to="#" className="text-gray-500 hover:text-primary transition-colors">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 hover:text-primary transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 hover:text-primary transition-colors">Specialties</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/start-consultation" className="text-gray-600 hover:text-primary transition-colors">Start Consultation</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Specialties</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/specialties" className="text-gray-600 hover:text-primary transition-colors">General Practice</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 hover:text-primary transition-colors">Mental Health</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 hover:text-primary transition-colors">Pediatrics</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 hover:text-primary transition-colors">Dermatology</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 hover:text-primary transition-colors">More Specialties</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail size={18} className="text-primary mr-2" />
                <span className="text-gray-600">support@carefroma.com</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-primary mr-2" />
                <span className="text-gray-600">+1 (800) 555-1234</span>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-md">
              <h4 className="font-bold text-red-600 mb-1">Emergency?</h4>
              <p className="text-sm text-red-600">
                This service is not for emergencies. If you have a medical emergency, please call 911 or go to your nearest emergency room.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2025 CareFromAnywhere. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="#" className="text-gray-500 hover:text-primary text-sm">Privacy Policy</Link>
            <Link to="#" className="text-gray-500 hover:text-primary text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
