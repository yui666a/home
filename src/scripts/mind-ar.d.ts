declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import type * as THREE from 'three';
  export class MindARThree {
    constructor(opts: {
      container: HTMLElement;
      imageTargetSrc: string;
      maxTrack?: number;
      uiLoading?: string | boolean;
      uiScanning?: string | boolean;
      uiError?: string | boolean;
      filterMinCF?: number;
      filterBeta?: number;
    });
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    start(): Promise<void>;
    stop(): void;
    addAnchor(targetIndex: number): {
      group: THREE.Group;
      onTargetFound: () => void;
      onTargetLost: () => void;
    };
  }
}
