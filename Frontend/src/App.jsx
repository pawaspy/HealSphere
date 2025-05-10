import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";
import SpecialtiesPage from "./pages/SpecialtiesPage.jsx";
import FaqPage from "./pages/FaqPage.jsx";
import StartConsultation from "./pages/StartConsultation.jsx";
import Payment from "./pages/Payment.jsx";
import Consultation from "./pages/Consultation.jsx";
import ConsultationSummary from "./pages/ConsultationSummary.jsx";
import NotFound from "./pages/NotFound.jsx";
import Chatbot from "./components/Chatbot.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import VideoCall from "./pages/VideoCall.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import Profile from "./pages/Profile.jsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/specialties" element={<SpecialtiesPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/start-consultation" element={<StartConsultation />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/consultation-summary" element={<ConsultationSummary />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/video-call/:appointmentId" element={<VideoCall />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Chatbot />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
