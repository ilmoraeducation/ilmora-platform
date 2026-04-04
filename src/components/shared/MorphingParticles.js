// src/components/shared/MorphingParticles.js
// Full-screen fixed canvas with morphing particles that react to scroll + mouse
import { useEffect, useRef } from 'react';

const N = window.innerWidth < 768 ? 2500 : 4500;

// ── Shape generators ──────────────────────────────────────────────────────────
function makeScatter() {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    p[i*3]   = (Math.random() - 0.5) * 14;
    p[i*3+1] = (Math.random() - 0.5) * 14;
    p[i*3+2] = (Math.random() - 0.5) * 6;
  }
  return p;
}

function makeSphere(r = 2.2) {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi   = Math.random() * Math.PI * 2;
    const rad   = r + (Math.random() - 0.5) * 0.18;
    p[i*3]   = rad * Math.sin(theta) * Math.cos(phi);
    p[i*3+1] = rad * Math.sin(theta) * Math.sin(phi);
    p[i*3+2] = rad * Math.cos(theta);
  }
  return p;
}

function makeGradCap() {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = i / N;
    if (t < 0.42) {
      // flat board
      p[i*3]   = (Math.random() - 0.5) * 4.2;
      p[i*3+1] = 1.2 + (Math.random() - 0.5) * 0.09;
      p[i*3+2] = (Math.random() - 0.5) * 4.2;
    } else if (t < 0.72) {
      // dome
      const theta = Math.acos(2 * Math.random() - 1) * 0.48;
      const phi   = Math.random() * Math.PI * 2;
      const r = 1.2;
      p[i*3]   = r * Math.sin(theta) * Math.cos(phi);
      p[i*3+1] = r * Math.sin(theta) * Math.sin(phi) - 0.1;
      p[i*3+2] = r * Math.cos(theta) * 0.55;
    } else {
      // tassel
      const hang = Math.random();
      p[i*3]   = 1.8 + (Math.random() - 0.5) * 0.14;
      p[i*3+1] = 1.1 - hang * 1.6;
      p[i*3+2] = (Math.random() - 0.5) * 0.14;
    }
  }
  return p;
}

function makeRoad() {
  // career journey path with 4 milestone clusters
  const p = new Float32Array(N * 3);
  const stops = [-3.2, -1.0, 1.0, 3.2];
  for (let i = 0; i < N; i++) {
    const t     = i / N;
    const xBase = -4 + t * 8;
    const curve = Math.sin(t * Math.PI) * 0.7;
    const nearStop = stops.find(s => Math.abs(xBase - s) < 0.4);
    if (nearStop !== undefined && Math.random() < 0.18) {
      p[i*3]   = nearStop + (Math.random() - 0.5) * 0.55;
      p[i*3+1] = curve   + (Math.random() - 0.5) * 0.55;
      p[i*3+2] = (Math.random() - 0.5) * 0.35;
    } else {
      p[i*3]   = xBase + (Math.random() - 0.5) * 0.2;
      p[i*3+1] = curve + (Math.random() - 0.5) * 0.12;
      p[i*3+2] = (Math.random() - 0.5) * 0.2;
    }
  }
  return p;
}

function makeShield() {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t     = i / N;
    const y     = 2.3 - t * 4.6;
    const halfW = y > -0.6
      ? Math.sqrt(Math.max(0, 1 - Math.pow((y - 0.85) / 1.7, 2))) * 2.1
      : Math.max(0, (y + 2.3) / 1.7) * 0.95;
    if (Math.random() < 0.28) {
      const sign = Math.random() < 0.5 ? 1 : -1;
      p[i*3]   = sign * halfW + (Math.random() - 0.5) * 0.09;
      p[i*3+1] = y;
      p[i*3+2] = (Math.random() - 0.5) * 0.16;
    } else {
      p[i*3]   = (Math.random() - 0.5) * halfW * 2;
      p[i*3+1] = y;
      p[i*3+2] = (Math.random() - 0.5) * 0.13;
    }
  }
  return p;
}

function makeGlobe() {
  const p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi   = Math.random() * Math.PI * 2;
    const r     = 2.0 + (Math.random() - 0.5) * 0.12;
    // latitude lines every 30 deg
    const latSnap = Math.round(theta / (Math.PI / 6)) * (Math.PI / 6);
    const useSnap = Math.random() < 0.3;
    const finalTheta = useSnap ? latSnap : theta;
    p[i*3]   = r * Math.sin(finalTheta) * Math.cos(phi);
    p[i*3+1] = r * Math.sin(finalTheta) * Math.sin(phi);
    p[i*3+2] = r * Math.cos(finalTheta);
  }
  return p;
}

function makeStarburst() {
  // FAQ / contact starburst  
  const p = new Float32Array(N * 3);
  const arms = 8;
  for (let i = 0; i < N; i++) {
    const arm   = Math.floor(Math.random() * arms);
    const angle = (arm / arms) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const dist  = Math.pow(Math.random(), 0.6) * 2.5;
    p[i*3]   = Math.cos(angle) * dist + (Math.random() - 0.5) * 0.15;
    p[i*3+1] = Math.sin(angle) * dist + (Math.random() - 0.5) * 0.15;
    p[i*3+2] = (Math.random() - 0.5) * 0.4;
  }
  return p;
}

function makeTextILMORA() {
  const p = new Float32Array(N * 3);
  const letters = [
    (x,y) => Math.abs(x + 3.0) < 0.14 && Math.abs(y) < 1.15,
    (x,y) => (Math.abs(x + 1.8) < 0.14 && y > -1.1 && y < 1.1) || (y < -0.92 && x > -1.95 && x < -1.1),
    (x,y) => Math.abs(x + 0.5) < 0.75 && Math.abs(y) < 1.1 && (Math.abs(x+1.15)<0.14||Math.abs(x+0.1)<0.14||(y>0.22&&Math.abs(Math.abs(x+0.62)-0.5-y*0.5)<0.16)),
    (x,y) => Math.pow(x-0.9,2)/0.38+Math.pow(y,2)/1.25<1 && Math.pow(x-0.9,2)/0.17+Math.pow(y,2)/0.84>1,
    (x,y) => (Math.abs(x-2.1)<0.14&&Math.abs(y)<1.1)||(y>0&&Math.pow(x-2.4,2)+Math.pow(y-0.55,2)<0.32&&Math.pow(x-2.4,2)+Math.pow(y-0.55,2)>0.09)||(y<0&&x>2.1&&x<2.75&&Math.abs(y+(x-2.1)*0.9)<0.19),
    (x,y) => (Math.abs(Math.abs(x-3.2)*1.1-(y+1.1)*0.55)<0.14&&y>-1.1)||(y>-0.16&&y<0.16&&Math.abs(x-3.2)<0.58),
  ];
  let placed = 0, attempts = 0;
  while (placed < N && attempts < N * 22) {
    attempts++;
    const x = (Math.random() - 0.5) * 8.5;
    const y = (Math.random() - 0.5) * 3.0;
    if (letters.some(fn => fn(x, y))) {
      p[placed*3]=x; p[placed*3+1]=y; p[placed*3+2]=(Math.random()-0.5)*0.18;
      placed++;
    }
  }
  for (let i = placed; i < N; i++) {
    p[i*3]=(Math.random()-0.5)*7.5; p[i*3+1]=(Math.random()-0.5)*2.8; p[i*3+2]=(Math.random()-0.5)*0.22;
  }
  return p;
}

// Section index → shape function
// 0=hero(sphere) 1=about(gradcap) 2=howit(road) 3=programs(scatter) 4=services(shield) 5=universities(globe) 6=faq(starburst) 7=contact(ilmora)
const SHAPE_FNS = [makeSphere, makeGradCap, makeRoad, makeScatter, makeShield, makeGlobe, makeStarburst, makeTextILMORA];
let SHAPES_CACHE = null;
function getShapes() {
  if (!SHAPES_CACHE) SHAPES_CACHE = SHAPE_FNS.map(fn => fn());
  return SHAPES_CACHE;
}

// Section IDs mapped to shape indices
const SECTION_SHAPES = {
  home: 0, about: 1, how: 2, programs: 3, services: 4, universities: 5, faq: 6, contact: 7
};
const SECTION_ORDER = ['home','about','how','programs','services','universities','faq','contact'];

function lerp(a, b, t) {
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) out[i] = a[i] + (b[i] - a[i]) * t;
  return out;
}
function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

export default function MorphingParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const THREE = window.THREE;
    if (!THREE) return;

    const SHAPES = getShapes();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5.5;

    // Geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SHAPES[0]), 3));

    // Per-particle colours — gold palette
    const cols = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const m = Math.random();
      cols[i*3]   = 0.83 + m * 0.15;
      cols[i*3+1] = 0.68 + m * 0.12;
      cols[i*3+2] = 0.22 + m * 0.14;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const material = new THREE.PointsMaterial({
      size: 0.028, vertexColors: true, transparent: true,
      opacity: 0.82, sizeAttenuation: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // State
    let currentShapeIdx = 0;
    let targetShapeIdx  = 0;
    let morphT   = 1.0;
    let rotY     = 0;
    let mouseX   = 0, mouseY = 0;
    let time     = 0;
    let animId;

    // Mouse repel
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    // Scroll → detect which section is most visible
    let lastShapeIdx = 0;
    const onScroll = () => {
      const sections = SECTION_ORDER.map(id => document.getElementById(id)).filter(Boolean);
      let best = null, bestVis = -1;
      sections.forEach(el => {
        const rect = el.getBoundingClientRect();
        const vis  = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
        if (vis > bestVis) { bestVis = vis; best = el; }
      });
      if (!best) return;
      const id = best.id;
      const idx = SECTION_SHAPES[id] ?? 0;
      if (idx !== lastShapeIdx) {
        lastShapeIdx   = idx;
        currentShapeIdx = targetShapeIdx;
        targetShapeIdx  = idx;
        morphT = 0;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.011;

      if (morphT < 1) morphT = Math.min(1, morphT + 0.014);
      const waving   = morphT > 0.12 && morphT < 0.88;
      const waveAmt  = waving ? Math.sin((morphT - 0.12) / 0.76 * Math.PI) * 0.38 : 0;
      const easedT   = easeInOut(morphT);
      const lerped   = lerp(SHAPES[currentShapeIdx], SHAPES[targetShapeIdx], easedT);

      // Mouse parallax — smooth follow
      const targetRotY = mouseX * 0.18;
      rotY += (targetRotY - rotY) * 0.035;
      const rotX = mouseY * 0.12;

      const pos = geometry.attributes.position.array;
      for (let i = 0; i < N; i++) {
        const ix = lerped[i*3], iy = lerped[i*3+1], iz = lerped[i*3+2];

        // Wave burst during morph
        const wave  = waving ? Math.sin(ix * 2.8 + time * 3.5) * waveAmt : 0;
        // Subtle float
        const float = Math.sin(time * 0.75 + ix * 0.6 + iy * 0.4) * 0.014;

        // Mouse repel — particles near cursor drift away slowly
        const screenX = ix * 0.18;
        const screenY = iy * 0.18;
        const dx = screenX - mouseX * 2.5;
        const dy = screenY - mouseY * 2.5;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const repel = dist < 1.2 ? (1.2 - dist) / 1.2 * 0.22 : 0;
        const repelX = dist > 0.01 ? (dx / dist) * repel : 0;
        const repelY = dist > 0.01 ? (dy / dist) * repel : 0;

        // Rotate Y (mouse horizontal)
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const rx  = ix * cosY - iz * sinY;
        const rz  = ix * sinY + iz * cosY;
        // Rotate X (mouse vertical)
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const ry2  = iy * cosX - rz * sinX;
        const rz2  = iy * sinX + rz * cosX;

        pos[i*3]   = rx  + repelX;
        pos[i*3+1] = ry2 + wave + float + repelY;
        pos[i*3+2] = rz2;
      }
      geometry.attributes.position.needsUpdate = true;
      // Slow auto-rotation
      points.rotation.y += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  );
}
