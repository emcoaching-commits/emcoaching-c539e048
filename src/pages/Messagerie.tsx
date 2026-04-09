import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Navbar from "@/components/Navbar";

const Messagerie = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      setUser(user);

      // Find admin user id
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin")
        .limit(1);
      if (adminRole && adminRole.length > 0) {
        setAdminId(adminRole[0].user_id);
      }

      // Fetch messages
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: true });
      setMessages(data || []);

      // Mark unread messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);
    };
    init();
  }, [navigate]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("user-messages")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          setMessages((prev) => [...prev, msg]);
          // Auto mark as read if we're the receiver
          if (msg.receiver_id === user.id) {
            supabase.from("messages").update({ is_read: true }).eq("id", msg.id);
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminId || !user) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: adminId,
      content: newMessage.trim(),
    });
    if (error) toast.error("Erreur d'envoi");
    else setNewMessage("");
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container pt-24 pb-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col h-[calc(100vh-8rem)]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
              <span className="font-display text-lg text-primary">E</span>
            </div>
            <div>
              <h1 className="font-display text-xl text-foreground">Emma</h1>
              <p className="text-xs text-muted-foreground">Votre coach sportive</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 rounded-xl border border-border bg-card/50 p-4">
            <div className="space-y-3 min-h-full">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <MessageCircle size={48} className="mb-3 text-primary/30" />
                  <p className="text-sm">Envoyez votre premier message à Emma !</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {format(new Date(msg.created_at), "HH:mm · dd MMM", { locale: fr })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-2 mt-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un message..."
              className="flex-1 bg-card border-border"
              maxLength={1000}
            />
            <Button type="submit" variant="hero" size="icon" disabled={sending || !newMessage.trim()}>
              <Send size={18} />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Messagerie;
