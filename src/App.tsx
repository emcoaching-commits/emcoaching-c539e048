import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import Questionnaire from "./pages/Questionnaire.tsx";
import MonProfil from "./pages/MonProfil.tsx";
import FormuleDetail from "./pages/FormuleDetail.tsx";
import Services from "./pages/Services.tsx";
import Tarifs from "./pages/Tarifs.tsx";
import Planning from "./pages/Planning.tsx";
import Avis from "./pages/Avis.tsx";
import APropos from "./pages/APropos.tsx";
import Contact from "./pages/Contact.tsx";
import MentionsLegales from "./pages/MentionsLegales.tsx";
import CGV from "./pages/CGV.tsx";
import Confidentialite from "./pages/Confidentialite.tsx";
import NotFound from "./pages/NotFound.tsx";
import { getAppBase } from "@/lib/app-paths";
import FaviconLoader from "@/components/FaviconLoader";
import ThemeLoader from "@/components/ThemeLoader";
import ReduceMotionToggle from "@/components/ReduceMotionToggle";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const queryClient = new QueryClient();

const FloatingCallButton = () => {
  const { data: settings } = useSiteSettings();
  const tel = settings?.contact_phone_intl || "+33670619628";
  return (
    <a
      href={`tel:${tel}`}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 transition-all hover:scale-110"
      title="Appeler Emma"
      aria-label="Appeler Emma"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    </a>
  );
};

const App = () => {
  useEffect(() => {
    // Nettoie l'ancien marqueur "session_only" pour que la session persiste
    // (l'utilisateur reste connecté entre les visites par défaut).
    sessionStorage.removeItem("session_only");
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FaviconLoader />
      <ThemeLoader />
      <Toaster />
      <Sonner />
        <BrowserRouter basename={getAppBase()}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/formules/:id" element={<FormuleDetail />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/avis" element={<Avis />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/mon-profil" element={<MonProfil />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <FloatingCallButton />
      <ReduceMotionToggle />
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
