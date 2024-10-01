import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader } from 'three';
import { NotificationService } from '../../../servicios/notification.service';

@Component({
  selector: 'app-bumpmapping',
  templateUrl: './bumpmapping.component.html',
  styleUrls: ['./bumpmapping.component.scss']
})
export class BumpmappingComponent implements AfterViewInit {
  @ViewChild('c') protected canvasRef!: ElementRef;

  protected renderer!: THREE.WebGLRenderer;
  protected camera!: THREE.PerspectiveCamera;
  protected scene!: THREE.Scene;
  protected controls!: OrbitControls;
  protected object!: THREE.Mesh;
  protected bumpScale: number = 1;
  protected currentModel: string = 'cubo';

  userCommand: string = '';

  textures = [
    {
      name: 'Ladrillos',
      colorPath: '/assets/textures/bumpmap/bricks_color.jpg',
      bumpPath: '/assets/textures/bumpmap/bricks_bump.jpg'
    },
    {
      name: 'Fabric',
      colorPath: '/assets/textures/bumpmap/fabric_color.jpg',
      bumpPath: '/assets/textures/bumpmap/fabric_bump.jpg'
    },
    {
      name: 'Gravel',
      colorPath: '/assets/textures/bumpmap/gravel_color.jpg',
      bumpPath: '/assets/textures/bumpmap/gravel_bump.jpg'
    },
    {
      name: 'Tiles',
      colorPath: '/assets/textures/bumpmap/tiles_color.jpg',
      bumpPath: '/assets/textures/bumpmap/tiles_bump.jpg'
    },
  ];

  protected currentColorPath: string = this.textures[0].colorPath;
  protected currentBumpPath: string = this.textures[0].bumpPath;

  constructor(private notificationService: NotificationService) { }

  ngAfterViewInit(): void {
    this.initTHREE();
    this.createModel(this.currentModel, this.currentColorPath, this.currentBumpPath, false);
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

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(5, 5, 5);
    this.scene.add(light);
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
        case 'establecerEscalaBump':
          this.establecerEscalaBump(args);
          break;
        case 'cambiarModelo':
          this.cambiarModelo(args);
          break;
        default:
          this.notificationService.mostrarMensaje('Comando no reconocido: ' + commandName);
      }
    } catch (error: any) {
      this.notificationService.mostrarMensaje(error.message);
    }
  }

  protected createModel(type: string, colorPath: string, bumpPath: string, aviso: boolean): void {
    const loader = new THREE.TextureLoader();

    loader.load(colorPath, (colorTexture) => {
      loader.load(bumpPath, (bumpTexture) => {
        let geometry: THREE.BufferGeometry;

        switch (type) {
          case 'cubo':
            geometry = new THREE.BoxGeometry(5, 5, 5);
            if (aviso) { this.notificationService.mostrarMensaje('Modelo cambiado a ' + type); }
            break;
          case 'esfera':
            geometry = new THREE.SphereGeometry(3, 32, 32);
            if (aviso) { this.notificationService.mostrarMensaje('Modelo cambiado a ' + type); }
            break;
          case 'cono':
            geometry = new THREE.ConeGeometry(3, 6, 32);
            if (aviso) { this.notificationService.mostrarMensaje('Modelo cambiado a ' + type); }
            break;
          default:
            geometry = new THREE.BoxGeometry(5, 5, 5);
            this.notificationService.mostrarMensaje('Tipo de modelo no reconocido: ' + type);
        }

        const material = new THREE.MeshStandardMaterial({
          map: colorTexture,
          bumpMap: bumpTexture,
          bumpScale: this.bumpScale,
        });

        this.object = new THREE.Mesh(geometry, material);
        this.scene.add(this.object);
      });
    });
  }

  private cambiarModelo(args: string[] | undefined): void {
    if (!args || args.length !== 1) {
      this.notificationService.mostrarMensaje('Parámetro incorrecto para cambiarModelo');
      return;
    }

    const tipoModelo = args[0].trim().toLowerCase();
    this.currentModel = tipoModelo;
    this.scene.remove(this.object);
    this.createModel(tipoModelo, this.currentColorPath, this.currentBumpPath, true);
  }

  cambiarTextura(colorPath: string, bumpPath: string): void {
    this.currentColorPath = colorPath;
    this.currentBumpPath = bumpPath;
    this.scene.remove(this.object);
    this.createModel(this.currentModel, colorPath, bumpPath, false);
    this.notificationService.mostrarMensaje("Textura aplicada correctamente.")
  }

  private establecerEscalaBump(args: string[] | undefined): void {
    if (!args || args.length !== 1 || isNaN(Number(args[0]))) {
      this.notificationService.mostrarMensaje('Parámetro incorrecto para establecerEscalaBump');
      return;
    }

    let nuevoBumpScale = Number(args[0]);
    if (nuevoBumpScale < 0) {
      nuevoBumpScale = 0;
    } else if (nuevoBumpScale > 1000) {
      nuevoBumpScale = 1000;
    }

    this.bumpScale = nuevoBumpScale;
    if (this.object.material instanceof THREE.MeshStandardMaterial) {
      this.object.material.bumpScale = this.bumpScale;
      this.object.material.needsUpdate = true;
      this.notificationService.mostrarMensaje('Escala de bump establecida correctamente');
    }
  }

  resetScene(): void {
    this.camera.position.set(5, 5, 20);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.currentColorPath = this.textures[0].colorPath;
    this.currentBumpPath = this.textures[0].bumpPath;
    this.bumpScale = 1;

    this.scene.remove(this.object);

    this.createModel('cubo', this.currentColorPath, this.currentBumpPath, false);

    this.controls.reset();
    this.notificationService.mostrarMensaje('Escena reseteada correctamente');
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
