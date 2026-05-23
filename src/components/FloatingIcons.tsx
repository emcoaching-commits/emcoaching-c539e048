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
  Sparkles,
  Star,
  Target,
  Award,
  Sunrise,
  Moon,
  Leaf,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FloatingIconItem {
  Icon: LucideIcon;
  size: number;
  top: string;
  left: string;
  opacity: number;
  durationY: number;
  durationX: number;
  delay: number;
  rotate: number;
  blur?: number;
}

const allIcons: LucideIcon[] = [
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
  Sparkles,
  Star,
  Target,
  Award,
  Sunrise,
  Moon,
  Leaf,
  Sun,
];

const generateIcons = (): FloatingIconItem[] => {
  const items: FloatingIconItem[] = [];
  const positions = [
    { top: "2%", left: "8%" },
    { top: "5%", left: "25%" },
    { top: "3%", left: "48%" },
    { top: "6%", left: "72%" },
    { top: "4%", left: "92%" },
    { top: "15%", left: "5%" },
    { top: "18%", left: "35%" },
    { top: "12%", left: "60%" },
    { top: "16%", left: "85%" },
    { top: "28%", left: "12%" },
    { top: "25%", left: "45%" },
    { top: "30%", left: "78%" },
    { top: "22%", left: "95%" },
    { top: "38%", left: "3%" },
    { top: "35%", left: "28%" },
    { top: "42%", left: "55%" },
    { top: "40%", left: "88%" },
    { top: "50%", left: "18%" },
    { top: "48%", left: "42%" },
    { top: "52%", left: "68%" },
    { top: "55%", left: "92%" },
    { top: "62%", left: "8%" },
    { top: "65%", left: "32%" },
    { top: "60%", left: "58%" },
    { top: "68%", left: "82%" },
    { top: "75%", left: "15%" },
    { top: "72%", left: "48%" },
    { top: "78%", left: "72%" },
    { top: "82%", left: "5%" },
    { top: "85%", left: "38%" },
    { top: "88%", left: "62%" },
    { top: "92%", left: "88%" },
    { top: "95%", left: "22%" },
    { top: "90%", left: "50%" },
    { top: "8%", left: "18%" },
    { top: "14%", left: "78%" },
    { top: "32%", left: "65%" },
    { top: "44%", left: "22%" },
    { top: "58%", left: "48%" },
    { top: "70%", left: "8%" },
    { top: "80%", left: "55%" },
  ];

  positions.forEach((pos, i) => {
    const Icon = allIcons[i % allIcons.length];
    const sizeBase = 28 + Math.random() * 36; // 28 to 64
    const size = Math.round(sizeBase);
    const opacity = 0.15 + Math.random() * 1.35; // 0.15 to 0.50
    const blur = Math.random() > 0.6 ? 0 : 1 + Math.random() * 2;
    items.push({
      Icon,
      size,
      top: pos.top,
      left: pos.left,
      opacity: parseFloat(opacity.toFixed(2)),
      durationY: 4 + Math.random() * 5, // 4 to 9
      durationX: 5 + Math.random() * 6, // 5 to 11
      delay: Math.random() * 4,
      rotate: Math.floor(Math.random() * 360) - 180,
      blur,
    });
  });

  return items;
};

const icons = generateIcons();

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {icons.map((item, i) => {
        const { Icon, size, top, left, opacity, durationY, durationX, delay, rotate, blur } = item;
        return (
          <motion.div
            key={i}
            className="absolute text-primary"
            style={{
              top,
              left,
              opacity,
              rotate: `${rotate}deg`,
              filter: blur ? `blur(${blur}px)` : undefined,
            }}
            animate={{
              y: [0, -28, 0, 14, 1],
              x: [0, 12, -8, 6, 0],
              opacity: [opacity * 0.6, opacity * 1.6, opacity * 0.8, opacity * 1.4, opacity],
              rotate: [rotate, rotate + 12, rotate - 8, rotate + 5, rotate],
            }}
            transition={{
              duration: durationY,
              delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          >
            <Icon size={size} strokeWidth={1.5} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingIcons;
