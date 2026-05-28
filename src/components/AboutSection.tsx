import { motion } from "framer-motion";
import { CheckCircle2, Play, Heart, Target, Sparkles, Award, Users, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const points = [
  "Spécialiste en transformation physique",
  "Approche bienveillante et motivante",
  "Suivi personnalisé et régulier",
];

const journey = [
  {
    icon: Flame,
    title: "Ma passion devenue métier",
    text:
      "Le sport a changé ma vie. Après des années à m'entraîner et à expérimenter sur moi-même, j'ai décidé d'en faire mon métier pour transmettre cette énergie et accompagner d'autres femmes et hommes vers leur meilleure version.",
  },
  {
    icon: Award,
    title: "Formée et certifiée",
    text:
      "Coach sportive diplômée et formée en nutrition, je me forme en continu pour t'offrir un accompagnement à jour, basé sur la science du sport, du mouvement et de l'alimentation — sans régime restrictif ni méthode miracle.",
  },
  {
    icon: Heart,
    title: "Une approche bienveillante",
    text:
      "Je crois qu'on progresse mieux dans la bienveillance que dans la culpabilité. Mon rôle, c'est de te pousser sans te casser, de t'aider à aimer le processus autant que le résultat, et de construire avec toi des habitudes qui durent.",
  },
  {
    icon: Target,
    title: "Du sur-mesure, vraiment",
    text:
      "Chaque programme est construit pour toi : ton objectif, ton niveau, ton emploi du temps, ton matériel. Pas de copier-coller. Le programme évolue toutes les 6 semaines pour rester stimulant et efficace.",
  },
  {
    icon: Users,
    title: "Disponible et à l'écoute",
    text:
      "Tu n'es jamais seul·e. Je suis joignable pour répondre à tes questions, ajuster le programme, te remotiver quand c'est dur. On avance ensemble, à ton rythme, avec un cap clair.",
  },
  {
    icon: Sparkles,
    title: "Ma promesse",
    text:
      "Te faire (re)tomber amoureux·se du sport, te montrer que manger sainement peut être simple et bon, et te prouver que tu es capable de bien plus que ce que tu imagines.",
  },
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

        {/* Mon histoire — détails */}
        <div className="mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-3">
              Mon histoire & ma vision
            </p>
            <h3 className="font-display text-4xl sm:text-5xl text-gradient-blue">
              POURQUOI ME CHOISIR
            </h3>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {journey.map((j, i) => {
              const Icon = j.icon;
              return (
                <motion.div
                  key={j.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="card-hover relative rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center mb-4">
                    <Icon className="text-primary" size={22} />
                  </div>
                  <h4 className="font-display text-xl text-foreground mb-2">{j.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{j.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
