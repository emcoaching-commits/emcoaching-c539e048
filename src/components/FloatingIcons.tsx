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
  { Icon: Dumbbell, size: 44, top: "8%", left: "5%", opacity: 0.32, duration: 7, delay: 1.2, rotate: -15 },
  { Icon: HeartPulse, size: 40, top: "22%", left: "90%", opacity: 0.30, duration: 8, delay: 0.3, rotate: 10 },
  { Icon: Footprints, size: 42, top: "45%", left: "3%", opacity: 0.32, duration: 6.5, delay: 2.1, rotate: 20 },
  { Icon: Flame, size: 38, top: "70%", left: "88%", opacity: 0.32, duration: 7.5, delay: 0.8, rotate: -8 },
  { Icon: Activity, size: 46, top: "15%", left: "70%", opacity: 0.28, duration: 9, delay: 1.5, rotate: 5 },
  { Icon: Zap, size: 36, top: "38%", left: "15%", opacity: 0.34, duration: 5.5, delay: 1.0, rotate: -25 },
  { Icon: Timer, size: 40, top: "60%", left: "78%", opacity: 0.30, duration: 8.5, delay: 2.8, rotate: 12 },
  { Icon: TrendingUp, size: 42, top: "82%", left: "22%", opacity: 0.30, duration: 6, delay: 1.0, rotate: -5 },
  { Icon: Trophy, size: 38, top: "5%", left: "42%", opacity: 0.30, duration: 7, delay: 3.2, rotate: 15 },
  { Icon: Apple, size: 40, top: "50%", left: "68%", opacity: 0.28, duration: 9.5, delay: 0.5, rotate: -10 },
  { Icon: Droplets, size: 36, top: "75%", left: "50%", opacity: 0.34, duration: 6, delay: 1.8, rotate: 8 },
  { Icon: Bike, size: 44, top: "30%", left: "35%", opacity: 0.30, duration: 8, delay: 2.5, rotate: -12 },
];

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
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
            <Icon size={size} strokeWidth={1.6} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingIcons;
