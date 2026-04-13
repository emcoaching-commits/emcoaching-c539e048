import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, Shield, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navLinks = [
  { label: "Accueil", to: "/" },
  { label: "Qui je suis", to: "/a-propos" },
  { label: "Services", to: "/services" },
  { label: "Tarifs", to: "/tarifs" },
  { label: "Planning", to: "/planning" },
  { label: "Avis", to: "/avis" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (to: string) => location.pathname === to;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span className="font-display text-lg text-primary">E</span>
          </div>
          <span className="font-display text-2xl text-gradient-blue">EM' COACHING</span>
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={`text-sm font-medium transition-colors ${
                isActive(l.to) ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Button variant="heroOutline" size="sm" onClick={() => navigate("/admin")}>
              <Shield size={16} className="mr-1" /> Admin
            </Button>
          )}
          {user ? (
            <>
              <Button variant="heroOutline" size="sm" onClick={() => navigate("/mon-profil")}>
                <User size={16} className="mr-1" /> Mon Profil
              </Button>
              <Button variant="heroOutline" size="sm" onClick={handleLogout}>
                <LogOut size={16} className="mr-1" /> Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button variant="heroOutline" size="sm" onClick={() => navigate("/auth")}>
                <LogIn size={16} className="mr-1" /> Connexion
              </Button>
              <Button variant="hero" size="lg" onClick={() => navigate("/auth")} className="animate-pulse">
                <UserPlus size={16} className="mr-1" /> S'inscrire
              </Button>
            </>
          )}
        </div>
        {/* Mobile: boutons visibles + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <Button variant="heroOutline" size="sm" onClick={() => navigate("/mon-profil")}>
              <User size={16} />
            </Button>
          ) : (
            <>
              <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                <UserPlus size={14} className="mr-1" /> S'inscrire
              </Button>
              <Button variant="heroOutline" size="sm" onClick={() => navigate("/auth")}>
                <LogIn size={14} />
              </Button>
            </>
          )}
          <button className="text-foreground ml-1" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border py-4">
          <div className="container flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={`text-sm font-medium transition-colors ${
                  isActive(l.to) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Button variant="heroOutline" size="lg" onClick={() => { navigate("/admin"); setOpen(false); }}>
                <Shield size={16} className="mr-1" /> Admin
              </Button>
            )}
            {user ? (
              <>
                <Button variant="heroOutline" size="lg" onClick={() => { navigate("/mon-profil"); setOpen(false); }}>
                  <User size={16} className="mr-1" /> Mon Profil
                </Button>
                <Button variant="heroOutline" size="lg" onClick={() => { handleLogout(); setOpen(false); }}>
                  <LogOut size={16} className="mr-1" /> Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="heroOutline" size="lg" onClick={() => { navigate("/auth"); setOpen(false); }}>
                  <LogIn size={16} className="mr-1" /> Connexion
                </Button>
                <Button variant="hero" size="lg" onClick={() => { navigate("/auth"); setOpen(false); }}>
                  <UserPlus size={16} className="mr-1" /> S'inscrire
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
