import * as THREE from 'three';
import { FontLoader, TextGeometry } from 'three/examples/jsm/Addons.js';
import { PerspectiveCamera } from './core/Camera';
import { Three } from './core/Three';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

export class App extends Three {
  private readonly camera: PerspectiveCamera;
  private mesh!: THREE.Mesh;
  private texGroup!: THREE.Group;
  private material!: THREE.ShaderMaterial;
  private targetScroll = 0;
  private currentScroll = 0;
  private lastScroll = 0;
  private uTimeValue = 0;

  private readonly lineCount = 22;
  private readonly lineSpacing = 1.6;
  private readonly totalHeight = this.lineCount * this.lineSpacing;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.camera = new PerspectiveCamera();

    this.init();
    this.targetScroll = 0;
    this.currentScroll = 0;
  }

  private async init() {
    this.scene.background = new THREE.Color('#E7D1A8');
    this.texGroup = new THREE.Group();
    this.scene.add(this.texGroup);

    this.createMaterial();
    await this.createText();

    window.addEventListener('resize', this.resize.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: true });
    this.renderer.setAnimationLoop(this.animate.bind(this));
  }

  private onWheel(e: WheelEvent) {
    this.targetScroll += e.deltaY * 0.02;
  }

  private createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      side: THREE.DoubleSide,
      uniforms: {
        uScroll: { value: 0 },
        uRadius: { value: 2.2 },
        uTotalHeight: { value: this.totalHeight },
        uTime: { value: 0 },
      },
    });
  }

  private async createText() {
    const font = await this.loadFont('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json');
    const rawText = 'CYLINDER TEXT EFFECT';
    const spacedText = rawText.split('').join(' ');
    const repeatedText = `${spacedText}`.repeat(2);

    const radius = 2.2;
    const circumference = 2 * Math.PI * radius;

    for (let i = 0; i < this.lineCount; i++) {
      const texGeo = new TextGeometry(repeatedText, {
        font,
        size: 0.4,
        depth: 0.05,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.015,
        bevelSegments: 3,
      });

      texGeo.center();
      texGeo.computeBoundingBox();
      const currentWidth = (texGeo.boundingBox?.max.x ?? 0) - (texGeo.boundingBox?.min.x ?? 0);
      const scaleFactor = circumference / currentWidth;
      texGeo.scale(scaleFactor, 1, 1);

      this.mesh = new THREE.Mesh(texGeo, this.material);
      this.mesh.position.y = (i - this.lineCount / 2) * this.lineSpacing;
      // this.mesh.frustumCulled = false;
      this.texGroup.add(this.mesh);
    }
  }

  private loadFont(url: string) {
    return new Promise<Font>((resolve, reject) => {
      new FontLoader().load(url, resolve, undefined, reject);
    });
  }

  private animate() {
    const delta = this.clock.getDelta();

    this.currentScroll += (this.targetScroll - this.currentScroll) * 0.08;

    const scrollDelta = Math.abs(this.currentScroll - this.lastScroll);

    if (scrollDelta > 0.001) {
      this.uTimeValue += delta;
    }

    this.lastScroll = this.currentScroll;

    if (this.material?.uniforms?.uTime) {
      this.material.uniforms.uTime.value = this.uTimeValue;
    }

    if (this.material?.uniforms?.uScroll) {
      const wrappedScroll = ((this.currentScroll % this.totalHeight) + this.totalHeight) % this.totalHeight;
      this.material.uniforms.uScroll.value = wrappedScroll;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private resize() {
    this.camera.update();
  }
}

const app = new App(document.getElementById('webgl') as HTMLCanvasElement);

window.addEventListener('beforeunload', () => {
  app.dispose();
});
