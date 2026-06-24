import { useRef, useEffect } from 'react';
import * as THREE from 'three';

/* ── helpers ── */
function makeStarField(count, spread, yCenter, color, size = 0.015) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // uniform sphere distribution
    const u     = Math.random();
    const v     = Math.random();
    const theta = 2 * Math.PI * u;
    const phi   = Math.acos(2 * v - 1);
    const r     = spread * (0.4 + Math.random() * 0.6);
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta) + yCenter;
    pos[i*3+2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size, sizeAttenuation: true,
    transparent: true, opacity: 0.8,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

function makeGalaxy(count, outerR, [gx, gy, gz], branches = 3, spin = 1.4) {
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);
  const colorInner = new THREE.Color(0xFFD700); // gold core
  const colorMid   = new THREE.Color(0xffffff); // white mid
  const colorOuter = new THREE.Color(0x88aaff); // blue edge
  const rndPow = 2.5;

  for (let i = 0; i < count; i++) {
    const r           = Math.random() * outerR;
    const spinAngle   = r * spin;
    const branchAngle = ((i % branches) / branches) * Math.PI * 2;

    const rx = Math.pow(Math.random(), rndPow) * (Math.random() < 0.5 ? 1 : -1) * r * 0.45;
    const ry = Math.pow(Math.random(), rndPow) * (Math.random() < 0.5 ? 1 : -1) * r * 0.06;
    const rz = Math.pow(Math.random(), rndPow) * (Math.random() < 0.5 ? 1 : -1) * r * 0.45;

    positions[i*3]   = Math.cos(branchAngle + spinAngle) * r + rx + gx;
    positions[i*3+1] = ry + gy;
    positions[i*3+2] = Math.sin(branchAngle + spinAngle) * r + rz + gz;

    // color gradient inner→mid→outer
    const t = r / outerR;
    const c = t < 0.5
      ? new THREE.Color().lerpColors(colorInner, colorMid, t * 2)
      : new THREE.Color().lerpColors(colorMid,   colorOuter, (t - 0.5) * 2);
    colors[i*3]   = c.r;
    colors[i*3+1] = c.g;
    colors[i*3+2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 0.045, sizeAttenuation: true, vertexColors: true,
    transparent: true, opacity: 0.9,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  return new THREE.Points(geo, mat);
}

export default function Scene3D({ scrollProgress }) {
  const canvasRef = useRef(null);
  const scrollRef = useRef(0);

  useEffect(() => { scrollRef.current = scrollProgress; }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    /* ── Scene ── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020208'); // very dark blue-black (space feel)
    scene.fog = new THREE.FogExp2('#020208', 0.018);

    /* ── Camera ── */
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 6);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    const gl1 = new THREE.PointLight(0xFFD700, 3, 22, 2);  gl1.position.set(5, 5, 5);    scene.add(gl1);
    const gl2 = new THREE.PointLight(0xFFD700, 2, 22, 2);  gl2.position.set(-5,-10, 3);   scene.add(gl2);
    const bl  = new THREE.PointLight(0x4488ff, 1.5, 18, 2); bl.position.set(0, -22, 5);  scene.add(bl);

    /* ── Materials ── */
    const mat = (color, intensity = 0.4) =>
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, wireframe: true });
    const gold    = mat(0xFFD700, 0.45);
    const goldDim = mat(0xFFD700, 0.18);
    const blue    = mat(0x4488ff, 0.28);

    /* ── Floaters registry ── */
    const floaters = [];
    const add = (geo, material, [x,y,z], [rx=0,ry=0,rz=0]=[], fy=0.6, fa=0.2) => {
      const mesh = new THREE.Mesh(geo, material.clone());
      mesh.position.set(x,y,z);
      mesh.rotation.set(rx,ry,rz);
      scene.add(mesh);
      floaters.push({ mesh, baseY:y, fy, fa, rx:0, ry:0, rz:0, phase: Math.random()*Math.PI*2 });
      return mesh;
    };
    const spin = (m, rx, ry, rz) => { const f=floaters.find(f=>f.mesh===m); if(f){f.rx=rx;f.ry=ry;f.rz=rz;} };

    /* ─── HERO (Y≈0) ─── */
    const t1 = add(new THREE.TorusGeometry(3,    0.07, 16, 120), gold,    [0, 0, 0],    [],                0.5, 0.25);
    const t2 = add(new THREE.TorusGeometry(2,    0.04, 12,  80), goldDim, [0, 0, 0],    [Math.PI/2.5,0,0], 0.4, 0.18);
    const i1 = add(new THREE.IcosahedronGeometry(0.7,1),          gold,    [3.5, 0.5,-2],[],                0.7, 0.22);
    const i2 = add(new THREE.IcosahedronGeometry(0.38,0),         gold,    [-3, -1,-1.5],[],                0.9, 0.16);
    spin(t1, 0.003, 0,     0.002);
    spin(t2, 0.005, 0.001, 0    );
    spin(i1, 0.003, 0.006, 0.002);
    spin(i2, 0.004, 0.005, 0.003);

    /* ─── SPECIALTIES (Y≈-8) ─── */
    add(new THREE.BoxGeometry(1.5,1.5,1.5),       goldDim, [-3, -7.5,-3],  [0.3,0.5,0],    0.5, 0.2);
    add(new THREE.BoxGeometry(2.2,0.05,1.6),       goldDim, [3.5,  -8,-2.5],[0.3,0.5,0.2],  0.4, 0.12);
    add(new THREE.TorusGeometry(1.8,0.05,8,60),   gold,    [0,   -10,-4],  [0.5,0,0],       0.6, 0.2);
    add(new THREE.IcosahedronGeometry(0.5,1),      gold,    [2,    -7,-2],  [],              1.0, 0.18);

    /* ─── PROJECTS (Y≈-17) ─── */
    [[-2,-16,-3],[2.5,-17.5,-2.5],[0,-19,-4]].forEach(([x,y,z],i) =>
      add(new THREE.BoxGeometry(2.2,1.4,0.05), blue, [x,y,z],[0,(i-1)*0.4,0], 0.5, 0.15));
    add(new THREE.OctahedronGeometry(0.6,0), gold,  [4,-17,-2],[],1.2,0.22);
    add(new THREE.IcosahedronGeometry(0.35,0),gold,[-4,-18,-2],[],0.8,0.18);

    /* ─── PARTNERS (Y≈-25) ─── */
    [[-3,-24,-3],[0,-25.5,-4],[3,-24,-2.5],[-1.5,-26.5,-3]].forEach(([x,y,z],i) =>
      add(new THREE.OctahedronGeometry(0.45+i*0.08,0), gold,[x,y,z],[],0.55+i*0.2,0.2));
    add(new THREE.TorusGeometry(2.2,0.04,8,80), goldDim,[0,-25,-5],[0.2,0,0],0.3,0.15);

    /* ─── GOLD DUST PARTICLES (journey) ─── */
    const pCount = 2800;
    const pPos   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i*3]   = (Math.random()-0.5)*20;
      pPos[i*3+1] = Math.random()*-32 - 1;
      pPos[i*3+2] = (Math.random()-0.5)*20;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color:0xFFD700, size:0.028, sizeAttenuation:true,
      transparent:true, opacity:0.55, depthWrite:false, blending: THREE.AdditiveBlending
    });
    const goldDust = new THREE.Points(pGeo, pMat);
    scene.add(goldDust);

    /* ═══════════════════════════════════════════
       STARS — three layers for parallax depth
    ═══════════════════════════════════════════ */
    // Layer 1: dense white small stars
    const stars1 = makeStarField(6000, 55, -15, 0xffffff,  0.012);
    // Layer 2: sparser blue-white slightly bigger
    const stars2 = makeStarField(2500, 40, -15, 0xaaccff,  0.018);
    // Layer 3: rare bright "foreground" stars
    const stars3 = makeStarField( 400, 28, -15, 0xffeebb,  0.03);
    scene.add(stars1, stars2, stars3);

    /* ═══════════════════════════════════════════
       GALAXIES — spiral arms, far in background
    ═══════════════════════════════════════════ */
    // Galaxy A: upper-left, visible from hero → specialties
    const galaxyA = makeGalaxy(5000, 9, [-22, -4, -18], 2, 1.6);
    scene.add(galaxyA);

    // Galaxy B: right side, visible from projects → partners
    const galaxyB = makeGalaxy(4500, 7, [20, -18, -16],  3, 1.2);
    scene.add(galaxyB);

    // Galaxy C: tiny distant galaxy (Easter egg)
    const galaxyC = makeGalaxy(1800, 4, [-5, -28, -22], 2, 2.0);
    scene.add(galaxyC);

    /* ── Camera keyframes ── */
    const KF = [
      [ 0,   0,  6,    0,   0,  0],
      [ 2,  -8,  5.5,  0,  -8,  0],
      [-2, -17,  5,    0, -17,  0],
      [ 0, -25,  6,    0, -25,  0],
      [ 0, -29,  7,    0, -29,  0],
    ];

    /* ── Animation loop ── */
    const clock = new THREE.Clock();
    let raf;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t  = clock.getElapsedTime();
      const sp = scrollRef.current;

      /* Float + rotate 3D objects */
      floaters.forEach(({ mesh, baseY, fy, fa, rx, ry, rz, phase }) => {
        mesh.position.y += (baseY + Math.sin(t*fy + phase)*fa - mesh.position.y) * 0.05;
        mesh.rotation.x += rx;
        mesh.rotation.y += ry;
        mesh.rotation.z += rz;
      });

      /* Gold dust drifts */
      goldDust.rotation.y = t * 0.018;

      /* Stars parallax drift (different speeds = depth illusion) */
      stars1.rotation.y = t * 0.006;
      stars2.rotation.y = t * 0.009;
      stars3.rotation.y = t * 0.014;
      // slight tilt variation
      stars1.rotation.x = Math.sin(t * 0.04) * 0.015;
      stars2.rotation.x = Math.sin(t * 0.03 + 1) * 0.02;

      /* Galaxies rotate slowly around their own center */
      galaxyA.rotation.y = t * 0.008;
      galaxyB.rotation.y = -t * 0.006;
      galaxyC.rotation.y = t * 0.012;
      // tilt oscillation for drama
      galaxyA.rotation.x = 0.35 + Math.sin(t*0.02) * 0.03;
      galaxyB.rotation.x = 0.25 + Math.sin(t*0.018 + 1) * 0.03;
      galaxyC.rotation.x = 0.45;

      /* Camera journey (smoothstep interpolation) */
      const n   = KF.length - 1;
      const raw = sp * n;
      const lo  = Math.floor(raw);
      const hi  = Math.min(lo + 1, n);
      const f   = raw - lo;
      const e   = f * f * (3 - 2 * f);
      const lerp = (a,b,t) => a+(b-a)*t;

      camera.position.x = lerp(KF[lo][0], KF[hi][0], e);
      camera.position.y = lerp(KF[lo][1], KF[hi][1], e);
      camera.position.z = lerp(KF[lo][2], KF[hi][2], e);
      camera.lookAt(
        lerp(KF[lo][3], KF[hi][3], e),
        lerp(KF[lo][4], KF[hi][4], e),
        lerp(KF[lo][5], KF[hi][5], e),
      );

      renderer.render(scene, camera);
    };

    tick();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', display:'block' }}
    />
  );
}
