import { useEffect, useRef, useState } from "react";
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

interface IconBody {
  Icon: LucideIcon;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotate: number;
  vr: number;
  opacity: number;
}

const COUNT = 28;
const SPEED = 70; // px/sec

const FloatingIcons = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const bodiesRef = useRef<IconBody[]>([]);
  const [, setReady] = useState(0);

  // Init bodies once with random positions, velocities, icons
  if (bodiesRef.current.length === 0) {
    const bodies: IconBody[] = [];
    for (let i = 0; i < COUNT; i++) {
      const size = 28 + Math.round(Math.random() * 28); // 28-56
      const angle = Math.random() * Math.PI * 2;
      const speed = SPEED * (0.6 + Math.random() * 0.9);
      bodies.push({
        Icon: allIcons[i % allIcons.length],
        size,
        x: 50 + Math.random() * 1000,
        y: 50 + Math.random() * 600,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotate: Math.random() * 360,
        vr: (Math.random() - 0.5) * 60,
        opacity: 0.35 + Math.random() * 0.4,
      });
    }
    bodiesRef.current = bodies;
  }

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const getBounds = () => {
      const el = containerRef.current;
      if (!el) return { w: window.innerWidth, h: window.innerHeight };
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    };

    // Spread initial positions across actual container
    const { w, h } = getBounds();
    bodiesRef.current.forEach((b) => {
      b.x = Math.random() * Math.max(100, w - b.size);
      b.y = Math.random() * Math.max(100, h - b.size);
    });
    setReady((n) => n + 1);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { w, h } = getBounds();
      const bodies = bodiesRef.current;

      // Move
      for (const b of bodies) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rotate += b.vr * dt;
        // Wall bounce
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        if (b.x + b.size > w) { b.x = w - b.size; b.vx = -Math.abs(b.vx); }
        if (b.y + b.size > h) { b.y = h - b.size; b.vy = -Math.abs(b.vy); }
      }

      // Circle-circle collisions
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const c = bodies[j];
          const ra = a.size / 2;
          const rc = c.size / 2;
          const ax = a.x + ra;
          const ay = a.y + ra;
          const cx = c.x + rc;
          const cy = c.y + rc;
          const dx = cx - ax;
          const dy = cy - ay;
          const dist2 = dx * dx + dy * dy;
          const minD = ra + rc;
          if (dist2 > 0 && dist2 < minD * minD) {
            const dist = Math.sqrt(dist2);
            const nx = dx / dist;
            const ny = dy / dist;
            // Separate
            const overlap = (minD - dist) / 2;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            c.x += nx * overlap;
            c.y += ny * overlap;
            // Elastic exchange along normal (equal mass)
            const va = a.vx * nx + a.vy * ny;
            const vc = c.vx * nx + c.vy * ny;
            const diff = vc - va;
            a.vx += diff * nx;
            a.vy += diff * ny;
            c.vx -= diff * nx;
            c.vy -= diff * ny;
            a.vr = (Math.random() - 0.5) * 120;
            c.vr = (Math.random() - 0.5) * 120;
          }
        }
      }

      // Apply to DOM via refs
      for (let i = 0; i < bodies.length; i++) {
        const node = refs.current[i];
        if (!node) continue;
        const b = bodies[i];
        node.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rotate}deg)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame((t) => { last = t; tick(t); });

    const onResize = () => {
      const { w, h } = getBounds();
      for (const b of bodiesRef.current) {
        if (b.x + b.size > w) b.x = Math.max(0, w - b.size);
        if (b.y + b.size > h) b.y = Math.max(0, h - b.size);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {bodiesRef.current.map((b, i) => {
        const Icon = b.Icon;
        return (
          <div
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className="absolute top-0 left-0 text-primary will-change-transform"
            style={{
              opacity: b.opacity,
              transform: `translate3d(${b.x}px, ${b.y}px, 0)`,
            }}
          >
            <Icon size={b.size} strokeWidth={1.6} />
          </div>
        );
      })}
    </div>
  );
};

export default FloatingIcons;
