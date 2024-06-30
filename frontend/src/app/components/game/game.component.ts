import * as THREE from 'three';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {GLTF, GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
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
import {AnimationAction, AnimationClip, AnimationMixer, LoopOnce, PerspectiveCamera, Vector3} from "three";
import {HTTP_INTERCEPTORS, HttpClient} from "@angular/common/http";
import {AuthenticationInterceptor} from '../../interceptors/authentication.interceptor';
import {environment} from "../../../environments/environment";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";
import {KTX2Loader} from "three/examples/jsm/loaders/KTX2Loader.js";
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {BaseComponent} from "../base/base.component";
import {SecurityService} from "../../services/security.service";
import {FirstPersonControls} from "three/examples/jsm/controls/FirstPersonControls.js";
import {PointerLockControls} from "three/examples/jsm/controls/PointerLockControls";
import {iridescence} from "three/examples/jsm/nodes/core/PropertyNode";


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
export class GameComponent extends BaseComponent implements AfterViewInit, OnDestroy {
  @ViewChildren("canvas") private canvas!: QueryList<ElementRef>;

  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private controls!: PointerLockControls;
  private loader!: GLTFLoader;
  private scene!: THREE.Scene;

  private models: { [key: string]: THREE.Object3D  } = {};
  private animations: { [key: string]: THREE.AnimationClip } = {};
  private textures: { [key: string]: THREE.Texture } = {};

  private model!: THREE.Object3D;
  private body!: THREE.Object3D | undefined;

  private mixer!: THREE.AnimationMixer;
  private currentAction!: THREE.AnimationAction;

  protected loading: boolean = true;
  protected initialized: boolean = false;
  protected progress: number = 0;

  public actions = ['Casual', 'Tongue out'];
  public selectedAction: string | undefined = 'casual';

  private get_look_at(camera: PerspectiveCamera, distance = 2) {
    const direction = new THREE.Vector3();
    const result = new THREE.Vector3();
    const target = camera.getWorldDirection(direction).multiplyScalar(distance);

    return result.addVectors(camera.position, target);
  }

  public run(clip: AnimationClip, target?: THREE.Object3D, callback?: any): void {
    const scope = this;
    const timeout = clip.duration * 1000;
    const action = new AnimationAction(this.mixer, clip, target);

    action.clampWhenFinished = true;
    action.setLoop(THREE.LoopOnce, 1);
    action.play();

    setTimeout(function() {
      action.stop();

      if (callback)
        callback.bind(scope).call(action);
    }, timeout);
  }

  constructor(protected security: SecurityService) {
    super();
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

  ngAfterViewInit(): void {
    const scope = this;
    if (typeof document !== 'undefined' && this.authenticated()) {
      scope.init();
    }
    this.security.login.subscribe((event) => {
      scope.init();
    })
  }

  protected reset() {
    this.selectedAction = 'Normal';
  }

  private init() {
    const scope = this;

    // Load models
    this.loader = this.create_loader();

    const models: Promise<GLTF>[] = ['club', 'eve'].map((model: string) =>
      this.loader.loadAsync(`${environment.api_server}/storage/model/${model}`, this.update_progress)
    );

    // Renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth - 20, window.innerHeight - 100);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.xr.enabled = true;

    this.canvas.get(0)?.nativeElement.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#ffffff");

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, (window.innerWidth - 20) / (window.innerHeight - 100), .1, 30);

    Promise.all(models).then((models: GLTF[]) => {
      console.log(`Downloaded ${models.length} files.`)

      models.map(model => {

        model.animations.map((item, index) => {
          this.animations[item.name] = item;
        })

        this.scene.add(model.scene);
      })

      this.camera = this.scene.getObjectByName('MainCamera') as PerspectiveCamera || this.camera;

      this.mixer = new AnimationMixer(this.camera);

      this.run(this.animations['CameraAction'], this.camera, function (item: AnimationAction) {
        scope.controls = new PointerLockControls(scope.camera, scope.renderer.domElement);

        scope.scene.add(scope.controls.getObject());
        scope.run(scope.animations['Sits_on_a_couch_attention_B'], scope.scene.getObjectByName('Armature'));
      });

      this.renderer.setAnimationLoop(this.animate.bind(this));

      this.loading = false;
      this.initialized = true;
    }).catch((error) => {
      console.error(`Error model loading ${error}`);
    });
  }

  private create_loader() {
    const result = new GLTFLoader();

    let current_user = localStorage.getItem('current_user');
    if (current_user) {
      const user = JSON.parse(current_user);

      result.withCredentials = true;
      result.setRequestHeader({'Authorization': `Bearer ${user.tokens.jwt}`});
    }

    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

    const ktx2 = new KTX2Loader();
    ktx2.setTranscoderPath('./three/examples/jsm/libs/basis/');

    result.setDRACOLoader(draco);
    result.setKTX2Loader(ktx2);
    result.setMeshoptDecoder(MeshoptDecoder);

    return result;
  }

  @HostListener('window:resize', ['$event'])
  private window_resize() {
    if (typeof document !== 'undefined') {
      let width = window.innerWidth - 20;
      let height = window.innerHeight - 80;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer?.setSize(width, height);
    }
  }

  private update_progress(event: ProgressEvent) {
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

  private clock: THREE.Clock = new THREE.Clock;

  private animate(): void {
    let delta = this.clock.getDelta();

    this.mixer.update(delta);

    this.renderer.render(this.scene, this.camera);
  }

  protected execute_action(name: string) {
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

  private dispose(object3D: THREE.Object3D): void {
    const parent = (object3D as any);
    if (parent instanceof THREE.Mesh || parent instanceof THREE.Points || parent instanceof THREE.Line)
      this.dispose_object(parent);

    if (object3D.children)
      object3D.children.forEach(child => this.dispose(child));
  }

  private dispose_object(mesh: THREE.Mesh | THREE.Points | THREE.Line): void {
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    if (mesh.material) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach(mat => this.dispose_material(mat));
    }
  }

  private dispose_material(material: THREE.Material): void {
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

