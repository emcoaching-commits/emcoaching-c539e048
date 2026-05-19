import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ReviewsSection = () => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Affiche uniquement les avis "mis en avant" par Emma (max 6, grille 2x3)
  const { data: reviews } = useQuery({
    queryKey: ["featured_reviews"],
    queryFn: async () => {
      // Vue publique sécurisée : pas d'exposition des user_id
      const { data, error } = await (supabase as any)
        .from("public_reviews")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      // Avatars privés -> URL signée
      const enriched = await Promise.all(
        (data || []).map(async (r: any) => {
          let signedAvatar: string | null = null;
          if (r.author_avatar) {
            const { data: s } = await supabase.storage
              .from("avatars")
              .createSignedUrl(r.author_avatar, 3600);
            signedAvatar = s?.signedUrl || null;
          }
          return {
            ...r,
            full_name: r.author_name || "Cliente",
            avatar_signed_url: signedAvatar,
          };
        }),
      );
      return enriched;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("Connecte-toi pour laisser un avis");
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      rating,
      comment,
    });
    if (error) {
      toast.error("Erreur lors de l'envoi");
    } else {
      toast.success("Merci ! Ton avis sera publié après validation.");
      setComment("");
      setRating(5);
    }
    setSubmitting(false);
  };

  return (
    <section id="avis" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Ce qu'ils en pensent</p>
          <h2 className="font-display text-5xl sm:text-6xl text-gradient-blue">AVIS CLIENTS</h2>
        </motion.div>

        {/* Reviews grid : 2 lignes × 3 colonnes (max 6) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-6xl mx-auto">
          {reviews?.map((review: any, i: number) => {
            const initials = review.full_name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "?";
            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="card-hover group bg-card border border-border rounded-lg p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12 transition-transform duration-300 group-hover:scale-110">
                    {review.avatar_signed_url && (
                      <AvatarImage src={review.avatar_signed_url} alt={review.full_name} />
                    )}
                    <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-foreground text-sm font-medium">{review.full_name}</p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={14}
                          className={idx < review.rating ? "text-primary fill-primary" : "text-muted-foreground"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed italic">
                  «&nbsp;{review.comment}&nbsp;»
                </p>
              </motion.div>
            );
          })}
          {(!reviews || reviews.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center">
              Les premiers avis arrivent bientôt !
            </p>
          )}
        </div>

        {/* Submit review form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto bg-card border border-border rounded-lg p-8"
        >
          <h3 className="font-display text-2xl text-foreground mb-4 text-center">LAISSE TON AVIS</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center gap-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setRating(idx + 1)}
                >
                  <Star
                    size={28}
                    className={`transition-colors cursor-pointer ${
                      idx < rating ? "text-primary fill-primary" : "text-muted-foreground hover:text-primary/50"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Ton expérience avec Emma..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-background border-border min-h-[100px]"
              required
              maxLength={500}
            />
            <Button variant="hero" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Envoi..." : "Envoyer mon avis"}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default ReviewsSection;
