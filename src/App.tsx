import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Qualifications from "./pages/Qualifications";
import DoctorProfile from "./pages/DoctorProfile";
import Services from "./pages/Services";
import Treatments from "./pages/Treatments";
import ServiceDetail from "./pages/ServiceDetail";
import ConditionDetail from "./pages/ConditionDetail";
import Contact from "./pages/Contact";
import BookAppointment from "./pages/BookAppointment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/qualifications" element={<Qualifications />} />
          <Route path="/about" element={<DoctorProfile />} />
          <Route path="/doctors/:doctorName" element={<DoctorProfile />} />
          <Route path="/services" element={<Services />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/conditions/:slug" element={<ConditionDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
