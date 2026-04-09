import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ArrowLeft, Trash2, Check, X, Plus, Send, MessageCircle, Bell, UserPlus, RefreshCw, AlertTriangle, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // New slot form
  const [slotDate, setSlotDate] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");

  // Messaging
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [adminMsg, setAdminMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const msgBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
      if (!data || data.length === 0) { navigate("/"); toast.error("Accès refusé"); return; }
      setIsAdmin(true);
      setCurrentUserId(user.id);
    };
    check();
  }, [navigate]);

  // Reviews
  const { data: reviews } = useQuery({
    queryKey: ["admin_reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*, profiles(full_name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Time slots
  const { data: slots } = useQuery({
    queryKey: ["admin_slots"],
    queryFn: async () => {
      const { data, error } = await supabase.from("time_slots").select("*").order("date").order("start_time");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Bookings
  const { data: bookings } = useQuery({
    queryKey: ["admin_bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*, profiles(full_name, phone), time_slots(date, start_time, end_time)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // Clients
  const { data: clients } = useQuery({
    queryKey: ["admin_clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
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

  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
    queryClient.invalidateQueries({ queryKey: ["admin_notifications"] });
  };

  // Realtime notifications
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel("admin-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin_notifications"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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

  // Realtime for admin messages
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel("admin-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin_messages"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
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


    const toggleReview = async (id: string, approved: boolean) => {
    queryClient.invalidateQueries({ queryKey: ["admin_reviews"] });
    toast.success(approved ? "Avis approuvé" : "Avis masqué");
  };

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("time_slots").insert({
      date: slotDate,
      start_time: slotStart,
      end_time: slotEnd,
    });
    if (error) toast.error("Erreur");
    else {
      toast.success("Créneau ajouté");
      setSlotDate(""); setSlotStart(""); setSlotEnd("");
      queryClient.invalidateQueries({ queryKey: ["admin_slots"] });
    }
  };

  const deleteSlot = async (id: string) => {
    await supabase.from("time_slots").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin_slots"] });
    toast.success("Créneau supprimé");
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

        <Tabs defaultValue="notifications">
          <TabsList className="bg-card border border-border mb-6 flex-wrap">
            <TabsTrigger value="notifications" className="relative">
              <Bell size={14} className="mr-1" /> Activité
              {unreadCount > 0 && (
                <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews">Avis ({reviews?.length || 0})</TabsTrigger>
            <TabsTrigger value="slots">Créneaux ({slots?.length || 0})</TabsTrigger>
            <TabsTrigger value="bookings">Réservations ({bookings?.length || 0})</TabsTrigger>
            <TabsTrigger value="clients">Clients ({clients?.length || 0})</TabsTrigger>
            <TabsTrigger value="messages">
              <MessageCircle size={14} className="mr-1" /> Messages
            </TabsTrigger>
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
                    {(r.profiles as any)?.full_name || "Anonyme"} — {r.is_approved ? "✅ Approuvé" : "⏳ En attente"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant={r.is_approved ? "heroOutline" : "hero"} onClick={() => toggleReview(r.id, !r.is_approved)}>
                    {r.is_approved ? <X size={14} /> : <Check size={14} />}
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="slots" className="space-y-4">
            <form onSubmit={addSlot} className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Date</label>
                <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} className="bg-background border-border" required />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Début</label>
                <Input type="time" value={slotStart} onChange={(e) => setSlotStart(e.target.value)} className="bg-background border-border" required />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">Fin</label>
                <Input type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} className="bg-background border-border" required />
              </div>
              <Button variant="hero" size="sm" type="submit">
                <Plus size={14} className="mr-1" /> Ajouter
              </Button>
            </form>

            {slots?.map((s) => (
              <div key={s.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                <span className="text-foreground text-sm">
                  {s.date} — {s.start_time?.toString().slice(0, 5)} à {s.end_time?.toString().slice(0, 5)}
                  {s.is_available ? " ✅" : " ❌ Réservé"}
                </span>
                <Button size="sm" variant="heroOutline" onClick={() => deleteSlot(s.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {bookings?.map((b) => (
              <div key={b.id} className="bg-card border border-border rounded-lg p-4">
                <p className="text-foreground text-sm font-medium">{(b.profiles as any)?.full_name || "Client"}</p>
                <p className="text-muted-foreground text-xs">
                  📞 {(b.profiles as any)?.phone || "—"} | 📅 {(b.time_slots as any)?.date} {(b.time_slots as any)?.start_time?.toString().slice(0, 5)}-{(b.time_slots as any)?.end_time?.toString().slice(0, 5)} | Status: {b.status}
                </p>
              </div>
            ))}
            {(!bookings || bookings.length === 0) && <p className="text-muted-foreground text-center">Aucune réservation</p>}
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            {clients?.map((c: any) => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-foreground font-medium text-sm">
                    {c.full_name || "Sans nom"} — Inscrit le {format(new Date(c.created_at), "dd/MM/yyyy")}
                  </p>
                  <Button
                    size="sm"
                    variant={c.has_active_subscription ? "hero" : "heroOutline"}
                    onClick={async () => {
                      await supabase.from("profiles").update({ has_active_subscription: !c.has_active_subscription }).eq("id", c.id);
                      queryClient.invalidateQueries({ queryKey: ["admin_clients"] });
                      toast.success(c.has_active_subscription ? "Abonnement désactivé" : "Abonnement activé");
                    }}
                  >
                    {c.has_active_subscription ? "✅ Abonné" : "❌ Non abonné"}
                  </Button>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
