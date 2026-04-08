import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const links = ["Accueil", "Services", "À propos", "Contact"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="font-display text-3xl text-gradient-blue">
          EMMA FIT
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace("à ", "")}`} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {l}
            </a>
          ))}
          <Button variant="hero" size="lg">Réserver</Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border py-4">
          <div className="container flex flex-col gap-4">
            {links.map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace("à ", "")}`} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium" onClick={() => setOpen(false)}>
                {l}
              </a>
            ))}
            <Button variant="hero" size="lg">Réserver</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
