import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AppointmentBooking from "@/components/AppointmentBooking";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-32">
      <Hero />
      <AppointmentBooking />
      <Services />
        <Contact />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
