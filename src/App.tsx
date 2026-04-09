import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import Questionnaire from "./pages/Questionnaire.tsx";
import MonProfil from "./pages/MonProfil.tsx";
import Services from "./pages/Services.tsx";
import Tarifs from "./pages/Tarifs.tsx";
import Planning from "./pages/Planning.tsx";
import Avis from "./pages/Avis.tsx";
import APropos from "./pages/APropos.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/avis" element={<Avis />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/mon-profil" element={<MonProfil />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <a
        href="https://wa.me/33670619628"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110"
        title="Me contacter sur WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
