import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ArrowLeft, Trash2, Check, X, Plus, Send, MessageCircle } from "lucide-react";
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

  const toggleReview = async (id: string, approved: boolean) => {
    await supabase.from("reviews").update({ is_approved: approved }).eq("id", id);
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

        <Tabs defaultValue="reviews">
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger value="reviews">Avis ({reviews?.length || 0})</TabsTrigger>
            <TabsTrigger value="slots">Créneaux ({slots?.length || 0})</TabsTrigger>
            <TabsTrigger value="bookings">Réservations ({bookings?.length || 0})</TabsTrigger>
            <TabsTrigger value="clients">Clients ({clients?.length || 0})</TabsTrigger>
          </TabsList>

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
              <div key={c.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">{c.full_name || "Sans nom"}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      📞 {c.phone || "—"} | 🏙️ {c.city || "—"} | 🎂 {c.age ? `${c.age} ans` : "—"} | {c.gender || "—"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      ⚖️ {c.weight ? `${c.weight} kg` : "—"} | 📏 {c.height ? `${c.height} cm` : "—"} | Inscrit le {format(new Date(c.created_at), "dd/MM/yyyy")}
                    </p>
                  </div>
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
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
