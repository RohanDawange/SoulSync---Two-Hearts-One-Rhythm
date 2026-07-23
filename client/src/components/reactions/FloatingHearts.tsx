import { useEffect, useRef, useCallback } from 'react';

interface Heart {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  rotation: number;
  drift: number;
}

const COLORS = ['#ec4899', '#a855f7', '#ef4444', '#f472b6', '#c084fc', '#fb7185'];

interface FloatingHeartsProps {
  trigger?: number;
}

export default function FloatingHearts({ trigger = 0 }: FloatingHeartsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heartsRef = useRef<Heart[]>([]);
  const frameRef = useRef<number>(0);

  const spawnHearts = useCallback(() => {
    const count = 12 + Math.floor(Math.random() * 8);
    const newHearts: Heart[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 50,
      size: 8 + Math.random() * 24,
      speed: 1 + Math.random() * 2.5,
      opacity: 0.7 + Math.random() * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      drift: (Math.random() - 0.5) * 1.5,
    }));
    heartsRef.current.push(...newHearts);
  }, []);

  useEffect(() => {
    if (trigger > 0) spawnHearts();
  }, [trigger, spawnHearts]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const hearts = heartsRef.current;

      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.y -= h.speed;
        h.x += h.drift;
        h.rotation += 0.5;
        h.opacity -= 0.004;

        if (h.opacity <= 0 || h.y < -100) {
          hearts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate((h.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, h.opacity);
        ctx.fillStyle = h.color;

        ctx.beginPath();
        ctx.moveTo(0, h.size * 0.3);
        ctx.bezierCurveTo(
          -h.size * 0.5, -h.size * 0.3,
          -h.size, h.size * 0.1,
          0, h.size * 0.7
        );
        ctx.bezierCurveTo(
          h.size, h.size * 0.1,
          h.size * 0.5, -h.size * 0.3,
          0, h.size * 0.3
        );
        ctx.fill();
        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      heartsRef.current = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
