import * as THREE from 'three';
import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {NgForOf, NgIf} from "@angular/common";
import {MatMenu} from "@angular/material/menu";
import {
  CdkMenu,
  CdkMenuGroup,
  CdkMenuItem,
  CdkMenuItemCheckbox,
  CdkMenuItemRadio,
  CdkMenuTrigger
} from "@angular/cdk/menu";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {MatProgressBar} from "@angular/material/progress-bar";
import {LoopSubdivision as Subdivision} from "three-subdivide";
import {AnimationMixer} from "three";
import {HTTP_INTERCEPTORS, HttpClient} from "@angular/common/http";
import {AuthenticationInterceptor} from '../../interceptors/authentication.interceptor';


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgIf,
    RouterOutlet,
    MatMenu,
    CdkMenuItem,
    CdkMenuItemCheckbox,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuGroup,
    FlexLayoutModule,
    FlexLayoutServerModule,
    NgForOf,
    CdkMenuItemRadio,
    MatProgressBar
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true,
    }
  ]
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild("canvas") private canvas!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private loader!: GLTFLoader;
  private scene!: THREE.Scene;

  private model!: THREE.Object3D;
  private body!: THREE.Object3D | undefined;

  private mixer!: THREE.AnimationMixer;
  private animations: THREE.AnimationClip[] = [];
  private currentAction!: THREE.AnimationAction;

  protected loading: boolean = true;
  protected progress: number = 0;

  public actions = ['Casual', 'Tongue out'];
  public selectedAction: string | undefined = 'casual';

  constructor() {
  }

  ngAfterViewInit(): void {
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  protected reset() {
    this.selectedAction = 'Normal';
  }

  private init() {
    // Load models
    this.loader = new GLTFLoader();

/*
    const models = ['eve', 'club'];

    let subjects: Promise<GLTF>[] = [];

    models.map((item, index) => {
      const gltf = this.loader.loadAsync(`http://localhost:8080/api/storage/${item}`, this.updateProgress);

      subjects.push(gltf);
    });
*/

    let current_user = localStorage.getItem('current_user');

    if (current_user) {
      const user = JSON.parse(current_user);
      this.loader.setRequestHeader({
        'Authorization':  `Bearer ${user.tokens.jwt}`
      });
      this.loader.withCredentials = true;
    }

    let url = '/api/storage/model/eve';
    const gltf = this.loader.loadAsync(url, this.updateProgress);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth - 20, window.innerHeight - 100);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.xr.enabled = true;

    this.canvas.nativeElement.appendChild(this.renderer.domElement);
    /*
        this.canvas.nativeElement.appendChild(VRButton.createButton(this.renderer));
    */

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#ffffff");

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 20) / (window.innerHeight - 100), .1, 30);
    this.camera.position.set(2.1, 3.5, -0.3);

    // Light
    const light = new THREE.HemisphereLight(0xffffff); // soft white light
    this.scene.add(light);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.lookAt(0, 3, 0);

/*
    Promise.all(subjects).then((models: GLTF[]) => {

    }).catch((error) => {});
*/

    gltf.then((model) => {
      this.model = model.scene;

      this.scene.add(this.model);

      this.mixer = new AnimationMixer(this.model);

      this.animations = model.animations;
      this.currentAction = this.mixer.clipAction(this.animations[0])

      this.renderer.setAnimationLoop(this.animate.bind(this));

      this.loading = false;
    });
  }

  @HostListener('window:resize', ['$event'])
  private onWindowResize() {
    if (typeof document !== 'undefined') {
      let width = window.innerWidth - 20;
      let height = window.innerHeight - 80;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer?.setSize(width, height);
    }
  }

  private updateProgress(event: ProgressEvent) {
    this.progress = (event.loaded / event.total) * 100;
  }

  protected subdivide() {
    const params = {
      split: true,
      uvSmooth: false,
      preserveEdges: false,
      flatOnly: false,
      maxTriangles: 20000,
    };

    let startTime
    let endTime;

    this.body = this.model?.getObjectByName("EveBody");
    this.body?.children.forEach((child) => {
      const mesh = child as THREE.Mesh;

      if (mesh.name == 'EveBody_6') return;

      startTime = performance.now()
      mesh.geometry = Subdivision.modify(mesh.geometry, 1, params);
      endTime = performance.now()

      console.log(`${mesh.name} subdivision took ${endTime - startTime} milliseconds`);
    });
  }

  private animate(): void {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  protected executeAction(name: string) {
    this.selectedAction = name;

    if ('Casual' != this.selectedAction) {
      if (!this.currentAction.isRunning())
        this.currentAction.play();
    } else {
      if (this.currentAction.isRunning())
        this.currentAction.stop();
    }

    let repeat = 3;
    const timer = setInterval(() => {
      repeat--;

      if (repeat)
        this.mixer.update(100);
      else
        clearInterval(timer);
    }, 100);

  }

  ngOnDestroy(): void {
    if (typeof document != 'undefined') {
      this.dispose(this.scene);
      this.scene?.remove(this.model);

      this.controls?.dispose();
      this.renderer?.dispose();
      this.renderer?.dispose();

      this.mixer?.stopAllAction();
      this.mixer?.uncacheRoot(this.model);
      this.mixer?.uncacheAction(this.currentAction.getClip());
    }
  }

  private dispose(object3D: THREE.Object3D): void {
    const parent = (object3D as any);
    if (parent instanceof THREE.Mesh || parent instanceof THREE.Points || parent instanceof THREE.Line)
      this.disposeObject(parent);

    if (object3D.children)
      object3D.children.forEach(child => this.dispose(child));
  }

  private disposeObject(mesh: THREE.Mesh | THREE.Points | THREE.Line): void {
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach(mat => this.disposeMaterial(mat));
    }
  }

  private disposeMaterial(material: THREE.Material): void {
    [
      'map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap', 'envMap',
      'alphaMap', 'aoMap', 'emissiveMap', 'metalnessMap', 'roughnessMap'
    ]
      .forEach(prop => {
        const texture = (material as any)[prop];
        if (texture instanceof THREE.Texture)
          texture.dispose();
      });

    material.dispose();
  }
}

