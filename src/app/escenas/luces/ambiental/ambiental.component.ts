import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ColorService } from '../../../servicios/color.service';
import { ModelLoaderService } from '../../../servicios/model-loader.service';
import { NotificationService } from '../../../servicios/notification.service';

interface Light {
  id: number;
  light: THREE.AmbientLight;
}

@Component({
  selector: 'app-ambiental',
  templateUrl: './ambiental.component.html',
  styleUrls: ['./ambiental.component.scss']
})
export class AmbientalComponent implements AfterViewInit {
  @ViewChild('c') protected canvasRef!: ElementRef;

  protected renderer!: THREE.WebGLRenderer;
  protected camera!: THREE.PerspectiveCamera;
  protected scene!: THREE.Scene;
  protected controls!: OrbitControls;
  protected lights: Light[] = [];
  protected nextLightId: number = 1;
  userCommand: string = '';

  constructor(
    private colorService: ColorService,
    private modelLoader: ModelLoaderService,
    private notificationService: NotificationService
  ) { }

  ngAfterViewInit(): void {
    this.initTHREE();
    this.modelLoader.cargarOBJ('/assets/models/Flamingo.obj', 'assets/textures/flamingo.png', this.scene);
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
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    const axesHelper = new THREE.AxesHelper(3);
    this.scene.add(axesHelper);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
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

    switch (commandName) {
      case 'crearLuzAmbiental':
        this.crearLuzAmbiental(args);
        break;
      case 'actualizarLuz':
        this.actualizarLuz(args);
        break;
      case 'borrarLuz':
        this.borrarLuz(args);
        break;
      default:
        this.notificationService.mostrarMensaje('Comando no reconocido: ' + commandName);
    }
  }

  private crearLuzAmbiental(args: string[] | undefined): void {
    if (!args || args.length !== 2) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para crear luz ambiental');
      return;
    }
  
    if (this.lights.length >= 10) {
      this.notificationService.mostrarMensaje('No se pueden crear más de 10 luces ambientales');
      return;
    }
  
    const color = this.colorService.getColor(args[0]);
    const intensidad = Number(args[1]);
  
    if (isNaN(intensidad)) {
      this.notificationService.mostrarMensaje('Intensidad de luz debe ser un número');
      return;
    }
  
    const luz = new THREE.AmbientLight(color, intensidad);
    this.scene.add(luz);
  
    this.lights.push({ id: this.nextLightId, light: luz });
    this.nextLightId++;
    this.notificationService.mostrarMensaje('Luz ambiental creada correctamente');
  }  

  private actualizarLuz(args: string[] | undefined): void {
    if (!args || args.length !== 3) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para actualizar luz');
      return;
    }

    const id = Number(args[0]);
    const color = this.colorService.getColor(args[1]);
    const intensidad = Number(args[2]);

    if (isNaN(id)) {
      this.notificationService.mostrarMensaje('ID de luz debe ser un número');
      return;
    }

    if (isNaN(intensidad)) {
      this.notificationService.mostrarMensaje('Intensidad de luz debe ser un número');
      return;
    }

    const light = this.lights.find(l => l.id === id);
    if (light) {
      light.light.color.set(color);
      light.light.intensity = intensidad;
      this.notificationService.mostrarMensaje('Luz actualizada correctamente');
    } else {
      this.notificationService.mostrarMensaje('Luz no encontrada: ' + id);
    }
  }

  private borrarLuz(args: string[] | undefined): void {
    if (!args || args.length !== 1) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para borrar luz');
      return;
    }

    const id = Number(args[0]);

    if (isNaN(id)) {
      this.notificationService.mostrarMensaje('ID de luz debe ser un número');
      return;
    }

    const lightIndex = this.lights.findIndex(l => l.id === id);
    if (lightIndex !== -1) {
      this.scene.remove(this.lights[lightIndex].light);
      this.lights.splice(lightIndex, 1);
      this.notificationService.mostrarMensaje('Luz borrada correctamente');
    } else {
      this.notificationService.mostrarMensaje('Luz no encontrada: ' + id);
    }
  }

  resetScene(): void {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }

    this.camera.position.set(5, 5, 20);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls.reset();

    const axesHelper = new THREE.AxesHelper(3);
    this.scene.add(axesHelper);

    this.lights = [];
    this.nextLightId = 1;

    this.modelLoader.cargarOBJ('/assets/models/Flamingo.obj', 'assets/textures/flamingo.png', this.scene);

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
