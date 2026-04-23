import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Repeat } from "lucide-react";

interface Props {
  appointmentTypes: any[] | undefined;
}

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
];

const RecurringSlotsForm = ({ appointmentTypes }: Props) => {
  const queryClient = useQueryClient();
  const [days, setDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState("60");
  const [typeId, setTypeId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [weeks, setWeeks] = useState("4");
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (d: number) => {
    setDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (days.length === 0) { toast.error("Choisis au moins un jour"); return; }
    setSubmitting(true);

    // Compute end of recurrence
    const start = new Date(startDate);
    const limit = endDate
      ? new Date(endDate)
      : new Date(start.getTime() + (parseInt(weeks) || 4) * 7 * 24 * 60 * 60 * 1000);

    // Compute end_time
    const dur = parseInt(duration) || 60;
    const [h, m] = startTime.split(":").map(Number);
    const totalMin = h * 60 + m + dur;
    const endTime = `${Math.floor(totalMin / 60).toString().padStart(2, "0")}:${(totalMin % 60).toString().padStart(2, "0")}`;

    const slotsToCreate: any[] = [];
    const cursor = new Date(start);
    while (cursor <= limit) {
      if (days.includes(cursor.getDay())) {
        slotsToCreate.push({
          date: cursor.toISOString().split("T")[0],
          start_time: startTime,
          end_time: endTime,
          appointment_type_id: typeId || null,
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (slotsToCreate.length === 0) {
      toast.error("Aucun créneau à créer");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("time_slots").insert(slotsToCreate);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success(`${slotsToCreate.length} créneau(x) récurrent(s) créé(s) !`);
      setDays([]);
      queryClient.invalidateQueries({ queryKey: ["admin_slots"] });
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-primary/30 rounded-lg p-4 space-y-3">
      <h3 className="text-foreground font-display text-lg flex items-center gap-2">
        <Repeat size={18} className="text-primary" /> Créneaux récurrents
      </h3>

      <div>
        <label className="text-muted-foreground text-xs block mb-1">Jours de la semaine</label>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => toggleDay(d.value)}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                days.includes(d.value)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/50"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-muted-foreground text-xs block mb-1">Heure début</label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label className="text-muted-foreground text-xs block mb-1">Durée (min)</label>
          <Input type="number" min="5" value={duration} onChange={(e) => setDuration(e.target.value)} required />
        </div>
        <div>
          <label className="text-muted-foreground text-xs block mb-1">Type de RDV (optionnel)</label>
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
          >
            <option value="">— Aucun —</option>
            {appointmentTypes?.filter((t: any) => t.is_active).map((t: any) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-muted-foreground text-xs block mb-1">Date de début</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div>
          <label className="text-muted-foreground text-xs block mb-1">Nb semaines (si pas de date fin)</label>
          <Input type="number" min="1" max="52" value={weeks} onChange={(e) => setWeeks(e.target.value)} />
        </div>
        <div>
          <label className="text-muted-foreground text-xs block mb-1">OU date de fin</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <Button type="submit" variant="hero" size="sm" disabled={submitting}>
        <Repeat size={14} className="mr-1" /> {submitting ? "Création..." : "Générer les créneaux"}
      </Button>
    </form>
  );
};

export default RecurringSlotsForm;