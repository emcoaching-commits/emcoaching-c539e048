import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const links = ["Accueil", "Services", "Tarifs", "Planning", "Avis", "À propos", "Contact"];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
  };

  const getHref = (l: string) => {
    const map: Record<string, string> = {
      "Accueil": "#accueil",
      "Services": "#services",
      "Tarifs": "#tarifs",
      "Planning": "#planning",
      "Avis": "#avis",
      "À propos": "#propos",
      "Contact": "#contact",
    };
    return map[l] || "#";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="font-display text-3xl text-gradient-blue">EMMA FIT</a>

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l} href={getHref(l)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {l}
            </a>
          ))}
          {user ? (
            <Button variant="heroOutline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-1" /> Déconnexion
            </Button>
          ) : (
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              <LogIn size={16} className="mr-1" /> Connexion
            </Button>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border py-4">
          <div className="container flex flex-col gap-4">
            {links.map((l) => (
              <a key={l} href={getHref(l)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium" onClick={() => setOpen(false)}>
                {l}
              </a>
            ))}
            {user ? (
              <Button variant="heroOutline" size="lg" onClick={() => { handleLogout(); setOpen(false); }}>
                <LogOut size={16} className="mr-1" /> Déconnexion
              </Button>
            ) : (
              <Button variant="hero" size="lg" onClick={() => { navigate("/auth"); setOpen(false); }}>
                <LogIn size={16} className="mr-1" /> Connexion
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
