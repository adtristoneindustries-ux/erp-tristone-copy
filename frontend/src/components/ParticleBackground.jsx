import { useEffect, useRef } from 'react';

// roleColors: admin → red, staff → green, student → blue
const ROLE_COLORS = {
  admin:   { r: 239, g: 68,  b: 68  },   // red-500
  staff:   { r: 16,  g: 185, b: 129 },   // emerald-500
  student: { r: 99,  g: 102, b: 241 },   // indigo-500
  default: { r: 99,  g: 102, b: 241 },
};

const ParticleBackground = ({ role = 'default' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const { r, g, b } = ROLE_COLORS[role] || ROLE_COLORS.default;
    const rgb = `${r},${g},${b}`;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cols = 12;
    const rows = 8;
    const nodes = [];
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= cols; col++) {
        nodes.push({
          xRatio: col / cols,
          yRatio: row / rows,
          pulse: Math.random() * Math.PI * 2,
          active: Math.random() > 0.55,
        });
      }
    }

    const hexagons = Array.from({ length: 7 }, (_, i) => ({
      xRatio: (i / 6) * 1.1 - 0.05,
      y: Math.random() * window.innerHeight,
      size: 40 + Math.random() * 60,
      speed: 0.15 + Math.random() * 0.2,
      opacity: 0.06 + Math.random() * 0.08,
      rotation: Math.random() * Math.PI,
    }));

    const drawHex = (x, y, size, rotation, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        i === 0
          ? ctx.moveTo(size * Math.cos(angle), size * Math.sin(angle))
          : ctx.lineTo(size * Math.cos(angle), size * Math.sin(angle));
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(${rgb},${opacity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    };

    const orbs = [
      { xR: 0.1,  yR: 0.15, radius: 320 },
      { xR: 0.9,  yR: 0.8,  radius: 300 },
      { xR: 0.5,  yR: 0.5,  radius: 260 },
      { xR: 0.85, yR: 0.1,  radius: 200 },
    ];

    const flowLines = [
      { row: 2, c1: 1, c2: 5,  axis: 'h' },
      { row: 4, c1: 3, c2: 9,  axis: 'h' },
      { row: 6, c1: 7, c2: 11, axis: 'h' },
      { col: 3,  r1: 1, r2: 5, axis: 'v' },
      { col: 7,  r1: 2, r2: 6, axis: 'v' },
      { col: 10, r1: 0, r2: 4, axis: 'v' },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;
      const w = canvas.width;
      const h = canvas.height;
      const cw = w / cols;
      const rh = h / rows;

      // Soft orbs
      orbs.forEach(orb => {
        const grd = ctx.createRadialGradient(
          orb.xR * w, orb.yR * h, 0,
          orb.xR * w, orb.yR * h, orb.radius
        );
        grd.addColorStop(0, `rgba(${rgb},0.10)`);
        grd.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(orb.xR * w, orb.yR * h, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid lines
      ctx.strokeStyle = `rgba(${rgb},0.08)`;
      ctx.lineWidth = 1;
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, h); ctx.stroke();
      }
      for (let row = 0; row <= rows; row++) {
        ctx.beginPath(); ctx.moveTo(0, row * rh); ctx.lineTo(w, row * rh); ctx.stroke();
      }

      // Animated data-flow lines
      const flowProgress = (t * 0.6) % 1;
      flowLines.forEach((fl, idx) => {
        const phase = (flowProgress + idx * 0.17) % 1;
        if (fl.axis === 'h') {
          const y = fl.row * rh;
          const x1 = fl.c1 * cw;
          const x2 = fl.c2 * cw;
          const cx = x1 + (x2 - x1) * phase;
          const grad = ctx.createLinearGradient(cx - 60, y, cx + 60, y);
          grad.addColorStop(0, `rgba(${rgb},0)`);
          grad.addColorStop(0.5, `rgba(${rgb},0.5)`);
          grad.addColorStop(1, `rgba(${rgb},0)`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},0.85)`;
          ctx.fill();
        } else {
          const x = fl.col * cw;
          const y1 = fl.r1 * rh;
          const y2 = fl.r2 * rh;
          const cy = y1 + (y2 - y1) * phase;
          const grad = ctx.createLinearGradient(x, cy - 60, x, cy + 60);
          grad.addColorStop(0, `rgba(${rgb},0)`);
          grad.addColorStop(0.5, `rgba(${rgb},0.5)`);
          grad.addColorStop(1, `rgba(${rgb},0)`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},0.85)`;
          ctx.fill();
        }
      });

      // Pulsing node dots
      nodes.forEach(node => {
        if (!node.active) return;
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.2 + node.pulse));
        const nx = node.xRatio * w;
        const ny = node.yRatio * h;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${pulse * 0.55})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(nx, ny, 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb},${pulse * 0.18})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Floating hexagons
      hexagons.forEach(hex => {
        hex.y -= hex.speed;
        hex.rotation += 0.003;
        if (hex.y + hex.size < 0) hex.y = canvas.height + hex.size;
        drawHex(hex.xRatio * w, hex.y, hex.size, hex.rotation, hex.opacity);
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [role]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleBackground;
