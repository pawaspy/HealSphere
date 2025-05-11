import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img 
                src="/telehealth-logo.svg" 
                alt="TeleHealth Logo" 
                className="h-8 w-8 mr-2"
              />
              <h3 className="text-lg font-bold dark:text-white">TeleHealth</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Providing healthcare access anytime, anywhere through secure telehealth consultations.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                <Facebook size={20} />
              </Link>
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </Link>
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                <Instagram size={20} />
              </Link>
              <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">How It Works</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Specialties</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">FAQ</Link>
              </li>
              <li>
                <Link to="/start-consultation" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Start Consultation</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 dark:text-white">Specialties</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/specialties" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">General Practice</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Mental Health</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Pediatrics</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Dermatology</Link>
              </li>
              <li>
                <Link to="/specialties" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">More Specialties</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4 dark:text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail size={18} className="text-primary mr-2" />
                <span className="text-gray-600 dark:text-gray-300">support@telehealth.in</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-primary mr-2" />
                <span className="text-gray-600 dark:text-gray-300">+91 (800) 555-1234</span>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-md">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-1">Emergency?</h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                This service is not for emergencies. If you have a medical emergency, please call 108 or go to your nearest emergency room.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t dark:border-gray-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 TeleHealth. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm">Privacy Policy</Link>
            <Link to="#" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
