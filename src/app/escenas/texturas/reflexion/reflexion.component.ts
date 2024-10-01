import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ColorService } from '../../../servicios/color.service';
import { ModelLoaderService } from '../../../servicios/model-loader.service';
import { NotificationService } from '../../../servicios/notification.service';

@Component({
  selector: 'app-reflexion',
  templateUrl: './reflexion.component.html',
  styleUrls: ['./reflexion.component.scss']
})
export class ReflexionComponent implements AfterViewInit {
  @ViewChild('c') protected canvasRef!: ElementRef;

  protected renderer!: THREE.WebGLRenderer;
  protected camera!: THREE.PerspectiveCamera;
  protected scene!: THREE.Scene;
  protected controls!: OrbitControls;
  protected model!: THREE.Object3D;
  userCommand: string = '';
  roughness: number = 0.4;
  metalness: number = 0.5;

  constructor(private colorService: ColorService, private modelLoader: ModelLoaderService, private notificationService: NotificationService) { }

  ngAfterViewInit(): void {
    this.initTHREE();
    this.modelLoader.cargarFBX('/assets/models/Spiral.fbx', this.scene)
      .then(model => {
        this.model = model;
        this.animate();
      })
      .catch(error => console.error('Error al cargar el modelo:', error));
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
    this.camera.position.set(5, 5, 10);

    const axesHelper = new THREE.AxesHelper(3);
    this.scene.add(axesHelper);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight1.position.set(5, 5, 5);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight2.position.set(-5, 5, -5);
    this.scene.add(directionalLight2);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    this.scene.add(ambientLight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  protected animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  executeCommand(): void {
    if (!this.model) {
      this.notificationService.mostrarMensaje('El modelo no está cargado todavía');
      return;
    }

    const commandParts = this.userCommand.split('(');
    const commandName = commandParts[0];
    const args = commandParts[1]?.replace(')', '').split(',');

    try {
      switch (commandName) {
        case 'cambiarColor':
          this.cambiarColor(args);
          break;
        case 'cambiarEmisivo':
          this.cambiarEmisivo(args);
          break;
        case 'cambiarDifuso':
          this.cambiarDifuso(args);
          break;
        case 'cambiarEspecular':
          this.cambiarEspecular(args);
          break;
        default:
          this.notificationService.mostrarMensaje('Comando no reconocido: ' + commandName);
      }
    } catch (error: any) {
      this.notificationService.mostrarMensaje(error.message);
    }
  }

  private cambiarColor(args: string[] | undefined): void {
    if (!args || args.length !== 1) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiarColor');
      return;
    }

    const color = this.colorService.getColor(args[0]);
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshStandardMaterial).color.set(color);
      }
    });

    this.notificationService.mostrarMensaje('Color cambiado correctamente');
  }

  private cambiarEmisivo(args: string[] | undefined): void {
    if (!args || args.length !== 1) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiarEmisivo');
      return;
    }

    const color = this.colorService.getColor(args[0]);
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshStandardMaterial).emissive.set(color);
      }
    });

    this.notificationService.mostrarMensaje('Color emisivo cambiado correctamente');
  }

  private cambiarDifuso(args: string[] | undefined): void {
    if (!args || args.length !== 1 || isNaN(Number(args[0]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiarDifuso');
      return;
    }
  
    let intensidad = Number(args[0]);
    if (intensidad < 0) {
      intensidad = 0;
    } else if (intensidad > 1) {
      intensidad = 1;
    }
  
    this.roughness = intensidad;
  
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshStandardMaterial).roughness = intensidad;
      }
    });
  
    this.notificationService.mostrarMensaje('Difuso cambiado correctamente');
  }
  
  private cambiarEspecular(args: string[] | undefined): void {
    if (!args || args.length !== 1 || isNaN(Number(args[0]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiarEspecular');
      return;
    }
  
    let valor = Number(args[0]);
    if (valor < 0) {
      valor = 0;
    } else if (valor > 1) {
      valor = 1;
    }
  
    this.metalness = valor;
  
    this.model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshStandardMaterial).metalness = valor;
      }
    });
  
    this.notificationService.mostrarMensaje('Especular cambiado correctamente');
  }  

  resetScene(): void {
    this.camera.position.set(5, 5, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    if (this.model) {
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          material.color.set(0xbcbcbc); 
          material.emissive.set(0x000000); 
          material.roughness = 0.4;
          material.metalness = 0.5; 
          material.needsUpdate = true;
        }
      });
    }

    this.roughness = 0.4;
    this.metalness = 0.5;

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
