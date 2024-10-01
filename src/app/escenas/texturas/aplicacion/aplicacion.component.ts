import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader } from 'three';
import { NotificationService } from '../../../servicios/notification.service';

@Component({
  selector: 'app-aplicacion',
  templateUrl: './aplicacion.component.html',
  styleUrls: ['./aplicacion.component.scss']
})
export class AplicacionComponent implements AfterViewInit {
  @ViewChild('c') protected canvasRef!: ElementRef;

  protected renderer!: THREE.WebGLRenderer;
  protected camera!: THREE.PerspectiveCamera;
  protected scene!: THREE.Scene;
  protected controls!: OrbitControls;
  protected plane!: THREE.Mesh;
  protected texture!: THREE.Texture;
  userCommand: string = '';
  currentMinFilter: string = 'LinearFilter';
  currentMagFilter: string = 'LinearFilter';

  textures = [
    { name: 'Textura 1', path: '/assets/textures/aplicacion.png' },
    { name: 'Textura 2', path: '/assets/textures/mosaico.jpg' },
    { name: 'Textura 3', path: '/assets/textures/lineas.png' }
  ];

  constructor(private notificationService: NotificationService) { }

  ngAfterViewInit(): void {
    this.initTHREE();
    this.animate();
  }

  protected initTHREE(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth * 0.85, window.innerHeight * 0.75);
    this.renderer.setClearColor(0x1C1C1C);
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(5, 5, 20);
  
    const axesHelper = new THREE.AxesHelper(3);
    this.scene.add(axesHelper);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const geometry = new THREE.PlaneGeometry(10, 10);
    const loader = new TextureLoader();
    loader.load(this.textures[0].path, (texture) => {
      this.texture = texture;
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;

      const material = new THREE.MeshBasicMaterial({ map: this.texture });
      this.plane = new THREE.Mesh(geometry, material);
      this.scene.add(this.plane);
    });
  }

  protected animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  executeCommand(): void {
    const commandParts = this.userCommand.split('(');
    const commandName = commandParts[0];
    const args = commandParts[1]?.replace(')', '').split(',');

    try {
      switch (commandName) {
        case 'setMinFilter':
          this.setMinFilter(args);
          break;
        case 'setMagFilter':
          this.setMagFilter(args);
          break;
        case 'aplicarTextura':
          this.aplicarTextura(args);
          break;
        default:
          this.notificationService.mostrarMensaje('Comando no reconocido: ' + commandName);
      }
    } catch (error: any) {
      this.notificationService.mostrarMensaje(error.message);
    }
  }

  aplicarTextura(args: string[] | undefined): void {
    if (!args || args.length !== 1) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para aplicar textura');
      return;
    }

    const texturePath = args[0].trim();
    const loader = new TextureLoader();
    loader.load(texturePath, (texture) => {
      this.texture = texture;
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;

      const material = new THREE.MeshBasicMaterial({ map: this.texture });
      this.plane.material = material;
      this.texture.needsUpdate = true;

      this.currentMinFilter = 'LinearFilter';
      this.currentMagFilter = 'LinearFilter';
      this.notificationService.mostrarMensaje('Textura aplicada correctamente');
    }, undefined, () => {
      this.notificationService.mostrarMensaje('Error al cargar la textura: ' + texturePath);
    });
  }

  setMinFilter(args: string[] | undefined): void {
    if (!args || args.length !== 1) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para setMinFilter');
      return;
    }

    const filterType = args[0].trim();
    try {
      const filter = this.getMinFilterByName(filterType);

      if (this.texture) {
        this.texture.minFilter = filter;
        this.texture.needsUpdate = true;
        this.currentMinFilter = filterType;
        this.notificationService.mostrarMensaje('MinFilter aplicado correctamente');
      } else {
        this.notificationService.mostrarMensaje('Textura no encontrada');
      }
    } catch (error: any) {
      this.notificationService.mostrarMensaje(error.message);
    }
  }

  setMagFilter(args: string[] | undefined): void {
    if (!args || args.length !== 1) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para setMagFilter');
      return;
    }

    const filterType = args[0].trim();
    try {
      const filter = this.getMagFilterByName(filterType);

      if (this.texture) {
        this.texture.magFilter = filter;
        this.texture.needsUpdate = true;
        this.currentMagFilter = filterType;
        this.notificationService.mostrarMensaje('MagFilter aplicado correctamente');
      } else {
        this.notificationService.mostrarMensaje('Textura no encontrada');
      }
    } catch (error: any) {
      this.notificationService.mostrarMensaje(error.message);
    }
  }

  getMinFilterByName(filterName: string): THREE.MinificationTextureFilter {
    switch (filterName) {
      case 'NearestFilter':
        return THREE.NearestFilter;
      case 'NearestMipMapNearestFilter':
        return THREE.NearestMipMapNearestFilter;
      case 'NearestMipMapLinearFilter':
        return THREE.NearestMipMapLinearFilter;
      case 'LinearFilter':
        return THREE.LinearFilter;
      case 'LinearMipMapNearestFilter':
        return THREE.LinearMipMapNearestFilter;
      case 'LinearMipMapLinearFilter':
        return THREE.LinearMipMapLinearFilter;
      default:
        throw new Error('Filter no reconocido: ' + filterName);
    }
  }

  getMagFilterByName(filterName: string): THREE.MagnificationTextureFilter {
    switch (filterName) {
      case 'NearestFilter':
        return THREE.NearestFilter;
      case 'LinearFilter':
        return THREE.LinearFilter;
      default:
        throw new Error('Filter no reconocido: ' + filterName);
    }
  }

  resetScene(): void {
    this.camera.position.set(5, 5, 20);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    const loader = new TextureLoader();
    loader.load(this.textures[0].path, (texture) => {
      this.texture = texture;
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;

      const material = new THREE.MeshBasicMaterial({ map: this.texture });
      this.plane.material = material;
      this.texture.needsUpdate = true;
      this.currentMinFilter = 'LinearFilter';
      this.currentMagFilter = 'LinearFilter';
      this.notificationService.mostrarMensaje('Escena reseteada correctamente');
    });

    this.controls.reset();
  }

  ngOnDestroy(): void {
    if (this.scene) {
      const disposeObject = (object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
        if (object instanceof THREE.Light) {
          if (typeof (object as any).dispose === 'function') {
            (object as any).dispose();
          }
        }
        object.children.forEach(child => disposeObject(child));
      };

      disposeObject(this.scene);

      this.scene.clear();
      this.scene = undefined as any;
    }

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = undefined as any;
    }

    if (this.camera) {
      this.camera = undefined as any;
    }

    if (this.controls) {
      this.controls.dispose();
      this.controls = undefined as any;
    }
  }
  
}
