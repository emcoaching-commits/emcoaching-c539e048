import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ClipboardList, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuestionnaireSection = () => {
  const navigate = useNavigate();
  return (
    <section id="questionnaire" className="py-24 bg-gradient-dark">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-8 sm:p-12 text-center"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
              <ClipboardList size={32} className="text-primary" />
            </div>

            <div>
              <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Questionnaire de découverte</p>
              <h2 className="font-display text-4xl sm:text-5xl text-gradient-blue mb-4">APPRENDS-MOI À TE CONNAÎTRE</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Grâce à ce questionnaire, je vais apprendre à te connaître pour mieux t'aider et adapter au mieux ton suivi personnalisé.
              </p>
            </div>

            <Button
              variant="hero"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => navigate("/questionnaire")}
            >
              Remplir le questionnaire <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuestionnaireSection;
