import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Scene3D({ scrollProgress }) {
  const canvasRef = useRef(null);
  const scrollRef  = useRef(0);

  // Sync scroll progress via ref — no re-render on every scroll event
  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    /* ── Scene ── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050505');
    scene.fog = new THREE.FogExp2('#050505', 0.022);

    /* ── Camera ── */
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 0, 6);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const gl1 = new THREE.PointLight(0xFFD700, 3, 22, 2);
    gl1.position.set(5, 5, 5);
    scene.add(gl1);

    const gl2 = new THREE.PointLight(0xFFD700, 2, 22, 2);
    gl2.position.set(-5, -10, 3);
    scene.add(gl2);

    const bl = new THREE.PointLight(0x4488ff, 1.5, 18, 2);
    bl.position.set(0, -22, 5);
    scene.add(bl);

    /* ── Materials ── */
    const mat = (color, intensity = 0.4) =>
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, wireframe: true });

    const gold     = mat(0xFFD700, 0.45);
    const goldDim  = mat(0xFFD700, 0.18);
    const blue     = mat(0x4488ff, 0.28);

    /* ── Object registry for animation ── */
    const floaters = []; // {mesh, baseY, fy, fa, rx,ry,rz, phase}

    const add = (geo, material, [x, y, z], [rx = 0, ry = 0, rz = 0] = [], fy = 0.6, fa = 0.2) => {
      const mesh = new THREE.Mesh(geo, material.clone());
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      scene.add(mesh);
      floaters.push({ mesh, baseY: y, fy, fa, rx: rx * 0, ry: ry * 0, rz: rz * 0, phase: Math.random() * Math.PI * 2 });
      return mesh;
    };

    /* ─────────────── HERO OBJECTS  (Y ≈ 0) ─────────────── */
    const torus1 = add(new THREE.TorusGeometry(3,   0.07, 16, 120), gold,    [0, 0, 0],    [0, 0, 0],         0.5, 0.25);
    const torus2 = add(new THREE.TorusGeometry(2,   0.04, 12,  80), goldDim, [0, 0, 0],    [Math.PI/2.5,0,0], 0.4, 0.18);
    const ico1   = add(new THREE.IcosahedronGeometry(0.7, 1),        gold,    [3.5, 0.5,-2],[],                0.7, 0.22);
    const ico2   = add(new THREE.IcosahedronGeometry(0.38,0),        gold,    [-3, -1, -1.5],[],               0.9, 0.16);

    /* ─────────────── SPECIALTIES  (Y ≈ -8) ─────────────── */
    add(new THREE.BoxGeometry(1.5, 1.5, 1.5), goldDim, [-3,   -7.5,-3],  [0.3,0.5,0],    0.5, 0.2);
    add(new THREE.BoxGeometry(2.2, 0.05,1.6), goldDim, [ 3.5, -8,  -2.5],[0.3,0.5,0.2],  0.4, 0.12);
    add(new THREE.TorusGeometry(1.8, 0.05, 8, 60), gold, [0,  -10,  -4], [0.5,0,0],       0.6, 0.2);
    add(new THREE.IcosahedronGeometry(0.5,1), gold,    [ 2,   -7,  -2],  [],              1.0, 0.18);

    /* ─────────────── PROJECTS  (Y ≈ -17) ─────────────── */
    [[-2,-16,-3],[2.5,-17.5,-2.5],[0,-19,-4]].forEach(([x,y,z],i) => {
      add(new THREE.BoxGeometry(2.2,1.4,0.05), blue, [x,y,z], [0,(i-1)*0.4,0], 0.5, 0.15);
    });
    add(new THREE.OctahedronGeometry(0.6,0), gold,  [ 4,-17,-2],  [], 1.2, 0.22);
    add(new THREE.IcosahedronGeometry(0.35,0),gold, [-4,-18,-2],  [], 0.8, 0.18);

    /* ─────────────── PARTNERS  (Y ≈ -25) ─────────────── */
    [[-3,-24,-3],[0,-25.5,-4],[3,-24,-2.5],[-1.5,-26.5,-3]].forEach(([x,y,z],i) => {
      add(new THREE.OctahedronGeometry(0.45+i*0.08,0), gold, [x,y,z], [], 0.55+i*0.2, 0.2);
    });
    add(new THREE.TorusGeometry(2.2,0.04,8,80), goldDim, [0,-25,-5],[0.2,0,0], 0.3, 0.15);

    /* ─────────────── FIXED ROTATION speeds ─────────────── */
    const spin = (m, rx, ry, rz) => floaters.find(f=>f.mesh===m) && Object.assign(floaters.find(f=>f.mesh===m),{rx,ry,rz});
    spin(torus1, 0.003, 0,     0.002);
    spin(torus2, 0.005, 0.001, 0    );
    spin(ico1,   0.003, 0.006, 0.002);
    spin(ico2,   0.004, 0.005, 0.003);

    /* ─────────────── PARTICLES ─────────────── */
    const pCount = 2800;
    const pPos   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i*3]   = (Math.random()-0.5)*20;
      pPos[i*3+1] = Math.random()*-32 - 1;
      pPos[i*3+2] = (Math.random()-0.5)*20;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
    const pMat = new THREE.PointsMaterial({ color:0xFFD700, size:0.028, sizeAttenuation:true, transparent:true, opacity:0.55, depthWrite:false });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* ─────────────── Camera keyframes ─────────────── */
    // Each entry: [camX, camY, camZ, targetX, targetY, targetZ]
    const KF = [
      [ 0,   0,  6,    0,   0,  0],   // 0.0  Hero
      [ 2,  -8,  5.5,  0,  -8,  0],   // 0.25 Specialties
      [-2, -17,  5,    0, -17,  0],   // 0.55 Projects
      [ 0, -25,  6,    0, -25,  0],   // 0.80 Partners
      [ 0, -29,  7,    0, -29,  0],   // 1.00 Footer
    ];

    const tmpA = new THREE.Vector3();
    const tmpB = new THREE.Vector3();

    /* ─────────────── Animation loop ─────────────── */
    const clock = new THREE.Clock();
    let raf;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t  = clock.getElapsedTime();
      const sp = scrollRef.current;

      /* Float + rotate objects */
      floaters.forEach(({ mesh, baseY, fy, fa, rx, ry, rz, phase }) => {
        mesh.position.y += (baseY + Math.sin(t * fy + phase) * fa - mesh.position.y) * 0.05;
        mesh.rotation.x += rx;
        mesh.rotation.y += ry;
        mesh.rotation.z += rz;
      });

      /* Particles drift */
      particles.rotation.y = t * 0.018;

      /* Camera journey */
      const n   = KF.length - 1;
      const raw = sp * n;
      const lo  = Math.floor(raw);
      const hi  = Math.min(lo + 1, n);
      const f   = raw - lo;
      const e   = f * f * (3 - 2 * f); // smoothstep

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

    /* Resize */
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
