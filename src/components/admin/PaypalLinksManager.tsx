import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

const PaypalLinksManager = () => {
  const queryClient = useQueryClient();
  const [links, setLinks] = useState<Record<string, string>>({});

  const { data: plans } = useQuery({
    queryKey: ["admin_pricing_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("price");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (plans) {
      const init: Record<string, string> = {};
      for (const p of plans) {
        init[p.id] = (p as any).paypal_url || "";
      }
      setLinks(init);
    }
  }, [plans]);

  const handleSave = async (planId: string) => {
    const { error } = await supabase
      .from("pricing_plans")
      .update({ paypal_url: links[planId] || null } as any)
      .eq("id", planId);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Lien PayPal enregistré !");
      queryClient.invalidateQueries({ queryKey: ["admin_pricing_plans"] });
      queryClient.invalidateQueries({ queryKey: ["pricing_plans"] });
    }
  };

  return (
    <div className="space-y-4">
      {plans?.map((plan: any) => (
        <div key={plan.id} className="border border-border rounded-lg p-4 bg-background/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-display text-lg text-foreground">{plan.name}</h4>
              <p className="text-xs text-muted-foreground">{plan.price}€ / mois</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.paypal.com/..."
              value={links[plan.id] || ""}
              onChange={(e) => setLinks({ ...links, [plan.id]: e.target.value })}
              className="flex-1"
            />
            <Button onClick={() => handleSave(plan.id)} size="sm">
              <Save size={14} className="mr-1" /> Enregistrer
            </Button>
          </div>
          {plan.paypal_url && (
            <p className="text-xs text-muted-foreground mt-2 truncate">
              Lien actuel : <a href={plan.paypal_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{plan.paypal_url}</a>
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PaypalLinksManager;
