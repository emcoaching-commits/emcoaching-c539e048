import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Camera, Mail, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupClosed, setSignupClosed] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [verificationResent, setVerificationResent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCapacity = async () => {
      const { data: setting } = await supabase.from("site_settings").select("value").eq("key", "max_users").single();
      const max = setting ? parseInt(setting.value) : 2;
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      if (count !== null && count >= max) setSignupClosed(true);
    };
    checkCapacity();
  }, []);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Fichier non valide"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image trop lourde (max 5MB)"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (userId: string) => {
    if (!avatarFile) return;
    const ext = avatarFile.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
    // Store path only (bucket is private, signed URLs used for display)
    await supabase.from("profiles").update({ avatar_url: path }).eq("user_id", userId);
  };

  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) {
      toast.error("Ajoute d'abord ton email.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingVerificationEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mail de vérification renvoyé ✉️");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        if (!rememberMe) {
          sessionStorage.setItem("session_only", "true");
        } else {
          sessionStorage.removeItem("session_only");
        }
        toast.success("Connexion réussie !");
        navigate("/");
      }
    } else {
      if (signupClosed) {
        toast.error("Les inscriptions sont complètes pour le moment.");
        setLoading(false);
        return;
      }
      // Vérifie l'âge minimum (15 ans)
      if (!birthDate) {
        toast.error("Merci de renseigner ta date de naissance.");
        setLoading(false);
        return;
      }
      const dob = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (isNaN(dob.getTime()) || age < 15) {
        toast.error("Tu dois avoir au moins 15 ans pour t'inscrire.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        if (data.user && avatarFile) {
          await uploadAvatar(data.user.id);
        }
        // Stocke la date de naissance dans le profil
        if (data.user) {
          await supabase.from("profiles").update({ birth_date: birthDate }).eq("user_id", data.user.id);
        }
        if (!data.session) {
          setPendingVerificationEmail(email);
          toast.success("Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse.");
          setIsLogin(true);
        } else {
          toast.success("Inscription réussie ! Bienvenue 💪");
          navigate("/mon-profil");
        }
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        console.error("Google OAuth error:", result.error);
        toast.error("Erreur Google : " + (result.error.message || "réessaie"));
        return;
      }
      if (result.redirected) {
        // Le navigateur va être redirigé vers Google — on attend
        return;
      }
      // Tokens reçus directement (cas rare)
      toast.success("Connexion réussie !");
      navigate("/");
    } catch (e: any) {
      console.error("Google OAuth exception:", e);
      toast.error("Connexion Google indisponible : " + (e?.message || "réessaie plus tard"));
    }
  };

  const handleAppleLogin = async () => {
    try {
      sessionStorage.removeItem("session_only");
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        console.error("Apple OAuth error:", result.error);
        toast.error("Erreur Apple : " + (result.error.message || "réessaie"));
        return;
      }
      if (result.redirected) return;
      toast.success("Connexion réussie !");
      navigate("/");
    } catch (e: any) {
      console.error("Apple OAuth exception:", e);
      toast.error("Connexion Apple indisponible : " + (e?.message || "réessaie plus tard"));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-4xl text-gradient-blue block text-center mb-8">
          EM' COACHING
        </Link>
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="font-display text-3xl text-center mb-6 text-foreground">
            {isLogin ? "CONNEXION" : "INSCRIPTION"}
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-6">
            {isLogin ? "Heureux de te revoir 👋" : "Crée ton compte en 1 clic avec Google"}
          </p>

          {!isLogin && signupClosed && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-5 mb-4 text-center">
              <p className="text-destructive text-base font-display">🔥 VICTIME DE SON SUCCÈS</p>
              <p className="text-foreground text-sm mt-2">Emma n'a plus de place disponible pour assurer au mieux votre programme personnalisé.</p>
              <p className="text-muted-foreground text-xs mt-2">Revenez bientôt ou contactez Emma directement au 06 70 61 96 28 pour être sur liste d'attente.</p>
            </div>
          )}

          {/* Google login - mis en avant */}
          <Button
            variant="hero"
            size="lg"
            className="w-full mb-4 flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-primary/20"
            onClick={handleGoogleLogin}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold">{isLogin ? "Se connecter avec Google" : "S'inscrire avec Google"}</span>
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="w-full mb-4 flex items-center justify-center gap-3 bg-black text-white hover:bg-black/90 shadow-lg"
            onClick={handleAppleLogin}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.86-3.08.42-1.09-.45-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.42C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="font-semibold">{isLogin ? "Se connecter avec Apple" : "S'inscrire avec Apple"}</span>
          </Button>
          {!isLogin && (
            <p className="text-center text-xs text-muted-foreground mb-4">
              ⚡ Le plus rapide — pas de mot de passe à retenir
            </p>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs uppercase">ou par email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {pendingVerificationEmail && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/15 p-2 text-primary">
                  <Mail size={16} />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Confirmation d'email en attente</p>
                    <p className="text-sm text-muted-foreground">
                      Un lien de vérification a été envoyé à <span className="text-foreground">{pendingVerificationEmail}</span>.
                    </p>
                  </div>
                  <Button type="button" variant="heroOutline" size="sm" onClick={handleResendVerification} disabled={loading}>
                    <Mail size={14} />
                    Renvoyer le mail
                  </Button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Avatar upload */}
                <div className="flex flex-col items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-2xl bg-muted border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center overflow-hidden group"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </button>
                  {avatarPreview ? (
                    <button
                      type="button"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                      className="text-muted-foreground text-xs hover:text-destructive flex items-center gap-1"
                    >
                      <X size={12} /> Retirer la photo
                    </button>
                  ) : (
                    <p className="text-muted-foreground text-xs">Ajouter une photo de profil (optionnel)</p>
                  )}
                </div>

                <Input
                  placeholder="Nom complet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-background border-border"
                  required
                />
                <Input
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background border-border"
                  required
                />
                <div>
                  <label className="text-muted-foreground text-xs block mb-1">
                    Date de naissance <span className="text-foreground">— minimum 15 ans pour s'inscrire</span>
                  </label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-background border-border"
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border"
              required
            />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border-border"
              minLength={4}
              required
            />
            {isLogin && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer select-none">
                  Rester connecté
                </label>
              </div>
            )}
            <Button variant="hero" size="lg" className="w-full" disabled={loading || (!isLogin && signupClosed)}>
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
            </Button>
          </form>
          <p className="text-muted-foreground text-sm text-center mt-4">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              className="text-primary hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
