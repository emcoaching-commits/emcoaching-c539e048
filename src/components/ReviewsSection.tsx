import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ReviewsSection = () => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const { data: reviews } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
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

        {/* Reviews grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reviews?.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    className={idx < review.rating ? "text-primary fill-primary" : "text-muted-foreground"}
                  />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{review.comment}"</p>
              <p className="text-foreground text-sm font-medium">
                {(review.profiles as any)?.full_name || "Client"}
              </p>
            </motion.div>
          ))}
          {(!reviews || reviews.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center">Aucun avis pour le moment. Sois le premier !</p>
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
