import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { data: s } = useSiteSettings();
  const brand = s?.footer_brand || "EM' COACHING";
  const copyright = s?.footer_copyright || "© 2026 EM' Coaching. Tous droits réservés.";
  const credit = s?.footer_credit || "Site créé par DRODE Tom en collaboration avec BERLIN Emma";
  return (
  <footer className="border-t border-border py-8">
    <div className="container flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
      <p className="font-display text-2xl text-gradient-blue">{brand}</p>
      <div className="flex flex-col items-center gap-2 sm:items-end">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
          <span className="text-border">|</span>
          <Link to="/cgv" className="hover:text-primary transition-colors">CGV</Link>
          <span className="text-border">|</span>
          <Link to="/confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link>
        </div>
        <p className="text-muted-foreground text-sm">{copyright}</p>
        <p className="text-muted-foreground/60 text-xs">{credit}</p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
