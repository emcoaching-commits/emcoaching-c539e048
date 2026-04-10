import { motion } from "framer-motion";
import { CheckCircle2, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const points = [
  "Spécialiste en transformation physique",
  "Approche bienveillante et motivante",
  "Suivi personnalisé et régulier",
];

const AboutSection = () => {
  const [activeMedia, setActiveMedia] = useState<string | null>(null);

  const { data: description } = useQuery({
    queryKey: ["about_description"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "about_description")
        .single();
      return data?.value || "";
    },
  });

  const { data: media } = useQuery({
    queryKey: ["about_media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_media")
        .select("*")
        .order("position");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="propos" className="py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">À propos</p>
            <h2 className="font-display text-5xl sm:text-6xl mb-6 text-gradient-blue">QUI SUIS-JE ?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
              {description || ""}
            </p>
            <div className="space-y-3 mb-8">
              {points.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary shrink-0" size={20} />
                  <span className="text-foreground text-sm">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Media gallery */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {media && media.length > 0 && (
              <>
                {/* Featured / active media */}
                {(() => {
                  const featured = activeMedia
                    ? media.find((m) => m.id === activeMedia) || media[0]
                    : media[0];
                  return featured.type === "video" ? (
                    <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-black">
                      <video
                        src={featured.url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-border aspect-[4/3] bg-card">
                      <img
                        src={featured.url}
                        alt="À propos"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })()}

                {/* Thumbnails */}
                {media.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {media.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setActiveMedia(m.id)}
                        className={`relative rounded-lg overflow-hidden border-2 aspect-square transition-all ${
                          (activeMedia === m.id || (!activeMedia && m.id === media[0].id))
                            ? "border-primary shadow-lg shadow-primary/20"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {m.type === "video" ? (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Play className="text-primary" size={20} />
                          </div>
                        ) : (
                          <img
                            src={m.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
