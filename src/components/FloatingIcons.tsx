import { motion } from "framer-motion";
import {
  Dumbbell,
  HeartPulse,
  Footprints,
  Flame,
  Activity,
  Zap,
  Timer,
  TrendingUp,
  Trophy,
  Apple,
  Droplets,
  Bike,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FloatingIconItem {
  Icon: LucideIcon;
  size: number;
  top: string;
  left: string;
  opacity: number;
  duration: number;
  delay: number;
  rotate: number;
}

const icons: FloatingIconItem[] = [
  { Icon: Dumbbell, size: 28, top: "12%", left: "6%", opacity: 0.18, duration: 7, delay: 1.2, rotate: -15 },
  { Icon: HeartPulse, size: 24, top: "30%", left: "92%", opacity: 0.15, duration: 8, delay: 0.3, rotate: 10 },
  { Icon: Footprints, size: 26, top: "55%", left: "4%", opacity: 0.18, duration: 6.5, delay: 2.1, rotate: 20 },
  { Icon: Flame, size: 22, top: "78%", left: "88%", opacity: 0.18, duration: 7.5, delay: 0.8, rotate: -8 },
  { Icon: Activity, size: 30, top: "18%", left: "75%", opacity: 0.15, duration: 9, delay: 1.5, rotate: 5 },
  { Icon: Zap, size: 20, top: "42%", left: "12%", opacity: 0.20, duration: 5.5, delay: 1.0, rotate: -25 },
  { Icon: Timer, size: 24, top: "65%", left: "80%", opacity: 0.18, duration: 8.5, delay: 2.8, rotate: 12 },
  { Icon: TrendingUp, size: 26, top: "85%", left: "25%", opacity: 0.18, duration: 6, delay: 1.0, rotate: -5 },
  { Icon: Trophy, size: 22, top: "8%", left: "45%", opacity: 0.18, duration: 7, delay: 3.2, rotate: 15 },
  { Icon: Apple, size: 24, top: "48%", left: "70%", opacity: 0.15, duration: 9.5, delay: 0.5, rotate: -10 },
  { Icon: Droplets, size: 20, top: "72%", left: "55%", opacity: 0.20, duration: 6, delay: 1.8, rotate: 8 },
  { Icon: Bike, size: 26, top: "35%", left: "30%", opacity: 0.18, duration: 8, delay: 2.5, rotate: -12 },
];

const FloatingIcons = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {icons.map((item, i) => {
        const { Icon, size, top, left, opacity, duration, delay, rotate } = item;
        return (
          <motion.div
            key={i}
            className="absolute text-primary"
            style={{
              top,
              left,
              opacity,
              rotate: `${rotate}deg`,
            }}
            animate={{
              y: [0, -14, 0],
              opacity: [opacity, opacity * 2.2, opacity],
              rotate: [rotate, rotate + 4, rotate],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <Icon size={size} strokeWidth={1.2} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingIcons;
