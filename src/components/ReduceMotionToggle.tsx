import { useEffect, useState } from "react";
import { Sparkles, SparklesIcon } from "lucide-react";

const KEY = "reduce-motion";

const ReduceMotionToggle = () => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY) === "1";
    setReduced(stored);
    document.documentElement.classList.toggle("reduce-motion", stored);
  }, []);

  const toggle = () => {
    const next = !reduced;
    setReduced(next);
    localStorage.setItem(KEY, next ? "1" : "0");
    document.documentElement.classList.toggle("reduce-motion", next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={reduced ? "Réactiver les animations" : "Réduire les animations"}
      aria-label={reduced ? "Réactiver les animations" : "Réduire les animations"}
      aria-pressed={reduced}
      className="fixed bottom-6 right-24 z-50 w-11 h-11 rounded-full bg-card/90 backdrop-blur border border-border text-foreground hover:border-primary/50 hover:text-primary flex items-center justify-center shadow-md transition-all hover:scale-110"
    >
      {reduced ? <SparklesIcon className="w-5 h-5 opacity-40" /> : <Sparkles className="w-5 h-5" />}
    </button>
  );
};

export default ReduceMotionToggle;
