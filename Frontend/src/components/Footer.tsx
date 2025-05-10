
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-bold text-lg">CareFromAnywhere</span>
            </div>
            <p className="text-gray-400 mb-4">
              Providing healthcare access anytime, anywhere through secure telehealth consultations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-400 hover:text-white transition-colors">Specialties</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/start-consultation" className="text-gray-400 hover:text-white transition-colors">Start Consultation</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Specialties</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/specialties/general-practice" className="text-gray-400 hover:text-white transition-colors">General Practice</Link>
              </li>
              <li>
                <Link to="/specialties/mental-health" className="text-gray-400 hover:text-white transition-colors">Mental Health</Link>
              </li>
              <li>
                <Link to="/specialties/pediatrics" className="text-gray-400 hover:text-white transition-colors">Pediatrics</Link>
              </li>
              <li>
                <Link to="/specialties/dermatology" className="text-gray-400 hover:text-white transition-colors">Dermatology</Link>
              </li>
              <li>
                <Link to="/specialties/more" className="text-gray-400 hover:text-white transition-colors">More Specialties</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-gray-400" />
                <span className="text-gray-400">support@carefroma.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-gray-400" />
                <span className="text-gray-400">+1 (800) 555-1234</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2 text-gray-300">Emergency?</h4>
              <p className="text-gray-400 text-sm">
                This service is not for emergencies. If you have a medical emergency, please call 911 or go to your nearest emergency room.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-sm text-gray-500">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 CareFromAnywhere. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
