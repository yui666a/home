import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { arCard, isSafeExternalUrl, iconPath, type ArLink } from '../data/ar-card';
import { createTextCanvas, type TextStyle } from './text-texture';

export type ArHandle = { stop: () => void };

type ErrorKind = 'denied' | 'unsupported' | 'unknown';

const TEXT_STYLE: TextStyle = {
  font: 'bold 64px sans-serif',
  color: '#ffffff',
  padding: 24,
  lineHeight: 76,
};

// canvas からテクスチャ貼り plane を作る。plane の幅は 1 を基準に縦横比を維持。
function makeTextPlane(lines: string[]): THREE.Mesh {
  const canvas = createTextCanvas(lines, TEXT_STYLE);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const aspect = canvas.height / canvas.width;
  const geometry = new THREE.PlaneGeometry(1, aspect);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  return new THREE.Mesh(geometry, material);
}

// アイコン plane。userData.url にリンク先を持たせ raycaster で拾う。
function makeIconPlane(link: ArLink, loader: THREE.TextureLoader): THREE.Mesh {
  const texture = loader.load(iconPath(link));
  texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.PlaneGeometry(0.22, 0.22);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.url = link.url;
  return mesh;
}

export async function startArBusinessCard(opts: {
  container: HTMLElement;
  targetSrc: string;
  onError: (kind: ErrorKind) => void;
  onReady: () => void;
}): Promise<ArHandle | null> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    opts.onError('unsupported');
    return null;
  }

  const mindarThree = new MindARThree({
    container: opts.container,
    imageTargetSrc: opts.targetSrc,
  });
  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // 名前 + 肩書き
  const namePlane = makeTextPlane([arCard.name, arCard.role]);
  namePlane.position.set(0, 0.35, 0);
  namePlane.scale.set(0.9, 0.9, 0.9);
  anchor.group.add(namePlane);

  // リンクアイコンを横並び
  const loader = new THREE.TextureLoader();
  const iconMeshes: THREE.Mesh[] = [];
  const gap = 0.26;
  const startX = -((arCard.links.length - 1) * gap) / 2;
  arCard.links.forEach((link, i) => {
    if (!isSafeExternalUrl(link.url)) return;
    const icon = makeIconPlane(link, loader);
    icon.position.set(startX + i * gap, -0.2, 0);
    anchor.group.add(icon);
    iconMeshes.push(icon);
  });

  // タップ判定
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const onTap = (clientX: number, clientY: number) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(iconMeshes, false);
    const url = hits[0]?.object.userData.url as string | undefined;
    if (url && isSafeExternalUrl(url)) {
      window.open(url, '_blank', 'noopener');
    }
  };
  const clickHandler = (e: MouseEvent) => onTap(e.clientX, e.clientY);
  const touchHandler = (e: TouchEvent) => {
    const t = e.changedTouches[0];
    if (t) onTap(t.clientX, t.clientY);
  };
  renderer.domElement.addEventListener('click', clickHandler);
  renderer.domElement.addEventListener('touchend', touchHandler);

  try {
    await mindarThree.start();
    opts.onReady();
  } catch (err) {
    const name = (err as { name?: string })?.name;
    opts.onError(name === 'NotAllowedError' ? 'denied' : 'unknown');
    return null;
  }

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  return {
    stop: () => {
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener('click', clickHandler);
      renderer.domElement.removeEventListener('touchend', touchHandler);
      mindarThree.stop();
    },
  };
}
