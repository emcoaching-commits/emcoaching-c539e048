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

const COUNT = 60;
const SPEED = 80; // px/sec

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
    let obstacles: { x: number; y: number; w: number; h: number }[] = [];
    let obstacleTick = 0;

    const refreshObstacles = () => {
      const el = containerRef.current;
      if (!el) return;
      const cRect = el.getBoundingClientRect();
      const list: { x: number; y: number; w: number; h: number }[] = [];
      document.querySelectorAll<HTMLElement>("img, [data-icon-obstacle]").forEach((node) => {
        if (el.contains(node)) return; // skip our own (none, but safe)
        const r = node.getBoundingClientRect();
        if (r.width < 20 || r.height < 20) return;
        // Convert to container-local coords
        list.push({ x: r.left - cRect.left, y: r.top - cRect.top, w: r.width, h: r.height });
      });
      obstacles = list;
    };

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
    refreshObstacles();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { w, h } = getBounds();
      const bodies = bodiesRef.current;

      // Refresh obstacles every ~150ms (scroll/layout changes)
      obstacleTick += dt;
      if (obstacleTick > 0.15) { obstacleTick = 0; refreshObstacles(); }

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

        // Obstacle (image) bounce — treat icon as circle vs AABB
        const r = b.size / 2;
        const cx = b.x + r;
        const cy = b.y + r;
        for (const o of obstacles) {
          const closestX = Math.max(o.x, Math.min(cx, o.x + o.w));
          const closestY = Math.max(o.y, Math.min(cy, o.y + o.h));
          const dx = cx - closestX;
          const dy = cy - closestY;
          const d2 = dx * dx + dy * dy;
          if (d2 < r * r) {
            let nx: number, ny: number;
            if (d2 > 0.0001) {
              const d = Math.sqrt(d2);
              nx = dx / d;
              ny = dy / d;
              const push = r - d;
              b.x += nx * push;
              b.y += ny * push;
            } else {
              // Center inside rect — push along nearest edge
              const leftD = cx - o.x;
              const rightD = (o.x + o.w) - cx;
              const topD = cy - o.y;
              const botD = (o.y + o.h) - cy;
              const m = Math.min(leftD, rightD, topD, botD);
              if (m === leftD) { nx = -1; ny = 0; b.x = o.x - b.size; }
              else if (m === rightD) { nx = 1; ny = 0; b.x = o.x + o.w; }
              else if (m === topD) { nx = 0; ny = -1; b.y = o.y - b.size; }
              else { nx = 0; ny = 1; b.y = o.y + o.h; }
            }
            const vn = b.vx * nx + b.vy * ny;
            if (vn < 0) {
              b.vx -= 2 * vn * nx;
              b.vy -= 2 * vn * ny;
            }
          }
        }
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
      className="fixed inset-0 pointer-events-none overflow-hidden"
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
