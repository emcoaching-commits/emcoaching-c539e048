import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PlanningSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: slots } = useQuery({
    queryKey: ["time_slots", selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("time_slots")
        .select("*, appointment_types(name)")
        .eq("date", dateStr)
        .eq("is_available", true)
        .order("start_time");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDate,
  });

  const handleBook = async (slotId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("Connecte-toi pour réserver un créneau");
      navigate("/auth");
      return;
    }
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      time_slot_id: slotId,
    });
    if (error) {
      toast.error("Erreur lors de la réservation");
    } else {
      // Mark slot as unavailable
      await supabase.from("time_slots").update({ is_available: false }).eq("id", slotId);
      toast.success("Créneau réservé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["time_slots"] });
    }
  };

  return (
    <section id="planning" className="py-24 bg-gradient-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Réserve ton rendez-vous</p>
          <h2 className="font-display text-5xl sm:text-6xl text-gradient-blue">RDV EN LIGNE</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Choisis un créneau pour ton rendez-vous en visio avec Emma. Tous les accompagnements se font en ligne.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={fr}
              disabled={(date) => date < new Date()}
              className="bg-card border border-border rounded-lg p-4"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-3"
          >
            {!selectedDate && (
              <p className="text-muted-foreground text-center mt-8">
                Sélectionne une date pour voir les créneaux disponibles
              </p>
            )}
            {selectedDate && slots?.length === 0 && (
              <p className="text-muted-foreground text-center mt-8">
                Aucun créneau disponible ce jour
              </p>
            )}
            {slots?.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="text-primary" size={18} />
                  <span className="text-foreground font-medium">
                    {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                  </span>
                </div>
                <Button variant="hero" size="sm" onClick={() => handleBook(slot.id)}>
                  Réserver
                </Button>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlanningSection;
