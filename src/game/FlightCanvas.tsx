import { useEffect, useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildTerrain, describePlace, type Terrain } from "@/game/terrain";
import { forwardOf, headingDeg, stepSim } from "@/game/sim";
import { heldCodes, hudBus, inputState, renderState, simState } from "@/game/input";

const DAY_FOG = new THREE.Color("#c5ddd4");
const NIGHT_FOG = new THREE.Color("#10182c");
const DAY_SKY = new THREE.Color("#d7ecff");
const NIGHT_SKY = new THREE.Color("#243056");
const DAY_GROUND = new THREE.Color("#6d8a52");
const NIGHT_GROUND = new THREE.Color("#121810");
const SUN_COLOR = new THREE.Color("#fff1d4");
const MOON_COLOR = new THREE.Color("#9db4ff");

function makeTerrainObjects(terrain: Terrain) {
  const seg = terrain.segments;
  const n = seg + 1;
  const positions = new Float32Array(n * n * 3);
  for (let iz = 0; iz < n; iz++) {
    for (let ix = 0; ix < n; ix++) {
      const i = iz * n + ix;
      const east = (ix / seg - 0.5) * terrain.world;
      const north = (0.5 - iz / seg) * terrain.world;
      positions[i * 3] = east;
      positions[i * 3 + 1] = terrain.heights[i] ?? 0;
      positions[i * 3 + 2] = -north;
    }
  }
  const indices: number[] = [];
  for (let iz = 0; iz < seg; iz++) {
    for (let ix = 0; ix < seg; ix++) {
      const a = iz * n + ix;
      const b = a + 1;
      const c = a + n;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(terrain.colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const wireGeo = new THREE.WireframeGeometry(geo);
  const wireMat = new THREE.LineBasicMaterial({
    color: 0xe4b15a,
    transparent: true,
    opacity: 0.42,
    toneMapped: false,
  });
  const wire = new THREE.LineSegments(wireGeo, wireMat);
  wire.visible = false;
  return { geo, mat, wire, wireGeo, wireMat };
}

function ScatterMesh({
  items,
  geometry,
  material,
  groundOffset,
}: {
  items: Terrain["trees"];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  groundOffset: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    items.forEach((item, i) => {
      dummy.position.set(item.x, item.y + (groundOffset ? item.sy * 0.5 : 0), item.z);
      dummy.rotation.set(0, item.rot, 0);
      dummy.scale.set(item.sx, item.sy, item.sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [items, groundOffset]);
  if (items.length === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} frustumCulled={false} />;
}

function Towns({ terrain, geometry, material }: { terrain: Terrain; geometry: THREE.BufferGeometry; material: THREE.MeshLambertMaterial }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    terrain.buildings.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(0, b.rot, 0);
      dummy.scale.set(b.sx, b.sy, b.sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.setRGB(0.86 + b.shade * 0.08, 0.8 + b.shade * 0.06, 0.68);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [terrain]);
  useFrame(() => {
    material.emissiveIntensity = renderState.night * 0.9;
  });
  if (terrain.buildings.length === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, material, terrain.buildings.length]} />;
}

function Aircraft() {
  const group = useRef<THREE.Group>(null);
  const prop = useRef<THREE.Group>(null);
  const behind = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const s = simState;
    const g = group.current;
    if (!g) return;
    const { fx, fy, fz } = forwardOf(s);
    g.position.set(s.x, s.y, s.z);
    // Nose is local +Z. lookAt aims local −Z at the target, so aim at a point behind.
    behind.set(s.x - fx, s.y - fy, s.z - fz);
    g.up.set(0, 1, 0);
    g.lookAt(behind);
    g.rotateZ(s.roll);
    const d = Math.min(dt, 0.05);
    if (prop.current) prop.current.rotation.z += (9 + Math.abs(s.speed) * 0.45) * d;
  });
  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.95, 7.4, 6]} />
        <meshLambertMaterial color="#f4efe4" flatShading />
      </mesh>
      <mesh position={[0, 0, 4.7]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.7, 1.8, 6]} />
        <meshLambertMaterial color="#e4b15a" flatShading />
      </mesh>
      <mesh position={[0, 0.35, 0.2]}>
        <boxGeometry args={[16.5, 0.22, 2.5]} />
        <meshLambertMaterial color="#127868" flatShading />
      </mesh>
      <mesh position={[0, 0.15, -3.45]}>
        <boxGeometry args={[4.4, 0.14, 1.15]} />
        <meshLambertMaterial color="#127868" flatShading />
      </mesh>
      <mesh position={[0, 1.05, -3.2]}>
        <boxGeometry args={[0.16, 1.7, 1.35]} />
        <meshLambertMaterial color="#f4efe4" flatShading />
      </mesh>
      <mesh position={[0, 0.72, 0.4]}>
        <boxGeometry args={[0.85, 0.55, 1.4]} />
        <meshLambertMaterial color="#14343c" flatShading />
      </mesh>
      <group ref={prop} position={[0, 0, 5.65]}>
        <mesh>
          <boxGeometry args={[0.16, 3.3, 0.08]} />
          <meshLambertMaterial color="#2a241c" flatShading />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.16, 3.3, 0.08]} />
          <meshLambertMaterial color="#2a241c" flatShading />
        </mesh>
      </group>
    </group>
  );
}

function World({
  terrain,
  objects,
  wireRef,
  nightRef,
}: {
  terrain: Terrain;
  objects: ReturnType<typeof makeTerrainObjects>;
  wireRef: MutableRefObject<boolean>;
  nightRef: MutableRefObject<boolean>;
}) {
  const { camera, scene } = useThree();
  const desired = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const sky = useRef<THREE.ShaderMaterial>(null);
  const stars = useRef<THREE.PointsMaterial>(null);
  const nightMix = useRef(0);
  const camReady = useRef(false);
  const hudAcc = useRef(0);
  const treeGeo = useMemo(() => new THREE.ConeGeometry(1, 1, 5), []);
  const treeMat = useMemo(() => new THREE.MeshLambertMaterial({ color: "#1b6a38", flatShading: true }), []);
  const palmMat = useMemo(() => new THREE.MeshLambertMaterial({ color: "#3e8f45", flatShading: true }), []);
  const townGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const townMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: "#ffffff", emissive: "#ffb15a", emissiveIntensity: 0 }),
    [],
  );
  const starGeo = useMemo(() => {
    const pos = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i++) {
      const y = 0.12 + (((i * 47) % 100) / 100) * 0.88;
      const ang = i * 2.399;
      const radial = Math.sqrt(Math.max(0, 1 - y * y));
      pos[i * 3] = Math.cos(ang) * radial * 90_000;
      pos[i * 3 + 1] = y * 90_000;
      pos[i * 3 + 2] = Math.sin(ang) * radial * 90_000;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    const d = Math.min(Math.max(dt, 0), 0.05);
    const targetNight = nightRef.current ? 1 : 0;
    nightMix.current += (targetNight - nightMix.current) * Math.min(1, d * 2.2);
    renderState.night = nightMix.current;
    objects.wire.visible = wireRef.current;

    if (inputState.playing) {
      const codes = heldCodes();
      const has = (code: string) => codes.includes(code);
      let steer = 0;
      if (has("KeyA") || has("ArrowLeft")) steer += 1;
      if (has("KeyD") || has("ArrowRight")) steer -= 1;
      steer = Math.max(-1, Math.min(1, steer + inputState.touchSteer));
      if (inputState.steerOverride !== null) steer = inputState.steerOverride;
      let thrust = 0;
      if (has("KeyW") || has("ArrowUp")) thrust += 1;
      if (has("KeyS") || has("ArrowDown")) thrust -= 1;
      thrust = Math.max(-1, Math.min(1, thrust + inputState.touchThrust));
      const boost = has("ShiftLeft") || has("ShiftRight") || inputState.touchBoost;
      stepSim(
        simState,
        {
          thrust,
          steer,
          lookX: inputState.lookX,
          lookY: inputState.lookY,
          boost,
        },
        d,
        terrain.sample,
      );
    }
    inputState.lookX = 0;
    inputState.lookY = 0;

    const s = simState;
    const { fx, fy, fz } = forwardOf(s);
    const follow = 42;
    desired.set(s.x - fx * follow, s.y - fy * follow * 0.85 + 11, s.z - fz * follow);
    if (!camReady.current) {
      camera.position.copy(desired);
      camReady.current = true;
    } else {
      camera.position.lerp(desired, 1 - Math.exp(-4.5 * d));
    }
    lookAt.set(s.x + fx * 30, s.y + fy * 30 + 1.5, s.z + fz * 30);
    camera.up.set(0, 1, 0);
    camera.lookAt(lookAt);

    const n = nightMix.current;
    if (hemi.current) {
      hemi.current.intensity = 0.78 * (1 - n) + 0.2 * n;
      hemi.current.color.copy(DAY_SKY).lerp(NIGHT_SKY, n);
      hemi.current.groundColor.copy(DAY_GROUND).lerp(NIGHT_GROUND, n);
    }
    if (sun.current) sun.current.intensity = 1.32 * (1 - n);
    if (moon.current) moon.current.intensity = 0.62 * n;
    if (sky.current) sky.current.uniforms.uNight!.value = n;
    if (stars.current) stars.current.opacity = n;
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(DAY_FOG).lerp(NIGHT_FOG, n);

    hudAcc.current += d;
    if (hudAcc.current > 0.12) {
      hudAcc.current = 0;
      const ground = terrain.sample(s.x, s.z);
      const agl = Math.max(0, s.y - Math.max(ground, 0));
      hudBus.alt = Math.round(s.y).toLocaleString("en-US");
      hudBus.agl = Math.round(agl).toLocaleString("en-US");
      hudBus.spd = Math.round(Math.abs(s.speed) * 3.6).toString();
      hudBus.hdg = Math.round(headingDeg(s.yaw)).toString().padStart(3, "0");
      hudBus.place = describePlace(s.x, s.z, ground);
      hudBus.warn = agl < 36 && ground > -2;
      hudBus.ticks = Math.round(Math.min(1, Math.abs(s.speed) / 120) * 8);
      hudBus.tick += 1;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#d7ecff", "#6d8a52", 0.78]} />
      <directionalLight ref={sun} position={[-18000, 32000, -12000]} intensity={1.32} color={SUN_COLOR} />
      <directionalLight ref={moon} position={[14000, 22000, 16000]} intensity={0} color={MOON_COLOR} />
      <fog attach="fog" args={["#c5ddd4", 28000, 100000]} />
      <mesh frustumCulled={false} renderOrder={-2}>
        <sphereGeometry args={[100000, 20, 12]} />
        <shaderMaterial
          ref={sky}
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            uNight: { value: 0 },
            uTopDay: { value: new THREE.Color("#6eb7e0") },
            uHorDay: { value: new THREE.Color("#f3e2c4") },
            uTopNight: { value: new THREE.Color("#070b16") },
            uHorNight: { value: new THREE.Color("#1a2748") },
          }}
          vertexShader={`
            varying vec3 vDir;
            void main() {
              vDir = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vDir;
            uniform float uNight;
            uniform vec3 uTopDay, uHorDay, uTopNight, uHorNight;
            void main() {
              float h = normalize(vDir).y;
              float t = smoothstep(-0.08, 0.62, h);
              vec3 day = mix(uHorDay, uTopDay, t);
              vec3 night = mix(uHorNight, uTopNight, t);
              gl_FragColor = vec4(mix(day, night, uNight), 1.0);
            }
          `}
        />
      </mesh>
      <points geometry={starGeo} frustumCulled={false} renderOrder={-1}>
        <pointsMaterial ref={stars} color="#f4f0e4" size={1.7} sizeAttenuation={false} transparent opacity={0} depthWrite={false} />
      </points>
      <mesh geometry={objects.geo} material={objects.mat} />
      <primitive object={objects.wire} />
      <ScatterMesh items={terrain.trees} geometry={treeGeo} material={treeMat} groundOffset />
      <ScatterMesh items={terrain.palms} geometry={treeGeo} material={palmMat} groundOffset />
      <Towns terrain={terrain} geometry={townGeo} material={townMat} />
      <mesh position={[terrain.airport.x, terrain.airport.y, terrain.airport.z]} rotation={[0, terrain.airport.rot, 0]}>
        <boxGeometry args={[2400, 2.4, 70]} />
        <meshLambertMaterial color="#2c3338" flatShading />
      </mesh>
      <Aircraft />
    </>
  );
}

export function FlightCanvas({
  nightRef,
  wireRef,
}: {
  nightRef: MutableRefObject<boolean>;
  wireRef: MutableRefObject<boolean>;
}) {
  const terrain = useMemo(() => buildTerrain(), []);
  const objects = useMemo(() => makeTerrainObjects(terrain), [terrain]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      inputState.keys.add(e.code);
    };
    const up = (e: KeyboardEvent) => {
      inputState.keys.delete(e.code);
    };
    const blur = () => inputState.keys.clear();
    const move = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        inputState.lookX += e.movementX;
        inputState.lookY += e.movementY;
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    window.addEventListener("mousemove", move);
    const vis = () => {
      if (document.hidden) inputState.keys.clear();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("visibilitychange", vis);
      objects.geo.dispose();
      objects.mat.dispose();
      objects.wireGeo.dispose();
      objects.wireMat.dispose();
    };
  }, [objects]);

  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.5]}
      camera={{ fov: 56, near: 5, far: 160000, position: [-24000, 2600, 18000] }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping, powerPreference: "high-performance" }}
      onPointerDown={(e) => {
        if (!inputState.playing) return;
        if (window.matchMedia("(pointer: coarse)").matches) return;
        const el = e.target;
        if (el instanceof HTMLCanvasElement) void el.requestPointerLock();
      }}
    >
      <World terrain={terrain} objects={objects} nightRef={nightRef} wireRef={wireRef} />
    </Canvas>
  );
}
