import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from 'motion/react';
import { MarketSymbol } from '../theme/tokens';

export interface LiquidityTerrain3DProps {
  className?: string;
  market?: MarketSymbol;
}

/**
 * Hardware-accelerated Three.js 3D Order-Flow & Liquidity Terrain
 * Represents resting Bid (Cyan) and Ask (Indigo) liquidity ridges around the Mid equilibrium spine.
 * Not a price chart — an abstract living liquidity landscape with volumetric depth and laser floor grid.
 */
export const LiquidityTerrain3D: React.FC<LiquidityTerrain3DProps> = ({
  className = '',
  market = 'BTC',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prefersReduced = useReducedMotion();
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  const marketSeed =
    market === 'BTC' ? 1.0 : market === 'ETH' ? 1.35 : market === 'SOL' ? 1.7 : 2.1;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnsupported(true);
      return;
    }

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 280;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 5.2, 9.0);
    camera.lookAt(0, 0.35, 0);

    // Subtle spatial reference floor grid beneath liquidity topography
    const floorGrid = new THREE.GridHelper(16, 20, 0x22d3ee, 0x1e293b);
    floorGrid.position.y = -0.35;
    if (Array.isArray(floorGrid.material)) {
      floorGrid.material.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.22;
      });
    } else {
      floorGrid.material.transparent = true;
      floorGrid.material.opacity = 0.22;
    }
    scene.add(floorGrid);

    // Build wireframe + translucent volumetric fill + luminous vertex points
    const cols = 46;
    const rows = 28;
    const planeGeo = new THREE.PlaneGeometry(13.4, 8.2, cols, rows);
    planeGeo.rotateX(-Math.PI / 2);

    const posAttr = planeGeo.attributes.position as THREE.BufferAttribute;
    const vertexCount = posAttr.count;
    const colors = new Float32Array(vertexCount * 3);

    const bidColor = new THREE.Color('#22D3EE'); // Cyan resting bids
    const askColor = new THREE.Color('#818CF8'); // Indigo resting asks
    const eqColor = new THREE.Color('#FBBF24'); // Amber mid equilibrium

    const baseHeights = new Float32Array(vertexCount);

    for (let i = 0; i < vertexCount; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const absX = Math.abs(x);
      // Market-sensitive asymmetric depth ridge + mid liquidity trough
      const skew = x < 0 ? 1.06 : 0.96;
      const ridge =
        Math.exp(-Math.pow((absX - 2.85) / 1.48, 2)) * 2.05 * skew +
        Math.exp(-Math.pow((absX - 4.7) / 0.9, 2)) * 0.72 +
        Math.exp(-Math.pow(absX / 0.32, 2)) * 0.22;
      const harmonic =
        Math.sin(x * 0.95 * marketSeed) * Math.cos(z * 0.75) * 0.26;
      baseHeights[i] = ridge + harmonic;

      let c: THREE.Color;
      if (Math.abs(x) < 0.38) {
        c = eqColor.clone();
      } else if (x < 0) {
        c = bidColor.clone().lerp(eqColor, Math.max(0, 0.38 - absX * 0.12));
      } else {
        c = askColor.clone().lerp(eqColor, Math.max(0, 0.38 - absX * 0.12));
      }

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    planeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const surfaceMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const surfaceMesh = new THREE.Mesh(planeGeo, surfaceMat);
    scene.add(surfaceMesh);

    const wireMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
    });
    const terrainMesh = new THREE.Mesh(planeGeo, wireMat);
    scene.add(terrainMesh);

    const pointsMat = new THREE.PointsMaterial({
      size: 0.082,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
    });
    const terrainPoints = new THREE.Points(planeGeo, pointsMat);
    scene.add(terrainPoints);

    // Center Mid-Price Equilibrium Spine Line + Floating Scanner Beacon
    const spinePoints = [
      new THREE.Vector3(0, 0.35, -4.15),
      new THREE.Vector3(0, 0.35, 4.15),
    ];
    const spineGeo = new THREE.BufferGeometry().setFromPoints(spinePoints);
    const spineMat = new THREE.LineBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.9,
    });
    const spineLine = new THREE.Line(spineGeo, spineMat);
    scene.add(spineLine);

    const beaconGeo = new THREE.RingGeometry(0.18, 0.28, 32);
    beaconGeo.rotateX(-Math.PI / 2);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const beaconRing = new THREE.Mesh(beaconGeo, beaconMat);
    beaconRing.position.set(0, 0.42, 0);
    scene.add(beaconRing);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!renderer || !entries[0]) return;
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    let animFrameId = 0;
    let time = 0;

    const renderFrame = () => {
      if (!renderer) return;

      if (!prefersReduced) {
        time += 0.017;
        for (let i = 0; i < vertexCount; i++) {
          const x = posAttr.getX(i);
          const z = posAttr.getZ(i);
          const ripple =
            Math.sin(x * 0.85 + time * 1.35 * marketSeed * 0.7) *
              Math.cos(z * 0.72 - time * 0.9) *
              0.24 +
            Math.sin(z * 1.45 + time * 0.85) * 0.1;
          posAttr.setY(i, baseHeights[i] + ripple);
        }
        posAttr.needsUpdate = true;

        // Smooth camera parallax + gentle autonomous drift
        const idleYaw = Math.sin(time * 0.35) * 0.45;
        const targetCamX = pointerRef.current.x * 1.85 + idleYaw;
        const targetCamY = 5.1 - pointerRef.current.y * 0.95;
        camera.position.x += (targetCamX - camera.position.x) * 0.06;
        camera.position.y += (targetCamY - camera.position.y) * 0.06;
        camera.lookAt(0, 0.48, 0);

        // Glide scanner beacon along the Z axis of the mid spine / pointer Z
        const targetZ = pointerRef.current.y * 2.8;
        beaconRing.position.z += (targetZ - beaconRing.position.z) * 0.09;
        const pulseScale = 1 + Math.sin(time * 3.2) * 0.16;
        beaconRing.scale.set(pulseScale, pulseScale, 1);
      } else {
        for (let i = 0; i < vertexCount; i++) {
          posAttr.setY(i, baseHeights[i]);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
      if (!prefersReduced) {
        animFrameId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      planeGeo.dispose();
      surfaceMat.dispose();
      wireMat.dispose();
      pointsMat.dispose();
      spineGeo.dispose();
      spineMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      floorGrid.dispose();
      renderer?.dispose();
    };
  }, [prefersReduced, marketSeed]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    pointerRef.current = { x: nx, y: ny };
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
  };

  if (webglUnsupported) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 rounded-lg border border-slate-800/40 ${className}`}
      >
        <span className="font-mono text-xs text-slate-400">
          3D Liquidity Terrain (WebGL Fallback)
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`w-full h-full cursor-grab active:cursor-grabbing ${className}`}
      aria-label="Interactive 3D WebGL order-flow liquidity landscape"
    />
  );
};
