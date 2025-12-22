import { useState, useEffect } from "react";
import { Phone, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Floating CTA */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 md:hidden">
        {isExpanded && (
          <div className="animate-fade-in flex flex-col gap-2 mb-2">
            <a
              href="tel:+915551234567"
              className="bg-lung-green hover:bg-lung-green-light text-white rounded-full p-4 shadow-strong flex items-center gap-2 transition-all"
            >
              <Phone className="h-5 w-5" />
              <span className="text-sm font-semibold">Call Now</span>
            </a>
            <a
              href="https://wa.me/915551234567"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-4 shadow-strong flex items-center gap-2 transition-all"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-semibold">WhatsApp</span>
            </a>
          </div>
        )}
        
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-lung-blue hover:bg-lung-blue-dark text-white rounded-full w-14 h-14 shadow-strong flex items-center justify-center ml-auto"
        >
          {isExpanded ? <X className="h-6 w-6" /> : <Phone className="h-6 w-6 animate-pulse" />}
        </Button>
      </div>

      {/* Desktop Floating CTA */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-50 gap-3">
        <a
          href="tel:+915551234567"
          className="bg-lung-green hover:bg-lung-green-light text-white rounded-full px-6 py-4 shadow-strong flex items-center gap-2 transition-all hover:scale-105"
          aria-label="Call us now"
        >
          <Phone className="h-5 w-5" />
          <span className="font-semibold">Call Now</span>
        </a>
        <a
          href="https://wa.me/915551234567"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full px-6 py-4 shadow-strong flex items-center gap-2 transition-all hover:scale-105"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">WhatsApp</span>
        </a>
      </div>
    </>
  );
};

export default FloatingCTA;
