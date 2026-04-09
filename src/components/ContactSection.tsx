import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Mail, Phone, MessageCircle } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-gradient-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Prête à commencer ?</p>
          <h2 className="font-display text-5xl sm:text-6xl text-gradient-blue">CONTACTE-MOI</h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Input placeholder="Prénom" className="bg-card border-border" />
              <Input placeholder="Email" type="email" className="bg-card border-border" />
            </div>
            <Input placeholder="Sujet" className="bg-card border-border" />
            <Textarea placeholder="Ton message..." className="bg-card border-border min-h-[140px]" />
            <Button variant="hero" size="lg" className="w-full py-6">
              Envoyer le message
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="text-primary" size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a href="mailto:emma.berlin@hotmail.com" className="text-foreground font-medium hover:text-primary transition-colors">emma.berlin@hotmail.com</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="text-primary" size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="text-foreground font-medium">06 70 61 96 28</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="text-primary" size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <a href="https://wa.me/33670619628" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-primary transition-colors">06 70 61 96 28</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Instagram className="text-primary" size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instagram</p>
                <a href="https://instagram.com/emma_berlin1" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-primary transition-colors">@emma_berlin1</a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
