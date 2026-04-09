import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const links = ["Accueil", "Services", "Tarifs", "Planning", "Avis", "À propos", "Contact"];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) checkAdmin(data.session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin");
    setIsAdmin(!!(data && data.length > 0));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    setIsAdmin(false);
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
        {/* Logo placeholder */}
        <a href="#" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span className="font-display text-lg text-primary">E</span>
          </div>
          <span className="font-display text-2xl text-gradient-blue">EMMA FIT</span>
        </a>

        <div className="hidden md:flex items-center gap-5">
          {links.map((l) => (
            <a key={l} href={getHref(l)} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {l}
            </a>
          ))}
          {isAdmin && (
            <Button variant="heroOutline" size="sm" onClick={() => navigate("/admin")}>
              <Shield size={16} className="mr-1" /> Admin
            </Button>
          )}
          {user ? (
            <Button variant="heroOutline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-1" /> Déconnexion
            </Button>
          ) : (
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")} className="animate-pulse">
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
            {isAdmin && (
              <Button variant="heroOutline" size="lg" onClick={() => { navigate("/admin"); setOpen(false); }}>
                <Shield size={16} className="mr-1" /> Admin
              </Button>
            )}
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
