import * as THREE from 'three';

// 粒子ネットワークをシーンに足し、毎フレーム呼ぶ更新関数を返す。
export function addParticleField(scene: THREE.Scene): () => void {
  // 粒子(見せ場なので背景の70より多めの120)
  const COUNT = 120;
  const positions = new Float32Array(COUNT * 3);
  const velocities: { x: number; y: number }[] = [];
  const spreadX = 30;
  const spreadY = 20;
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spreadX;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    velocities.push({ x: (Math.random() - 0.5) * 0.012, y: (Math.random() - 0.5) * 0.012 });
  }

  const accent = new THREE.Color('#3a8d7f');

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({
    color: accent,
    size: 0.16,
    transparent: true,
    opacity: 0.9,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  // 線(近接ペアを結ぶ)
  const lineGeo = new THREE.BufferGeometry();
  const maxLines = COUNT * COUNT;
  const linePositions = new Float32Array(maxLines * 3 * 2);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.22,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  const DIST = 4.2;
  return () => {
    const pos = pGeo.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      if (pos[i * 3] > spreadX / 2 || pos[i * 3] < -spreadX / 2) velocities[i].x *= -1;
      if (pos[i * 3 + 1] > spreadY / 2 || pos[i * 3 + 1] < -spreadY / 2) velocities[i].y *= -1;
    }
    pGeo.attributes.position.needsUpdate = true;

    // 近接ペアの線を張る
    let ptr = 0;
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < DIST) {
          linePositions[ptr++] = pos[i * 3];
          linePositions[ptr++] = pos[i * 3 + 1];
          linePositions[ptr++] = pos[i * 3 + 2];
          linePositions[ptr++] = pos[j * 3];
          linePositions[ptr++] = pos[j * 3 + 1];
          linePositions[ptr++] = pos[j * 3 + 2];
        }
      }
    }
    lineGeo.setDrawRange(0, ptr / 3);
    lineGeo.attributes.position.needsUpdate = true;
  };
}
