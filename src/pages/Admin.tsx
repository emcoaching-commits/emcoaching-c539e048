import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ArrowLeft, Trash2, Check, X, Plus, Send, MessageCircle, Bell, UserPlus, RefreshCw, AlertTriangle, Search, Users, Settings, CalendarClock, Tag, Clock, Image, Upload, Package, Edit2, Save, Calendar, Link2, BellRing } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import HomeContentManager from "@/components/admin/HomeContentManager";
import PricingPlansManager from "@/components/admin/PricingPlansManager";
import RecurringSlotsForm from "@/components/admin/RecurringSlotsForm";
import CustomLinksManager from "@/components/admin/CustomLinksManager";
import { withAppBase } from "@/lib/app-paths";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("notifications");
  const [activeGroup, setActiveGroup] = useState<string>("activite");

  // New slot form
  const [slotDate, setSlotDate] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [slotTypeId, setSlotTypeId] = useState("");

  // New appointment type form
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDuration, setNewTypeDuration] = useState("30");

  // Messaging
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [adminMsg, setAdminMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const msgBottomRef = useRef<HTMLDivElement>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [maxUsers, setMaxUsers] = useState("2");
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [rescheduleSlotId, setRescheduleSlotId] = useState("");
  const [bookForClientId, setBookForClientId] = useState("");
  const [bookForSlotId, setBookForSlotId] = useState("");
  const [aboutDesc, setAboutDesc] = useState("");
  const [aboutDescLoaded, setAboutDescLoaded] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [gcalConnecting, setGcalConnecting] = useState(false);
  const [gcalSyncing, setGcalSyncing] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (!data || data.length === 0) { navigate("/"); toast.error("Accès refusé"); return; }
      setIsAdmin(true);
      setCurrentUserId(user.id);

      // Auto-clean past slots & bookings
      const today = new Date().toISOString().split("T")[0];
      const { data: pastSlots } = await supabase.from("time_slots").select("id").lt("date", today);
      const pastIds = (pastSlots || []).map((s: any) => s.id);
      if (pastIds.length > 0) {
        await supabase.from("bookings").delete().in("time_slot_id", pastIds);
        await supabase.from("time_slots").delete().in("id", pastIds);
        queryClient.invalidateQueries({ queryKey: ["admin_slots"] });
        queryClient.invalidateQueries({ queryKey: ["admin_bookings"] });
      }
    };
    check();
  }, [navigate, queryClient]);

  // Reviews
  const { data: reviews } = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      // Fetch profile names for each review
      if (data) {
        const userIds = [...new Set(data.map((r: any) => r.user_id))];
        const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
        const profMap = Object.fromEntries((profs || []).map((p: any) => [p.user_id, p.full_name]));
        for (const r of data) { (r as any).profile_name = profMap[r.user_id] || "Anonyme"; }
      }
      return data;
    },
    enabled: isAdmin === true,
  });

  // Time slots
  const { data: slots } = useQuery({
    queryKey: ["admin_slots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("time_slots").select("*, appointment_types(name, duration_minutes)").order("date").order("start_time");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Appointment types
  const { data: appointmentTypes } = useQuery({
    queryKey: ["admin_appointment_types"],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointment_types").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Bookings
  const { data: bookings } = useQuery({
    queryKey: ["admin_bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*, time_slots!bookings_time_slot_id_fkey(date, start_time, end_time)").order("created_at", { ascending: false });
      if (error) throw error;
      if (data) {
        // Fetch profile info
        const userIds = [...new Set(data.map((b: any) => b.user_id))];
        const { data: profs } = await supabase.from("profiles").select("user_id, full_name, phone").in("user_id", userIds);
        const profMap = Object.fromEntries((profs || []).map((p: any) => [p.user_id, p]));
        for (const b of data) {
          (b as any).profiles = profMap[b.user_id] || { full_name: "Client", phone: null };
          if ((b as any).proposed_slot_id) {
            const { data: ps } = await supabase.from("time_slots").select("date, start_time, end_time").eq("id", (b as any).proposed_slot_id).single();
            (b as any).proposed_slot = ps;
          }
        }
      }
      return data;
    },
    enabled: isAdmin === true,
  });

  // Clients
  const { data: clients } = useQuery({
    queryKey: ["admin_clients"],
    queryFn: async () => {
      const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      const adminIds = adminRoles?.map((r: any) => r.user_id) || [];
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).filter((p: any) => !adminIds.includes(p.user_id));
    },
    enabled: isAdmin === true,
  });

  // All client bookings with time slots
  const { data: clientBookings } = useQuery({
    queryKey: ["admin_client_bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, time_slots!bookings_time_slot_id_fkey(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Notifications
  const { data: notifications } = useQuery({
    queryKey: ["admin_notifications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // About media
  const { data: aboutMedia } = useQuery({
    queryKey: ["admin_about_media"],
    queryFn: async () => {
      const { data, error } = await supabase.from("about_media").select("*").order("position");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Services
  const { data: adminServices } = useQuery({
    queryKey: ["admin_services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("position");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Pricing plans (pour assigner formule à un client)
  const { data: pricingPlans } = useQuery({
    queryKey: ["admin_pricing_plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_plans").select("*").order("price");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editService, setEditService] = useState<any>({});
  const [uploadingServiceImg, setUploadingServiceImg] = useState(false);

  // Max users setting + about description
  useEffect(() => {
    if (!isAdmin) return;
    const loadSettings = async () => {
      const { data: mu } = await supabase.from("site_settings").select("value").eq("key", "max_users").single();
      if (mu) setMaxUsers(mu.value);
      const { data: ad } = await supabase.from("site_settings").select("value").eq("key", "about_description").single();
      if (ad) { setAboutDesc(ad.value); setAboutDescLoaded(true); }
    };
    loadSettings();
  }, [isAdmin]);

  const updateMaxUsers = async (val: string) => {
    setMaxUsers(val);
    const num = parseInt(val);
    if (isNaN(num) || num < 1) return;
    await supabase.from("site_settings").upsert({ key: "max_users", value: val });
    toast.success(`Capacité mise à jour : ${val} clients max`);
  };

  const deleteClient = async (userId: string, name: string) => {
    if (!confirm(`Supprimer définitivement ${name || "ce client"} et toutes ses données ? Cette action est irréversible.`)) return;
    setDeletingUser(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("delete-user", {
        body: { user_id: userId },
      });
      if (res.error) throw res.error;
      toast.success(`${name || "Client"} supprimé`);
      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
      queryClient.invalidateQueries({ queryKey: ["admin_messages"] });
    } catch (err: any) {
      toast.error("Erreur : " + (err.message || "Impossible de supprimer"));
    }
    setDeletingUser(null);
  };

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["admin_notifications"] });
  };

  // Poll notifications every 5 seconds
  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["admin_notifications"] });
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, queryClient]);

  // Messages - all conversations
  const { data: allMessages } = useQuery({
    queryKey: ["admin_messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Get unique client IDs from messages
  const messageClients = allMessages
    ? [...new Set(allMessages.flatMap((m: any) => [m.sender_id, m.receiver_id]).filter((id: string) => id !== currentUserId))]
    : [];

  const selectedMessages = allMessages?.filter(
    (m: any) => m.sender_id === selectedClient || m.receiver_id === selectedClient
  ) || [];

  // Poll messages every 5 seconds
  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["admin_messages"] });
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, queryClient]);

  useEffect(() => {
    msgBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages.length]);

  const sendAdminMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMsg.trim() || !selectedClient || !currentUserId) return;
    setSendingMsg(true);
    await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: selectedClient,
      content: adminMsg.trim(),
    });
    setAdminMsg("");
    setSendingMsg(false);
  };

  // Google Calendar connection status
  const { data: gcalEmail } = useQuery({
    queryKey: ["gcal_email"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "google_calendar_email").single();
      return data?.value || null;
    },
    enabled: isAdmin === true,
  });

  // Handle gcal callback params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gcalStatus = params.get("gcal");
    if (gcalStatus === "success") {
      toast.success("Google Agenda connecté avec succès !");
      queryClient.invalidateQueries({ queryKey: ["gcal_email"] });
      window.history.replaceState({}, "", withAppBase("/admin"));
    } else if (gcalStatus === "error") {
      toast.error("Erreur de connexion à Google Agenda : " + (params.get("reason") || "inconnue"));
      window.history.replaceState({}, "", withAppBase("/admin"));
    }
  }, [queryClient]);

  const handleConnectGcal = async () => {
    setGcalConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Session admin expirée, reconnectez-vous.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ origin: window.location.origin }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(data?.error || "Accès Google Agenda refusé");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Lien Google Agenda introuvable");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGcalConnecting(false);
    }
  };

  const handleSyncGcal = async () => {
    setGcalSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Session admin expirée, reconnectez-vous.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-google-calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ action: "sync_all" }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(data?.error || "Erreur de synchronisation");
        return;
      }

      if (data?.success) {
        toast.success(`${data.created} événement(s) synchronisé(s) !`);
      } else {
        toast.error(data?.error || "Erreur de synchronisation");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGcalSyncing(false);
    }
  };

    const toggleReview = async (id: string, approved: boolean) => {
    queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
    toast.success(approved ? "Avis approuvé" : "Avis masqué");
  };

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    // Auto-calculate end_time from type duration if a type is selected
    let endTime = slotEnd;
    if (slotTypeId && slotStart) {
      const selectedType = appointmentTypes?.find((t: any) => t.id === slotTypeId);
      if (selectedType) {
        const [h, m] = slotStart.split(":").map(Number);
        const totalMin = h * 60 + m + selectedType.duration_minutes;
        const endH = Math.floor(totalMin / 60).toString().padStart(2, "0");
        const endM = (totalMin % 60).toString().padStart(2, "0");
        endTime = `${endH}:${endM}`;
      }
    }
    const { error } = await supabase.from("time_slots").insert({
      date: slotDate,
      start_time: slotStart,
      end_time: endTime,
      appointment_type_id: slotTypeId || null,
    });
    if (error) toast.error("Erreur");
    else {
      toast.success("Créneau ajouté");
      setSlotDate(""); setSlotStart(""); setSlotEnd(""); setSlotTypeId("");
      queryClient.invalidateQueries({ queryKey: ["admin_slots"] });
    }
  };

  const addAppointmentType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const { error } = await supabase.from("appointment_types").insert({
      name: newTypeName.trim(),
      duration_minutes: parseInt(newTypeDuration) || 30,
    });
    if (error) toast.error("Erreur");
    else {
      toast.success("Type de RDV créé");
      setNewTypeName(""); setNewTypeDuration("30");
      queryClient.invalidateQueries({ queryKey: ["admin_appointment_types"] });
    }
  };

  const deleteAppointmentType = async (id: string) => {
    await supabase.from("appointment_types").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin_appointment_types"] });
    toast.success("Type supprimé");
  };

  const deleteSlot = async (id: string) => {
    await supabase.from("time_slots").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin_slots"] });
    toast.success("Créneau supprimé");
  };

  const adminBookForClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookForClientId || !bookForSlotId) return;
    const { error } = await supabase.from("bookings").insert({
      user_id: bookForClientId,
      time_slot_id: bookForSlotId,
    });
    if (error) {
      toast.error("Erreur lors de la réservation");
    } else {
      toast.success("RDV réservé pour le client !");
      setBookForClientId("");
      setBookForSlotId("");
      queryClient.invalidateQueries({ queryKey: ["admin_bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin_client_bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin_slots"] });
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Annuler ce rendez-vous ? Le créneau redeviendra disponible.")) return;
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    queryClient.invalidateQueries({ queryKey: ["admin_bookings"] });
    queryClient.invalidateQueries({ queryKey: ["admin_client_bookings"] });
    queryClient.invalidateQueries({ queryKey: ["admin_slots"] });
    toast.success("Rendez-vous annulé, créneau libéré");
  };

  if (isAdmin === null) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="heroOutline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft size={16} className="mr-1" /> Retour
          </Button>
          <h1 className="font-display text-4xl text-gradient-blue">ADMIN</h1>
        </div>

        {(() => {
          const groups: { id: string; label: string; icon: any; tabs: { value: string; label: string; badge?: number }[] }[] = [
            {
              id: "activite",
              label: "Activité",
              icon: Bell,
              tabs: [
                { value: "notifications", label: "Notifications", badge: unreadCount },
                { value: "messages", label: "Messages" },
              ],
            },
            {
              id: "clients",
              label: "Clients",
              icon: Users,
              tabs: [
                { value: "clients", label: `Clients (${clients?.length || 0})` },
                { value: "reviews", label: `Avis (${reviews?.length || 0})` },
              ],
            },
            {
              id: "planning",
              label: "Planning",
              icon: CalendarClock,
              tabs: [
                { value: "types", label: "Types RDV" },
                { value: "slots", label: `Créneaux (${slots?.length || 0})` },
                { value: "bookings", label: `Réservations (${bookings?.length || 0})` },
                { value: "gcal", label: "Google Agenda" },
              ],
            },
            {
              id: "contenu",
              label: "Contenu",
              icon: Image,
              tabs: [
                { value: "home", label: "Accueil & Logo" },
                { value: "about", label: "À propos" },
                { value: "formules", label: "Formules" },
              ],
            },
            {
              id: "management",
              label: "Management",
              icon: Link2,
              tabs: [
                { value: "links", label: "Liens utiles" },
              ],
            },
          ];
          const currentGroup = groups.find((g) => g.id === activeGroup) || groups[0];
          return (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-wrap gap-2 mb-3">
                {groups.map((g) => {
                  const GIcon = g.icon;
                  const isActive = g.id === activeGroup;
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        setActiveGroup(g.id);
                        setActiveTab(g.tabs[0].value);
                      }}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      <GIcon size={14} /> {g.label}
                    </button>
                  );
                })}
              </div>
              <TabsList className="bg-card border border-border mb-6 flex-wrap">
                {currentGroup.tabs.map((t) => (
                  <TabsTrigger key={t.value} value={t.value} className="relative">
                    {t.label}
                    {t.badge && t.badge > 0 ? (
                      <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                        {t.badge}
                      </span>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-foreground font-display text-xl">ACTIVITÉ RÉCENTE</h2>
              {unreadCount > 0 && (
                <Button variant="heroOutline" size="sm" onClick={markAllRead}>
                  <Check size={14} className="mr-1" /> Tout marquer comme lu
                </Button>
              )}
            </div>
            {(!notifications || notifications.length === 0) && (
              <p className="text-muted-foreground text-center py-8">Aucune activité pour le moment</p>
            )}
            {notifications?.map((n: any) => {
              const icon = n.type === "inscription" ? <UserPlus size={16} /> 
                : n.type === "message" ? <MessageCircle size={16} />
                : n.type === "profil_update" ? <RefreshCw size={16} />
                : <AlertTriangle size={16} />;
              const color = n.type === "inscription" ? "text-green-500"
                : n.type === "message" ? "text-primary"
                : n.type === "profil_update" ? "text-accent"
                : "text-destructive";
              return (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg border ${n.is_read ? "bg-card border-border" : "bg-primary/5 border-primary/20"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color} bg-muted`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm">{n.content}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {format(new Date(n.created_at), "dd MMM yyyy · HH:mm", { locale: fr })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {reviews?.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? "text-primary fill-primary" : "text-muted-foreground"} />
                    ))}
                  </div>
                  <p className="text-foreground text-sm mb-1">"{r.comment}"</p>
                  <p className="text-muted-foreground text-xs">
                    {(r as any).profile_name || "Anonyme"} — {r.is_approved ? "✅ Approuvé" : "⏳ En attente"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-xs text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!(r as any).is_featured}
                      onChange={async (e) => {
                        await supabase.from("reviews").update({ is_featured: e.target.checked }).eq("id", r.id);
                        queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
                        queryClient.invalidateQueries({ queryKey: ["featured_reviews"] });
                        toast.success(e.target.checked ? "Avis affiché en page d'accueil" : "Avis retiré de la page d'accueil");
                      }}
                    />
                    Page d'accueil
                  </label>
                  <Button
                    size="sm"
                    variant={r.is_approved ? "heroOutline" : "hero"}
                    onClick={async () => {
                      await supabase.from("reviews").update({ is_approved: !r.is_approved }).eq("id", r.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
                      toast.success(!r.is_approved ? "Avis approuvé" : "Avis masqué");
                    }}
                  >
                    {r.is_approved ? <X size={14} /> : <Check size={14} />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Supprimer cet avis ?")) return;
                      await supabase.from("reviews").delete().eq("id", r.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
                      toast.success("Avis supprimé");
                    }}
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <form onSubmit={addAppointmentType} className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Nom du type</label>
                <Input value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)} placeholder="Ex: RDV téléphonique" className="bg-background border-border" required />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Durée (min)</label>
                <Input type="number" min="5" value={newTypeDuration} onChange={(e) => setNewTypeDuration(e.target.value)} className="bg-background border-border w-24" required />
              </div>
              <Button variant="hero" size="sm" type="submit">
                <Plus size={14} className="mr-1" /> Créer
              </Button>
            </form>

            {appointmentTypes?.map((t: any) => (
              <div key={t.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag size={16} className="text-primary" />
                  <span className="text-foreground text-sm font-medium">{t.name}</span>
                  <span className="text-muted-foreground text-xs flex items-center gap-1">
                    <Clock size={12} /> {t.duration_minutes} min
                  </span>
                </div>
                <Button size="sm" variant="heroOutline" onClick={() => deleteAppointmentType(t.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
            {(!appointmentTypes || appointmentTypes.length === 0) && (
              <p className="text-muted-foreground text-center py-4">Aucun type de RDV créé</p>
            )}
          </TabsContent>

          <TabsContent value="slots" className="space-y-4">
            <RecurringSlotsForm appointmentTypes={appointmentTypes} />
            <form onSubmit={addSlot} className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Type de RDV</label>
                <select
                  value={slotTypeId}
                  onChange={(e) => {
                    setSlotTypeId(e.target.value);
                    // Auto-fill end time if start time is set
                    if (e.target.value && slotStart) {
                      const type = appointmentTypes?.find((t: any) => t.id === e.target.value);
                      if (type) {
                        const [h, m] = slotStart.split(":").map(Number);
                        const totalMin = h * 60 + m + type.duration_minutes;
                        setSlotEnd(`${Math.floor(totalMin / 60).toString().padStart(2, "0")}:${(totalMin % 60).toString().padStart(2, "0")}`);
                      }
                    }
                  }}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                >
                  <option value="">— Sans type —</option>
                  {appointmentTypes?.filter((t: any) => t.is_active).map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.duration_minutes} min)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Date</label>
                <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} className="bg-background border-border" required />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Début</label>
                <Input type="time" value={slotStart} onChange={(e) => {
                  setSlotStart(e.target.value);
                  // Auto-calculate end if type selected
                  if (slotTypeId && e.target.value) {
                    const type = appointmentTypes?.find((t: any) => t.id === slotTypeId);
                    if (type) {
                      const [h, m] = e.target.value.split(":").map(Number);
                      const totalMin = h * 60 + m + type.duration_minutes;
                      setSlotEnd(`${Math.floor(totalMin / 60).toString().padStart(2, "0")}:${(totalMin % 60).toString().padStart(2, "0")}`);
                    }
                  }
                }} className="bg-background border-border" required />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Fin {slotTypeId ? "(auto)" : ""}</label>
                <Input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} className="bg-background border-border" required readOnly={!!slotTypeId} />
              </div>
              <Button variant="hero" size="sm" type="submit">
                <Plus size={14} className="mr-1" /> Ajouter
              </Button>
            </form>

            {slots?.map((s: any) => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm">
                    {s.date} — {s.start_time?.toString().slice(0, 5)} à {s.end_time?.toString().slice(0, 5)}
                    {s.is_available ? " ✅" : " ❌ Réservé"}
                  </span>
                  {s.appointment_types && (
                    <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                      {(s.appointment_types as any).name}
                    </span>
                  )}
                </div>
                <Button size="sm" variant="heroOutline" onClick={() => deleteSlot(s.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {/* Admin book for client form */}
            <form onSubmit={adminBookForClient} className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Client</label>
                <select
                  value={bookForClientId}
                  onChange={(e) => setBookForClientId(e.target.value)}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                  required
                >
                  <option value="">Choisir un client...</option>
                  {clients?.map((c: any) => (
                    <option key={c.user_id} value={c.user_id}>{c.full_name || "Sans nom"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Créneau disponible</label>
                <select
                  value={bookForSlotId}
                  onChange={(e) => setBookForSlotId(e.target.value)}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground"
                  required
                >
                  <option value="">Choisir un créneau...</option>
                  {slots?.filter((s: any) => s.is_available).map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.date} — {s.start_time?.toString().slice(0, 5)} à {s.end_time?.toString().slice(0, 5)}
                      {s.appointment_types ? ` (${(s.appointment_types as any).name})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="hero" size="sm" type="submit">
                <Plus size={14} className="mr-1" /> Réserver pour le client
              </Button>
            </form>

            {bookings?.map((b) => {
              const isRescheduling = rescheduleBookingId === b.id;
              const availableSlots = slots?.filter((s: any) => s.is_available && s.id !== b.time_slot_id) || [];
              return (
                <div key={b.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-foreground text-sm font-medium">{(b as any).profiles?.full_name || "Client"}</p>
                      <p className="text-muted-foreground text-xs">
                        📞 {(b as any).profiles?.phone || "—"} | 📅 {(b.time_slots as any)?.date} {(b.time_slots as any)?.start_time?.toString().slice(0, 5)}-{(b.time_slots as any)?.end_time?.toString().slice(0, 5)}
                      </p>
                      <p className={`text-xs font-medium mt-1 ${
                        b.status === "confirmed" ? "text-green-500" 
                        : b.status === "cancelled" ? "text-destructive" 
                        : b.status === "reschedule_pending" ? "text-yellow-500"
                        : "text-muted-foreground"
                      }`}>
                        {b.status === "confirmed" ? "✅ Confirmé" 
                         : b.status === "cancelled" ? "❌ Annulé" 
                         : b.status === "reschedule_pending" ? "⏳ Report proposé — en attente du client"
                         : b.status}
                      </p>
                      {b.status === "reschedule_pending" && (b as any).proposed_slot && (
                        <p className="text-primary text-xs mt-1">
                          → Nouveau créneau : {(b as any).proposed_slot.date} {(b as any).proposed_slot.start_time?.toString().slice(0, 5)}-{(b as any).proposed_slot.end_time?.toString().slice(0, 5)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {b.status === "confirmed" && (
                        <>
                          <Button
                            size="sm"
                            variant="heroOutline"
                            onClick={() => {
                              setRescheduleBookingId(isRescheduling ? null : b.id);
                              setRescheduleSlotId("");
                            }}
                          >
                            <CalendarClock size={14} className="mr-1" /> Décaler
                          </Button>
                          <Button
                            size="sm"
                            variant="heroOutline"
                            className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                            onClick={() => cancelBooking(b.id)}
                          >
                            <X size={14} className="mr-1" /> Annuler
                          </Button>
                        </>
                      )}
                      {b.status === "reschedule_pending" && (
                        <Button
                          size="sm"
                          variant="heroOutline"
                          className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                          onClick={() => cancelBooking(b.id)}
                        >
                          <X size={14} className="mr-1" /> Annuler
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="heroOutline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={async () => {
                          if (!confirm("Supprimer définitivement ce rendez-vous et le créneau associé ?")) return;
                          await supabase.from("bookings").delete().eq("id", b.id);
                          await supabase.from("time_slots").delete().eq("id", b.time_slot_id);
                          queryClient.invalidateQueries({ queryKey: ["admin_bookings"] });
                          queryClient.invalidateQueries({ queryKey: ["admin_client_bookings"] });
                          queryClient.invalidateQueries({ queryKey: ["admin_slots"] });
                          toast.success("Rendez-vous et créneau supprimés");
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>

                  {isRescheduling && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <p className="text-foreground text-xs font-medium">Proposer un nouveau créneau :</p>
                      {availableSlots.length === 0 ? (
                        <p className="text-muted-foreground text-xs">Aucun créneau disponible. Ajoute-en d'abord dans l'onglet Créneaux.</p>
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
                                {s.date} — {s.start_time?.toString().slice(0, 5)} à {s.end_time?.toString().slice(0, 5)}
                              </option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="hero"
                              disabled={!rescheduleSlotId}
                              onClick={async () => {
                                await supabase.from("bookings").update({
                                  status: "reschedule_pending",
                                  proposed_slot_id: rescheduleSlotId,
                                }).eq("id", b.id);
                                toast.success("Proposition de report envoyée au client");
                                setRescheduleBookingId(null);
                                setRescheduleSlotId("");
                                queryClient.invalidateQueries({ queryKey: ["admin_bookings"] });
                              }}
                            >
                              <Send size={14} className="mr-1" /> Proposer
                            </Button>
                            <Button size="sm" variant="heroOutline" onClick={() => setRescheduleBookingId(null)}>
                              Annuler
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {(!bookings || bookings.length === 0) && <p className="text-muted-foreground text-center">Aucune réservation</p>}
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            {/* Capacity control */}
            <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <span className="text-foreground text-sm font-medium">Capacité max :</span>
              </div>
              <Input
                type="number"
                min={1}
                className="w-20 h-8 text-sm bg-background border-border"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                onBlur={(e) => updateMaxUsers(e.target.value)}
              />
              <span className="text-muted-foreground text-xs">
                {clients?.length || 0} / {maxUsers} clients inscrits
              </span>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                className="pl-9 bg-background border-border"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
            {clients?.filter((c: any) => {
              if (!clientSearch.trim()) return true;
              const q = clientSearch.toLowerCase();
              return (c.full_name || "").toLowerCase().includes(q) || (c.phone || "").includes(q) || (c.city || "").toLowerCase().includes(q);
            }).map((c: any) => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-foreground font-medium text-sm">
                    {c.full_name || "Sans nom"} — Inscrit le {format(new Date(c.created_at), "dd/MM/yyyy")}
                  </p>
                  <div className="flex gap-2">
                    <select
                      className="h-9 rounded-md border border-border bg-background text-foreground text-xs px-2"
                      value={c.assigned_plan_id || ""}
                      onChange={async (e) => {
                        const planId = e.target.value || null;
                        const updates: any = {
                          assigned_plan_id: planId,
                          has_active_subscription: !!planId,
                        };
                        // Si on assigne une formule (et qu'aucune date n'existe), on déclenche le pop-up
                        if (planId && !c.subscription_activated_at) {
                          updates.subscription_activated_at = new Date().toISOString();
                          updates.welcome_popup_dismissed = false;
                        }
                        // Si on retire la formule, on remet à zéro
                        if (!planId) {
                          updates.subscription_activated_at = null;
                        }
                        const { error } = await supabase.from("profiles").update(updates).eq("id", c.id);
                        if (error) { toast.error("Erreur"); return; }
                        queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                        toast.success(planId ? "Formule attribuée ✅" : "Formule retirée");
                      }}
                    >
                      <option value="">❌ Aucune formule</option>
                      {pricingPlans?.map((p: any) => (
                        <option key={p.id} value={p.id}>✅ {p.name} — {p.price}€</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="heroOutline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={deletingUser === c.user_id}
                      onClick={() => deleteClient(c.user_id, c.full_name)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  <div>
                    <label className="text-muted-foreground text-xs">👤 Nom</label>
                    <Input className="h-7 text-xs bg-background border-border" defaultValue={c.full_name || ""} onBlur={async (e) => {
                      await supabase.from("profiles").update({ full_name: e.target.value || null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                    }} />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">📞 Téléphone</label>
                    <Input className="h-7 text-xs bg-background border-border" defaultValue={c.phone || ""} onBlur={async (e) => {
                      await supabase.from("profiles").update({ phone: e.target.value || null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                    }} />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">🏙️ Ville</label>
                    <Input className="h-7 text-xs bg-background border-border" defaultValue={c.city || ""} onBlur={async (e) => {
                      await supabase.from("profiles").update({ city: e.target.value || null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                    }} />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">🎂 Âge</label>
                    <Input type="number" className="h-7 text-xs bg-background border-border" defaultValue={c.age || ""} onBlur={async (e) => {
                      await supabase.from("profiles").update({ age: e.target.value ? parseInt(e.target.value) : null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                    }} />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">⚧ Genre</label>
                    <Input className="h-7 text-xs bg-background border-border" defaultValue={c.gender || ""} placeholder="F / M / Autre" onBlur={async (e) => {
                      await supabase.from("profiles").update({ gender: e.target.value || null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                    }} />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">⚖️ Poids (kg)</label>
                    <Input type="number" className="h-7 text-xs bg-background border-border" defaultValue={c.weight || ""} onBlur={async (e) => {
                      await supabase.from("profiles").update({ weight: e.target.value ? parseFloat(e.target.value) : null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                    }} />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">📏 Taille (cm)</label>
                    <Input type="number" className="h-7 text-xs bg-background border-border" defaultValue={c.height || ""} onBlur={async (e) => {
                      await supabase.from("profiles").update({ height: e.target.value ? parseFloat(e.target.value) : null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                    }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-muted-foreground text-xs">💳 1er paiement</label>
                    <Input type="date" className="h-7 text-xs bg-background border-border" defaultValue={c.subscription_start_date || ""} onChange={async (e) => {
                      await supabase.from("profiles").update({ subscription_start_date: e.target.value || null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                    }} />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">💳 Prochain paiement</label>
                    <Input type="date" className="h-7 text-xs bg-background border-border" defaultValue={c.next_payment_date || ""} onChange={async (e) => {
                      await supabase.from("profiles").update({ next_payment_date: e.target.value || null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                    }} />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">📊 Google Sheet</label>
                    <Input type="url" placeholder="https://docs.google.com/..." className="h-7 text-xs bg-background border-border" defaultValue={c.google_sheet_url || ""} onBlur={async (e) => {
                      await supabase.from("profiles").update({ google_sheet_url: e.target.value || null }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                      toast.success("Mis à jour");
                    }} />
                  </div>
                </div>

                {/* Rappel paiement + accès Google Agenda du client */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/40">
                  <label className="inline-flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-primary"
                      defaultChecked={!!c.payment_reminder_active}
                      onChange={async (e) => {
                        await supabase
                          .from("profiles")
                          .update({ payment_reminder_active: e.target.checked })
                          .eq("id", c.id);
                        queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                        toast.success(
                          e.target.checked
                            ? "Rappel de paiement activé pour ce client"
                            : "Rappel de paiement désactivé"
                        );
                      }}
                    />
                    <BellRing size={12} className="text-primary" />
                    <span className="text-foreground font-medium">
                      Activer le rappel de paiement (popup côté client)
                    </span>
                  </label>
                  <Button
                    variant="heroOutline"
                    size="sm"
                    className="h-7 text-xs ml-auto"
                    onClick={() => window.open("https://calendar.google.com/calendar/u/0/r", "_blank", "noopener,noreferrer")}
                  >
                    <Calendar size={12} className="mr-1" /> Ouvrir Google Agenda
                  </Button>
                </div>

                {/* Client bookings */}
                {(() => {
                  const userBookings = clientBookings?.filter((b: any) => b.user_id === c.user_id) || [];
                  if (userBookings.length === 0) return (
                    <p className="text-muted-foreground text-xs italic">Aucun rendez-vous</p>
                  );
                  return (
                    <div className="space-y-1">
                      <label className="text-muted-foreground text-xs font-semibold">📅 Rendez-vous ({userBookings.length})</label>
                      {userBookings.map((b: any) => {
                        const slot = b.time_slots as any;
                        const isPast = slot && new Date(slot.date) < new Date(new Date().toDateString());
                        return (
                          <div key={b.id} className={`flex items-center gap-2 text-xs rounded px-2 py-1 ${isPast ? "bg-muted/30 text-muted-foreground" : "bg-primary/10 text-foreground"}`}>
                            <span>{slot?.date ? format(new Date(slot.date), "dd/MM/yyyy") : "—"}</span>
                            <span>{slot?.start_time?.toString().slice(0, 5)} - {slot?.end_time?.toString().slice(0, 5)}</span>
                            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                              b.status === "confirmed" ? "bg-green-500/20 text-green-400" :
                              b.status === "reschedule_pending" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {b.status === "confirmed" ? "Confirmé" : b.status === "reschedule_pending" ? "Report proposé" : b.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="messages">
            <div className="flex gap-4 h-[500px]">
              {/* Client list */}
              <div className="w-1/3 bg-card border border-border rounded-lg overflow-y-auto">
                {messageClients.length === 0 && (
                  <p className="text-muted-foreground text-sm p-4 text-center">Aucun message</p>
                )}
                {messageClients.map((clientId: string) => {
                  const client = clients?.find((c: any) => c.user_id === clientId);
                  const lastMsg = allMessages?.filter(
                    (m: any) => m.sender_id === clientId || m.receiver_id === clientId
                  ).slice(-1)[0];
                  const unread = allMessages?.filter(
                    (m: any) => m.sender_id === clientId && m.receiver_id === currentUserId && !m.is_read
                  ).length || 0;
                  return (
                    <button
                      key={clientId}
                      onClick={() => {
                        setSelectedClient(clientId);
                        // Mark as read
                        supabase.from("messages").update({ is_read: true })
                          .eq("sender_id", clientId).eq("receiver_id", currentUserId!).eq("is_read", false)
                          .then(() => queryClient.invalidateQueries({ queryKey: ["admin_messages"] }));
                      }}
                      className={`w-full text-left p-3 border-b border-border hover:bg-muted/50 transition-colors ${
                        selectedClient === clientId ? "bg-primary/10 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground">{client?.full_name || "Client"}</p>
                      <p className="text-xs text-muted-foreground truncate">{lastMsg?.content}</p>
                      {unread > 0 && (
                        <span className="inline-block mt-1 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                          {unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Chat */}
              <div className="flex-1 flex flex-col bg-card border border-border rounded-lg">
                {!selectedClient ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle size={40} className="mx-auto mb-2 text-primary/30" />
                      <p className="text-sm">Sélectionnez un client</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-3">
                        {selectedMessages.map((msg: any) => {
                          const isAdmin = msg.sender_id === currentUserId;
                          return (
                            <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                isAdmin
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted text-foreground rounded-bl-md"
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${isAdmin ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                  {format(new Date(msg.created_at), "HH:mm · dd MMM", { locale: fr })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={msgBottomRef} />
                      </div>
                    </ScrollArea>
                    <form onSubmit={sendAdminMsg} className="flex gap-2 p-3 border-t border-border">
                      <Input
                        value={adminMsg}
                        onChange={(e) => setAdminMsg(e.target.value)}
                        placeholder="Répondre..."
                        className="flex-1 bg-background border-border"
                        maxLength={1000}
                      />
                      <Button type="submit" variant="hero" size="icon" disabled={sendingMsg || !adminMsg.trim()}>
                        <Send size={18} />
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            {/* Description editing */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="text-foreground font-display text-lg">DESCRIPTION</h3>
              <Textarea
                value={aboutDesc}
                onChange={(e) => setAboutDesc(e.target.value)}
                rows={6}
                className="bg-background border-border text-foreground"
                placeholder="Décris-toi ici..."
              />
              <Button
                variant="hero"
                size="sm"
                onClick={async () => {
                  const { error } = await supabase
                    .from("site_settings")
                    .upsert({ key: "about_description", value: aboutDesc });
                  if (error) toast.error("Erreur");
                  else toast.success("Description mise à jour !");
                }}
              >
                <Check size={14} className="mr-1" /> Sauvegarder
              </Button>
            </div>

            {/* Media upload */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="text-foreground font-display text-lg">PHOTOS & VIDÉOS</h3>
              <div className="flex gap-3 items-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setUploadingMedia(true);
                      const currentCount = aboutMedia?.length || 0;
                      for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const ext = file.name.split(".").pop();
                        const fileName = `${Date.now()}_${i}.${ext}`;
                        const { error: upErr } = await supabase.storage
                          .from("about-media")
                          .upload(fileName, file);
                        if (upErr) {
                          toast.error(`Erreur upload: ${file.name}`);
                          continue;
                        }
                        const { data: urlData } = supabase.storage
                          .from("about-media")
                          .getPublicUrl(fileName);
                        const mediaType = file.type.startsWith("video") ? "video" : "image";
                        await supabase.from("about_media").insert({
                          url: urlData.publicUrl,
                          type: mediaType,
                          position: currentCount + i,
                        });
                      }
                      setUploadingMedia(false);
                      toast.success("Média(s) ajouté(s) !");
                      queryClient.invalidateQueries({ queryKey: ["admin_about_media"] });
                      queryClient.invalidateQueries({ queryKey: ["about_media"] });
                    }}
                  />
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Upload size={14} /> {uploadingMedia ? "Envoi..." : "Ajouter depuis la galerie"}
                  </div>
                </label>
              </div>

              {/* Media grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {aboutMedia?.map((m: any) => (
                  <div key={m.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-muted">
                    {m.type === "video" ? (
                      <video src={m.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="heroOutline"
                        className="text-white border-white/30 hover:bg-white/20"
                        onClick={async () => {
                          // Extract file name from URL
                          const urlParts = m.url.split("/");
                          const fileName = urlParts[urlParts.length - 1];
                          await supabase.storage.from("about-media").remove([fileName]);
                          await supabase.from("about_media").delete().eq("id", m.id);
                          queryClient.invalidateQueries({ queryKey: ["admin_about_media"] });
                          queryClient.invalidateQueries({ queryKey: ["about_media"] });
                          toast.success("Média supprimé");
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <span className="absolute top-1 left-1 text-[10px] bg-background/80 text-foreground px-1.5 py-0.5 rounded">
                      {m.type === "video" ? "🎬" : "📷"} #{m.position + 1}
                    </span>
                  </div>
                ))}
              </div>
              {(!aboutMedia || aboutMedia.length === 0) && (
                <p className="text-muted-foreground text-center py-4">Aucun média ajouté</p>
              )}
            </div>
          </TabsContent>

          {/* Services tab */}

          {/* Google Calendar */}
          <TabsContent value="gcal" className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              {gcalEmail ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-green-500" />
                    <span className="text-muted-foreground">
                      Connecté à : <strong className="text-foreground">{gcalEmail}</strong>
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSyncGcal} disabled={gcalSyncing}>
                      <RefreshCw size={14} className={`mr-2 ${gcalSyncing ? "animate-spin" : ""}`} />
                      {gcalSyncing ? "Synchronisation..." : "Synchroniser maintenant"}
                    </Button>
                    <Button variant="outline" onClick={handleConnectGcal} disabled={gcalConnecting}>
                      Changer de compte
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    La synchronisation enverra tous les créneaux disponibles et réservations futures vers votre Google Agenda.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Connectez votre compte Google pour synchroniser automatiquement vos créneaux et réservations avec Google Agenda.
                  </p>
                  <Button onClick={handleConnectGcal} disabled={gcalConnecting}>
                    <Calendar size={14} className="mr-2" />
                    {gcalConnecting ? "Connexion..." : "Connecter Google Agenda"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Formules PayPal */}
          <TabsContent value="formules" className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <Tag size={20} /> Tarifs & formules
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Modifie le contenu, le prix, l'image de fond, le lien PayPal et la mise en avant de chaque formule.
              </p>
              <PricingPlansManager />
            </div>
          </TabsContent>

          {/* Accueil & Logo */}
          <TabsContent value="home" className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <Image size={20} /> Page d'accueil & Logo
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Modifie les textes de la page d'accueil, le nom de la marque et les logos.
              </p>
              <HomeContentManager />
            </div>
          </TabsContent>

          {/* Management — liens utiles */}
          <TabsContent value="links" className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <Link2 size={20} /> Liens utiles
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Tous tes liens essentiels au même endroit : Google Sheets, Forms, PayPal,
                Docs, Loom… Ajoutes-en autant que tu veux.
              </p>
              <CustomLinksManager />
            </div>
          </TabsContent>
            </Tabs>
          );
        })()}
      </div>
    </div>
  );
};

export default Admin;
