import React, { useEffect, useRef } from 'react';

interface ThreeDBackgroundProps {
  darkMode?: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  phase: number;
}

interface WireframeLine {
  p1Idx: number;
  p2Idx: number;
}

export default function ThreeDBackground({ darkMode = true }: ThreeDBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic sizing helper
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to [-1, 1]
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Generate 3D point network
    const nodeCount = 55;
    const nodes: Point3D[] = [];
    const colors = darkMode
      ? ['#06b6d4', '#a855f7', '#6366f1', '#3b82f6'] // Cyan, Purple, Indigo, Blue
      : ['#0891b2', '#7c3aed', '#4f46e5', '#2563eb']; // Richer variants for high-contrast light mode

    for (let i = 0; i < nodeCount; i++) {
      // Position nodes in a 3D volume
      const radius = 250 + Math.random() * 300;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.5 + Math.random() * 2.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        speedZ: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Generate concentric 3D Gyroscope Rings
    const ringPoints: Point3D[][] = [];
    const ringCount = 3;
    const pointsPerRing = 48;
    const ringRadii = [180, 240, 300];

    for (let r = 0; r < ringCount; r++) {
      const ring: Point3D[] = [];
      const radius = ringRadii[r];
      for (let p = 0; p < pointsPerRing; p++) {
        const angle = (p / pointsPerRing) * Math.PI * 2;
        // Place rings on different default orientations
        let x = 0;
        let y = 0;
        let z = 0;

        if (r === 0) {
          // Horizontal XY Ring
          x = radius * Math.cos(angle);
          y = radius * Math.sin(angle);
          z = 0;
        } else if (r === 1) {
          // Vertical YZ Ring
          x = 0;
          y = radius * Math.cos(angle);
          z = radius * Math.sin(angle);
        } else {
          // Diagonal Ring
          x = radius * Math.cos(angle) * Math.SQRT1_2;
          y = radius * Math.sin(angle);
          z = radius * Math.cos(angle) * Math.SQRT1_2;
        }

        ring.push({
          x,
          y,
          z,
          baseX: x,
          baseY: y,
          baseZ: z,
          color: r === 0 ? colors[0] : r === 1 ? colors[1] : colors[2],
          size: 1.2,
          speedX: 0,
          speedY: 0,
          speedZ: 0,
          phase: angle,
        });
      }
      ringPoints.push(ring);
    }

    // Animation variables
    let angleY = 0;
    let angleX = 0;
    const focalLength = 400; // 3D Camera depth zoom factor

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse damping
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Rotate camera angles slowly, influenced by mouse coordinates
      angleY += 0.0012 + mouse.x * 0.0008;
      angleX += 0.0006 + mouse.y * 0.0006;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Projection and sorting arrays to handle correct depth layering
      interface ProjectedElement {
        type: 'node' | 'ringPoint' | 'ringLine' | 'connection';
        z: number;
        draw: () => void;
      }
      const drawQueue: ProjectedElement[] = [];

      // 1. Process standard floating nodes
      const projectedNodes: { px: number; py: number; pz: number; node: Point3D }[] = [];

      nodes.forEach((node) => {
        // Drift movement
        node.phase += 0.004;
        const drift = Math.sin(node.phase) * 12;
        
        // Base coordinate calculation
        let rx = node.baseX + Math.sin(node.phase * 0.5) * 20;
        let ry = node.baseY + Math.cos(node.phase * 0.7) * 20;
        let rz = node.baseZ + drift;

        // 3D Rotations
        // Rotate around Y
        let x1 = rx * cosY - rz * sinY;
        let z1 = rx * sinY + rz * cosY;

        // Rotate around X
        let y2 = ry * cosX - z1 * sinX;
        let z2 = ry * sinX + z1 * cosX;

        // Add minor camera offset relative to screen dimensions
        // Offset center slightly to the right to frame the dashboard perfectly
        const centerX = width * 0.55;
        const centerY = height * 0.5;

        // 3D Perspective Projection
        const scale = focalLength / Math.max(80, focalLength + z2);
        const px = x1 * scale + centerX;
        const py = y2 * scale + centerY;

        projectedNodes.push({ px, py, pz: z2, node });

        drawQueue.push({
          type: 'node',
          z: z2,
          draw: () => {
            // Radial glowing node effect
            const alpha = Math.max(0.15, Math.min(0.85, 1 - z2 / 600));
            ctx.beginPath();
            ctx.arc(px, py, node.size * scale, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.globalAlpha = alpha;
            ctx.fill();

            // Glow aura for key points
            if (node.size > 3) {
              ctx.beginPath();
              ctx.arc(px, py, node.size * scale * 3, 0, Math.PI * 2);
              ctx.fillStyle = node.color;
              ctx.globalAlpha = alpha * 0.15;
              ctx.fill();
            }
          },
        });
      });

      // 2. Process Gyroscope concentric ring points and connections
      ringPoints.forEach((ring, ringIdx) => {
        const ringProj: { px: number; py: number; pz: number }[] = [];
        
        // Individual ring specific spin
        const ringAngleOffset = angleY * (ringIdx === 0 ? 1.5 : ringIdx === 1 ? -1 : 0.8);
        const cosR = Math.cos(ringAngleOffset);
        const sinR = Math.sin(ringAngleOffset);

        ring.forEach((point) => {
          // Spin point inside its own ring layer first
          let rx = point.baseX;
          let ry = point.baseY;
          let rz = point.baseZ;

          if (ringIdx === 0) {
            rx = point.baseX * cosR - point.baseY * sinR;
            ry = point.baseX * sinR + point.baseY * cosR;
          } else if (ringIdx === 1) {
            ry = point.baseY * cosR - point.baseZ * sinR;
            rz = point.baseY * sinR + point.baseZ * cosR;
          } else {
            rx = point.baseX * cosR - point.baseZ * sinR;
            rz = point.baseX * sinR + point.baseZ * cosR;
          }

          // Global camera rotation
          let x1 = rx * cosY - rz * sinY;
          let z1 = rx * sinY + rz * cosY;

          let y2 = ry * cosX - z1 * sinX;
          let z2 = ry * sinX + z1 * cosX;

          const centerX = width * 0.55;
          const centerY = height * 0.5;

          const scale = focalLength / Math.max(80, focalLength + z2);
          const px = x1 * scale + centerX;
          const py = y2 * scale + centerY;

          ringProj.push({ px, py, pz: z2 });

          drawQueue.push({
            type: 'ringPoint',
            z: z2,
            draw: () => {
              const alpha = Math.max(0.1, Math.min(0.7, 1 - z2 / 500));
              ctx.beginPath();
              ctx.arc(px, py, point.size * scale, 0, Math.PI * 2);
              ctx.fillStyle = point.color;
              ctx.globalAlpha = alpha;
              ctx.fill();
            },
          });
        });

        // Add ring lines to drawQueue
        for (let j = 0; j < ringProj.length; j++) {
          const p1 = ringProj[j];
          const p2 = ringProj[(j + 1) % ringProj.length];
          const avgZ = (p1.pz + p2.pz) / 2;

          drawQueue.push({
            type: 'ringLine',
            z: avgZ,
            draw: () => {
              const alpha = Math.max(0.04, Math.min(0.3, 1 - avgZ / 500));
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.strokeStyle = ring[0].color;
              ctx.lineWidth = 0.8;
              ctx.globalAlpha = alpha;
              ctx.stroke();
            },
          });
        }
      });

      // 3. Process inter-node constellation lines (network effect)
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n1 = projectedNodes[i];
          const n2 = projectedNodes[j];

          // Compute 3D distance
          const dx = n1.node.x - n2.node.x;
          const dy = n1.node.y - n2.node.y;
          const dz = n1.node.z - n2.node.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Connection threshold
          if (dist3D < 190) {
            const avgZ = (n1.pz + n2.pz) / 2;
            drawQueue.push({
              type: 'connection',
              z: avgZ,
              draw: () => {
                const proximityScale = 1 - dist3D / 190;
                const alpha = proximityScale * Math.max(0.03, Math.min(0.25, 1 - avgZ / 600));
                ctx.beginPath();
                ctx.moveTo(n1.px, n1.py);
                ctx.lineTo(n2.px, n2.py);
                // Draw delicate bi-color gradient connection
                const grad = ctx.createLinearGradient(n1.px, n1.py, n2.px, n2.py);
                grad.addColorStop(0, n1.node.color);
                grad.addColorStop(1, n2.node.color);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 0.75;
                ctx.globalAlpha = alpha;
                ctx.stroke();
              },
            });
          }
        }
      }

      // Sort the entire draw queue by depth (Z index) descending
      // So elements in back (higher positive Z) get drawn first, elements in front (lower/negative Z) get drawn on top
      drawQueue.sort((a, b) => b.z - a.z);

      // Execute sorted draws
      drawQueue.forEach((el) => el.draw());

      // Draw subtle orbital particle strings floating lazily across the background canvas
      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup events & frames
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-55 transition-opacity duration-1000"
      id="background-3d-canvas"
    />
  );
}
