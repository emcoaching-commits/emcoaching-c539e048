import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Mail, Phone, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const ContactSection = () => {
  const { data: s } = useSiteSettings();
  const phoneDisplay = s?.contact_phone || "06 70 61 96 28";
  const phoneIntl = (s?.contact_phone_intl || "+33670619628").replace(/^\+/, "");
  const emailContact = s?.contact_email || "emmaberlin2611@gmail.com";
  const [firstName, setFirstName] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !emailAddr.trim() || !body.trim()) {
      toast.error("Merci de remplir au moins prénom, email et message.");
      return;
    }
    setSending(true);
    try {
      // Récupère l'admin (Emma) via la fonction sécurisée
      const { data: adminId, error: adminErr } = await supabase.rpc("get_admin_id");
      if (adminErr || !adminId) throw new Error("Impossible de joindre Emma pour le moment.");

      const { data: { user } } = await supabase.auth.getUser();
      const composed = `📩 NOUVEAU MESSAGE DE CONTACT\n\nDe : ${firstName.trim()}\nEmail : ${emailAddr.trim()}\nSujet : ${subject.trim() || "—"}\n\n${body.trim()}`;

      if (user) {
        // Visiteur connecté : envoi standard via la table messages
        const { error } = await supabase.from("messages").insert({
          sender_id: user.id,
          receiver_id: adminId,
          content: composed,
        });
        if (error) throw error;
        toast.success("Message envoyé à Emma ! Elle te répondra rapidement 💪");
        setFirstName(""); setEmailAddr(""); setSubject(""); setBody("");
      } else {
        // Visiteur non connecté : on ouvre son client mail prérempli
        window.location.href = `mailto:emmaberlin2611@gmail.com?subject=${encodeURIComponent(
          subject.trim() || "Contact site",
        )}&body=${encodeURIComponent(composed)}`;
        toast.info("Connecte-toi pour un échange instantané dans la messagerie !");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

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
            onSubmit={handleSubmit}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                placeholder="Prénom"
                className="bg-card border-border"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={50}
                required
              />
              <Input
                placeholder="Email"
                type="email"
                className="bg-card border-border"
                value={emailAddr}
                onChange={(e) => setEmailAddr(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            <Input
              placeholder="Sujet"
              className="bg-card border-border"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={150}
            />
            <Textarea
              placeholder="Ton message..."
              className="bg-card border-border min-h-[140px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              required
            />
            <Button variant="hero" size="lg" className="w-full py-6" disabled={sending} type="submit">
              {sending ? "Envoi..." : "Envoyer le message"}
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
                <a href={`mailto:${emailContact}`} className="text-foreground font-medium hover:text-primary transition-colors">{emailContact}</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="text-primary" size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="text-foreground font-medium">{phoneDisplay}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="text-primary" size={22} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">WhatsApp</p>
                <a href={`https://wa.me/${phoneIntl}`} target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-primary transition-colors">{phoneDisplay}</a>
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
