import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ClipboardList, User, MapPin, Phone, Ruler, Weight, Calendar, ArrowLeft, Sparkles, Save, ChevronRight, Send, MessageCircle, Headphones, Camera, Star, FileSpreadsheet, CalendarCheck, Check, X, CalendarPlus, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const MonProfil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    age: "",
    city: "",
    weight: "",
    height: "",
    gender: "",
  });

  // Messaging
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [assignedPlan, setAssignedPlan] = useState<any>(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const msgBottomRef = useRef<HTMLDivElement>(null);
  const messagerieRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      // If admin, redirect to admin dashboard
      const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (roleData && roleData.length > 0) { navigate("/admin"); return; }

      setUserEmail(user.email || "");
      setUserId(user.id);

      // Load profile
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
          age: data.age?.toString() || "",
          city: data.city || "",
          weight: data.weight?.toString() || "",
          height: data.height?.toString() || "",
          gender: data.gender || "",
        });
        if (!data.full_name || !data.age || !data.city) setEditing(true);
        // Load signed avatar URL
        if (data.avatar_url) {
          const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(data.avatar_url, 3600);
          if (signed?.signedUrl) setAvatarSignedUrl(signed.signedUrl);
        }
        // Load assigned plan + pop-up logic
        if ((data as any).assigned_plan_id) {
          const { data: plan } = await supabase
            .from("pricing_plans")
            .select("*")
            .eq("id", (data as any).assigned_plan_id)
            .single();
          if (plan) setAssignedPlan(plan);
        }
        // Pop-up bienvenue : visible 7 jours après activation, sauf si fermé manuellement
        const activatedAt = (data as any).subscription_activated_at;
        const dismissed = (data as any).welcome_popup_dismissed;
        if (activatedAt && !dismissed) {
          const ageMs = Date.now() - new Date(activatedAt).getTime();
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          if (ageMs <= sevenDaysMs) {
            setShowWelcomePopup(true);
          }
        }
      } else {
        setEditing(true);
      }

      // Load admin ID via secure function
      const { data: adminData } = await supabase.rpc("get_admin_id");
      if (adminData) setAdminId(adminData);

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });
      setMessages(msgs || []);

      // Mark as read
      await supabase.from("messages").update({ is_read: true }).eq("receiver_id", user.id).eq("is_read", false);

      // Load bookings with time slot info
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*, time_slots!bookings_time_slot_id_fkey(date, start_time, end_time)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      // Load proposed slot details for reschedules
      if (bookingsData) {
        for (const b of bookingsData) {
          if ((b as any).proposed_slot_id) {
            const { data: ps } = await supabase.from("time_slots").select("date, start_time, end_time").eq("id", (b as any).proposed_slot_id).single();
            (b as any).proposed_slot = ps;
          }
        }
      }
      setBookings(bookingsData || []);

      setLoading(false);
    };
    load();
  }, [navigate]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(async () => {
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: true });
      if (msgs) {
        setMessages(msgs);
        // Mark unread as read
        const unread = msgs.filter((m: any) => m.receiver_id === userId && !m.is_read);
        for (const m of unread) {
          await supabase.from("messages").update({ is_read: true }).eq("id", m.id);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    msgBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const updateData = {
      full_name: form.full_name || null,
      phone: form.phone || null,
      age: form.age ? parseInt(form.age) : null,
      city: form.city || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      gender: form.gender || null,
    };
    const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else {
      toast.success("Profil mis à jour ! 💪");
      setProfile({ ...profile, ...updateData });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleSendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !adminId || !userId) return;
    setSendingMsg(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: userId,
      receiver_id: adminId,
      content: newMsg.trim(),
    });
    if (error) {
      console.error("Message send error:", error);
      toast.error("Erreur d'envoi du message");
    } else {
      setNewMsg("");
      // Refresh messages immediately
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: true });
      if (msgs) setMessages(msgs);
    }
    setSendingMsg(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dismissWelcomePopup = async () => {
    setShowWelcomePopup(false);
    if (userId) {
      await supabase.from("profiles").update({ welcome_popup_dismissed: true }).eq("user_id", userId);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (!file.type.startsWith("image/")) { toast.error("Fichier non valide"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image trop lourde (max 5MB)"); return; }

    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) { toast.error("Erreur d'upload"); return; }

    // Store path, use signed URL for display
    const { data: signedData } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
    const avatarPath = path;

    await supabase.from("profiles").update({ avatar_url: avatarPath }).eq("user_id", userId);
    setProfile({ ...profile, avatar_url: avatarPath });
    if (signedData?.signedUrl) setAvatarSignedUrl(signedData.signedUrl);
    toast.success("Photo de profil mise à jour ! 📸");
  };

  const addToCalendar = (slot: any, type: "google" | "ics") => {
    if (!slot?.date || !slot?.start_time || !slot?.end_time) return;
    const dateStr = slot.date.replace(/-/g, "");
    const startStr = slot.start_time.toString().slice(0, 5).replace(":", "") + "00";
    const endStr = slot.end_time.toString().slice(0, 5).replace(":", "") + "00";
    const title = "RDV Em' Coaching";
    const details = "Rendez-vous coaching avec Emma";

    if (type === "google") {
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateStr}T${startStr}/${dateStr}T${endStr}&details=${encodeURIComponent(details)}&ctz=Europe/Paris`;
      window.open(url, "_blank");
    } else {
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTART;TZID=Europe/Paris:${dateStr}T${startStr}`,
        `DTEND;TZID=Europe/Paris:${dateStr}T${endStr}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${details}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      const blob = new Blob([icsContent], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rdv-emcoaching.ics";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const firstName = form.full_name?.trim() ? form.full_name.split(" ")[0] : "";
  const initials = form.full_name
    ? form.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const completionPercent = [form.full_name, form.phone, form.age, form.city, form.weight, form.height, form.gender]
    .filter(Boolean).length / 7 * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative z-10 pt-8 pb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={16} /> Retour
          </Link>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              {(avatarSignedUrl || profile?.avatar_url) ? (
                <img
                  src={avatarSignedUrl || profile.avatar_url}
                  alt="Photo de profil"
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg shadow-primary/25"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="font-display text-3xl text-primary-foreground">{initials}</span>
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={24} className="text-foreground" />
              </div>
              {profile?.has_active_subscription && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
              )}
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center sm:text-left">
              <h1 className="font-display text-4xl sm:text-5xl text-foreground">
                {firstName ? `Salut ${firstName} 👋` : "Bienvenue à toi 👋"}
              </h1>
              <p className="text-muted-foreground mt-1">{userEmail}</p>
              {profile?.created_at && (
                <p className="text-muted-foreground text-xs mt-1">Membre depuis {format(new Date(profile.created_at), "MMMM yyyy")}</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container -mt-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">

          {/* Left column - Status cards */}
          <div className="space-y-4">
            {/* Subscription status */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`rounded-xl p-5 border ${
                profile?.has_active_subscription
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${profile?.has_active_subscription ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                <span className="text-foreground font-medium text-sm">
                  {profile?.has_active_subscription
                    ? assignedPlan ? `Formule : ${assignedPlan.name}` : "Abonnement actif"
                    : "Pas d'abonnement"}
                </span>
              </div>
              {profile?.has_active_subscription && assignedPlan && (
                <p className="text-muted-foreground text-xs mt-1">
                  {assignedPlan.price}€ — {assignedPlan.description || ""}
                </p>
              )}
              {!profile?.has_active_subscription && (
                <p className="text-muted-foreground text-xs">Contacte Emma pour souscrire à une formule.</p>
              )}
            </motion.div>

            {/* Payment dates */}
            {profile?.has_active_subscription && (profile?.subscription_start_date || profile?.next_payment_date) && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-card border border-border rounded-xl p-5 space-y-3"
              >
                <p className="text-foreground font-medium text-sm flex items-center gap-2">
                  💳 Paiement
                </p>
                {profile?.subscription_start_date && (
                  <div>
                    <p className="text-muted-foreground text-xs">Premier paiement</p>
                    <p className="text-foreground text-sm font-medium">
                      {new Date(profile.subscription_start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                )}
                {profile?.next_payment_date && (
                  <div>
                    <p className="text-muted-foreground text-xs">Prochain paiement</p>
                    <p className="text-primary text-sm font-display">
                      {new Date(profile.next_payment_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Monday review prompt */}
            {profile?.has_active_subscription && new Date().getDay() === 1 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="relative overflow-hidden rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-card p-5"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={18} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-display text-sm">C'EST LUNDI, LAISSE TON AVIS !</p>
                    <p className="text-muted-foreground text-xs">Ton retour aide Emma à s'améliorer 💪</p>
                  </div>
                  <Button
                    variant="heroOutline"
                    size="sm"
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 shrink-0"
                    onClick={() => navigate("/avis")}
                  >
                    Donner mon avis
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Profile completion */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <p className="text-foreground text-sm font-medium mb-3">Profil complété</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-muted-foreground text-xs mt-2">{Math.round(completionPercent)}% — {completionPercent < 100 ? "Continue à remplir tes infos !" : "Parfait ! 🎉"}</p>
            </motion.div>

            {/* Quick stats */}
            {(form.weight || form.height) && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card border border-border rounded-xl p-5 grid grid-cols-2 gap-4"
              >
                {form.weight && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Poids</p>
                    <p className="text-foreground font-display text-2xl">{form.weight}<span className="text-muted-foreground text-sm ml-1">kg</span></p>
                  </div>
                )}
                {form.height && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Taille</p>
                    <p className="text-foreground font-display text-2xl">{form.height}<span className="text-muted-foreground text-sm ml-1">cm</span></p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Bookings / Rendez-vous */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <p className="text-foreground font-medium text-sm flex items-center gap-2 mb-3">
                <CalendarCheck size={16} className="text-primary" /> Mes rendez-vous
              </p>
              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.map((b: any) => {
                    const slot = b.time_slots as any;
                    const isPast = slot?.date && new Date(slot.date) < new Date(new Date().toDateString());
                    const isReschedule = b.status === "reschedule_pending";
                    const statusLabel = b.status === "cancelled" ? "Annulé" : isReschedule ? "Report proposé" : isPast ? "Passé" : "Confirmé";
                    const statusColor = b.status === "cancelled" ? "text-destructive" : isReschedule ? "text-yellow-500" : isPast ? "text-muted-foreground" : "text-green-500";
                    return (
                      <div key={b.id} className="py-2 border-b border-border last:border-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-foreground text-sm font-medium">
                              📅 {slot?.date ? new Date(slot.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "—"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              🕐 {slot?.start_time?.toString().slice(0, 5)} - {slot?.end_time?.toString().slice(0, 5)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {b.status === "confirmed" && !isPast && slot && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => addToCalendar(slot, "google")}
                                  className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                  title="Google Calendar"
                                >
                                  Google
                                </button>
                                <button
                                  onClick={() => addToCalendar(slot, "ics")}
                                  className="text-[10px] px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                  title="Apple / Outlook"
                                >
                                  <CalendarPlus size={12} />
                                </button>
                                <button
                                  onClick={async () => {
                                    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", b.id);
                                    await supabase.from("time_slots").update({ is_available: true }).eq("id", b.time_slot_id);
                                    toast.success("Rendez-vous annulé ✅");
                                    const { data: updated } = await supabase.from("bookings").select("*, time_slots!bookings_time_slot_id_fkey(date, start_time, end_time)").eq("user_id", userId!).order("created_at", { ascending: false });
                                    if (updated) setBookings(updated);
                                  }}
                                  className="text-[10px] px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                                  title="Annuler le rendez-vous"
                                >
                                  Annuler
                                </button>
                                <button
                                  onClick={async () => {
                                    if (rescheduleBookingId === b.id) {
                                      setRescheduleBookingId(null);
                                      return;
                                    }
                                    // Fetch available slots
                                    const { data: slotsData } = await supabase
                                      .from("time_slots")
                                      .select("*")
                                      .eq("is_available", true)
                                      .gte("date", new Date().toISOString().split("T")[0])
                                      .order("date")
                                      .order("start_time");
                                    setAvailableSlots(slotsData || []);
                                    setRescheduleBookingId(b.id);
                                    setRescheduleSlotId("");
                                  }}
                                  className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                  title="Décaler le rendez-vous"
                                >
                                  Décaler
                                </button>
                              </div>
                            )}
                            <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                          </div>
                        </div>

                        {/* Client reschedule picker */}
                        {rescheduleBookingId === b.id && (
                          <div className="mt-2 bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                            <p className="text-foreground text-xs font-medium">📅 Choisir un nouveau créneau :</p>
                            {availableSlots.length === 0 ? (
                              <p className="text-muted-foreground text-xs">Aucun créneau disponible pour le moment.</p>
                            ) : (
                              <>
                                <select
                                  className="w-full h-8 text-xs bg-background border border-border rounded-md px-2 text-foreground"
                                  value={rescheduleSlotId}
                                  onChange={(e) => setRescheduleSlotId(e.target.value)}
                                >
                                  <option value="">Choisir un créneau...</option>
                                  {availableSlots.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                      {new Date(s.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} — {s.start_time?.toString().slice(0, 5)} à {s.end_time?.toString().slice(0, 5)}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="hero"
                                    disabled={!rescheduleSlotId}
                                    onClick={async () => {
                                      // Free old slot
                                      await supabase.from("time_slots").update({ is_available: true }).eq("id", b.time_slot_id);
                                      // Book new slot
                                      await supabase.from("time_slots").update({ is_available: false }).eq("id", rescheduleSlotId);
                                      // Update booking
                                      await supabase.from("bookings").update({ time_slot_id: rescheduleSlotId }).eq("id", b.id);
                                      toast.success("Rendez-vous décalé ✅");
                                      setRescheduleBookingId(null);
                                      const { data: updated } = await supabase.from("bookings").select("*, time_slots!bookings_time_slot_id_fkey(date, start_time, end_time)").eq("user_id", userId!).order("created_at", { ascending: false });
                                      if (updated) setBookings(updated);
                                    }}
                                  >
                                    <Check size={14} className="mr-1" /> Confirmer
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="heroOutline"
                                    onClick={() => setRescheduleBookingId(null)}
                                  >
                                    <X size={14} className="mr-1" /> Annuler
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Reschedule proposal */}
                        {isReschedule && b.proposed_slot && (
                          <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <p className="text-foreground text-xs font-medium mb-1">📩 Emma propose un nouveau créneau :</p>
                            <p className="text-primary text-sm font-display">
                              {new Date(b.proposed_slot.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} — {b.proposed_slot.start_time?.toString().slice(0, 5)} à {b.proposed_slot.end_time?.toString().slice(0, 5)}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="hero"
                                onClick={async () => {
                                  await supabase.from("bookings").update({
                                    time_slot_id: b.proposed_slot_id,
                                    proposed_slot_id: null,
                                    status: "confirmed",
                                  }).eq("id", b.id);
                                  toast.success("Nouveau créneau accepté ! ✅");
                                  const { data: updated } = await supabase.from("bookings").select("*, time_slots!bookings_time_slot_id_fkey(date, start_time, end_time)").eq("user_id", userId!).order("created_at", { ascending: false });
                                  if (updated) {
                                    for (const u of updated) {
                                      if ((u as any).proposed_slot_id) {
                                        const { data: ps } = await supabase.from("time_slots").select("date, start_time, end_time").eq("id", (u as any).proposed_slot_id).single();
                                        (u as any).proposed_slot = ps;
                                      }
                                    }
                                    setBookings(updated);
                                  }
                                }}
                              >
                                <Check size={14} className="mr-1" /> Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="heroOutline"
                                className="text-destructive border-destructive/30"
                                onClick={async () => {
                                  await supabase.from("bookings").update({
                                    proposed_slot_id: null,
                                    status: "confirmed",
                                  }).eq("id", b.id);
                                  toast.info("Report refusé — créneau initial maintenu");
                                  const { data: updated } = await supabase.from("bookings").select("*, time_slots!bookings_time_slot_id_fkey(date, start_time, end_time)").eq("user_id", userId!).order("created_at", { ascending: false });
                                  if (updated) setBookings(updated);
                                }}
                              >
                                <X size={14} className="mr-1" /> Refuser
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">Aucun rendez-vous pour le moment 📭</p>
              )}
            </motion.div>
          </div>

          {/* Right column - Profile form + questionnaire */}
          <div className="md:col-span-2 space-y-6">

            {/* Questionnaire CTA - only if subscription active */}
            {profile?.has_active_subscription && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <ClipboardList size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-display text-xl mb-1">QUESTIONNAIRE PERSONNALISÉ</h3>
                    <p className="text-muted-foreground text-sm">Remplis le questionnaire pour qu'Emma puisse créer ton programme sur-mesure !</p>
                  </div>
                  <Button
                    variant="hero"
                    size="lg"
                    className="shrink-0"
                    onClick={() => window.open("https://forms.gle/uDqAWm3HbfXEgees7", "_blank")}
                  >
                    Remplir <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Google Sheet link */}
            {profile?.google_sheet_url && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="relative overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 via-green-500/5 to-card p-6"
              >
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={24} className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-display text-xl mb-1">TON PROGRAMME</h3>
                    <p className="text-muted-foreground text-sm">Accède à ton programme personnalisé préparé par Emma 💪</p>
                  </div>
                  <Button
                    variant="heroOutline"
                    size="lg"
                    className="shrink-0 border-green-500 text-green-500 hover:bg-green-500/10"
                    onClick={() => window.open(profile.google_sheet_url, "_blank")}
                  >
                    Ouvrir <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Profile card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-display text-2xl text-foreground">MES INFORMATIONS</h2>
                {!editing && (
                  <Button variant="heroOutline" size="sm" onClick={() => setEditing(true)}>
                    Modifier
                  </Button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSave} className="p-5 space-y-4">
                  <div>
                    <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><User size={12} /> Nom complet</label>
                    <Input placeholder="Ton nom complet" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><Phone size={12} /> Téléphone</label>
                    <Input type="tel" placeholder="06 XX XX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background border-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><Calendar size={12} /> Âge</label>
                      <Input type="number" placeholder="25" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><MapPin size={12} /> Ville</label>
                      <Input placeholder="Paris" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-background border-border" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><Weight size={12} /> Poids (kg)</label>
                      <Input type="number" placeholder="70" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><Ruler size={12} /> Taille (cm)</label>
                      <Input type="number" placeholder="175" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="bg-background border-border" />
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs mb-2 block">Sexe</label>
                    <div className="flex gap-2">
                      {["Homme", "Femme", "Autre"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm({ ...form, gender: g })}
                          className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            form.gender === g
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                              : "bg-background text-muted-foreground border-border hover:border-primary/40"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="hero" size="lg" className="flex-1" disabled={saving}>
                      <Save size={16} className="mr-2" />
                      {saving ? "Sauvegarde..." : "Enregistrer"}
                    </Button>
                    {profile?.full_name && (
                      <Button variant="heroOutline" size="lg" type="button" onClick={() => setEditing(false)}>
                        Annuler
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="p-5 space-y-4">
                  {[
                    { icon: User, label: "Nom", value: form.full_name },
                    { icon: Phone, label: "Téléphone", value: form.phone },
                    { icon: Calendar, label: "Âge", value: form.age ? `${form.age} ans` : "" },
                    { icon: MapPin, label: "Ville", value: form.city },
                    { icon: Weight, label: "Poids", value: form.weight ? `${form.weight} kg` : "" },
                    { icon: Ruler, label: "Taille", value: form.height ? `${form.height} cm` : "" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs">{label}</p>
                        <p className="text-foreground text-sm font-medium">{value || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                      </div>
                    </div>
                  ))}
                  {form.gender && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <User size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs">Sexe</p>
                        <p className="text-foreground text-sm font-medium">{form.gender}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Service client */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="relative overflow-hidden rounded-xl border border-destructive/30 bg-gradient-to-r from-destructive/10 via-destructive/5 to-card p-5"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                <Headphones size={24} className="text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground font-display text-lg">UN PROBLÈME ?</h3>
                <p className="text-muted-foreground text-sm">Signale un souci et Emma te répondra rapidement.</p>
              </div>
              <Button
                variant="heroOutline"
                size="lg"
                className="shrink-0 border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setNewMsg("🚨 Service client : Bonjour Emma, j'ai un problème avec ");
                  messagerieRef.current?.scrollIntoView({ behavior: "smooth" });
                  setTimeout(() => {
                    const input = messagerieRef.current?.querySelector("input");
                    input?.focus();
                  }, 500);
                }}
              >
                Signaler un problème
              </Button>
            </div>
          </motion.div>

          {/* Messagerie avec Emma */}
          <motion.div
            ref={messagerieRef}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="p-5 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                <span className="font-display text-lg text-primary">E</span>
              </div>
              <div>
                <h3 className="text-foreground font-display text-lg">MESSAGERIE</h3>
                <p className="text-muted-foreground text-xs">Discute avec Emma</p>
              </div>
              <MessageCircle size={20} className="ml-auto text-primary" />
            </div>

            <ScrollArea className="h-72 p-4">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageCircle size={40} className="mb-2 text-primary/20" />
                    <p className="text-sm">Envoie ton premier message à Emma !</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender_id === userId;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {format(new Date(msg.created_at), "HH:mm · dd MMM", { locale: fr })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={msgBottomRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMsg} className="flex gap-2 p-3 border-t border-border">
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 bg-background border-border"
                maxLength={1000}
              />
              <Button type="submit" variant="hero" size="icon" disabled={sendingMsg || !newMsg.trim()}>
                <Send size={18} />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Pop-up de bienvenue (7 jours après activation par Emma) */}
      <Dialog open={showWelcomePopup} onOpenChange={(open) => { if (!open) dismissWelcomePopup(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-gradient-blue flex items-center gap-2">
              <Sparkles size={22} className="text-primary" /> Bienvenue {firstName ? firstName : ""} !
            </DialogTitle>
            <DialogDescription className="text-foreground text-sm pt-2 leading-relaxed">
              {assignedPlan && (
                <span className="block mb-3 font-medium text-primary">
                  Ta formule : {assignedPlan.name} ({assignedPlan.price}€)
                </span>
              )}
              Emma va te contacter le plus rapidement possible. En attendant, prends quelques minutes pour remplir ton{" "}
              <Link to="/questionnaire" className="text-primary font-semibold underline hover:opacity-80">
                questionnaire de découverte
              </Link>{" "}
              soigneusement — ça aidera Emma à te préparer un programme parfait pour toi 💪
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="hero"
              size="lg"
              className="flex-1"
              onClick={() => { dismissWelcomePopup(); navigate("/questionnaire"); }}
            >
              <ClipboardList size={18} className="mr-2" /> Remplir le questionnaire
            </Button>
            <Button variant="heroOutline" size="lg" onClick={dismissWelcomePopup}>
              Plus tard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonProfil;
