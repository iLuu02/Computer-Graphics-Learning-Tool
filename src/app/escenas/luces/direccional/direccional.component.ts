import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { TextureLoader } from 'three';
import { ColorService } from '../../../servicios/color.service';
import { ModelLoaderService } from '../../../servicios/model-loader.service';
import { NotificationService } from '../../../servicios/notification.service';

interface DirectionalLight {
  id: number;
  light: THREE.DirectionalLight;
  visual: THREE.Mesh;
  helper: THREE.DirectionalLightHelper;
}

@Component({
  selector: 'app-direccional',
  templateUrl: './direccional.component.html',
  styleUrls: ['./direccional.component.scss']
})
export class DireccionalComponent implements AfterViewInit {
  @ViewChild('c') protected canvasRef!: ElementRef;

  protected renderer!: THREE.WebGLRenderer;
  protected camera!: THREE.PerspectiveCamera;
  protected scene!: THREE.Scene;
  protected controls!: OrbitControls;
  protected lights: DirectionalLight[] = [];
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
    this.lights.forEach(light => light.helper.update());
    this.renderer.render(this.scene, this.camera);
  }

  executeCommand(): void {
    const commandParts = this.userCommand.split('(');
    const commandName = commandParts[0];
    const args = commandParts[1]?.replace(')', '').split(',');

    switch (commandName) {
      case 'crearLuzDireccional':
        this.crearLuzDireccional(args);
        break;
      case 'cambiarPosicion':
        this.cambiarPosicion(args);
        break;
      case 'actualizarLuz':
        this.actualizarLuz(args);
        break;
      case 'cambiarDireccionLuz':
        this.cambiarDireccionLuz(args);
        break;
      case 'borrarLuz':
        this.borrarLuz(args);
        break;
      default:
        this.notificationService.mostrarMensaje('Comando no reconocido: ' + commandName);
    }
  }

  private crearLuzDireccional(args: string[] | undefined): void {
    if (!args || args.length !== 5) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para crear luz direccional');
      return;
    }
  
    if (this.lights.length >= 10) {
      this.notificationService.mostrarMensaje('No se pueden crear más de 10 luces direccionales');
      return;
    }
  
    const colorInput = args[0];
    const color = this.colorService.getColor(colorInput);
    const intensidad = Number(args[1]);
    const x = Number(args[2]);
    const y = Number(args[3]);
    const z = Number(args[4]);
  
    if (isNaN(intensidad) || isNaN(x) || isNaN(y) || isNaN(z)) {
      this.notificationService.mostrarMensaje('Intensidad y posición deben ser números');
      return;
    }
  
    const luz = new THREE.DirectionalLight(new THREE.Color(color), intensidad);
    luz.position.set(x, y, z);

    this.scene.add(luz);
  
    const visual = this.createLightVisual(x, y, z, color);
    this.scene.add(visual);
  
    const helper = new THREE.DirectionalLightHelper(luz, 5);
    this.scene.add(helper);
  
    this.lights.push({ id: this.nextLightId, light: luz, visual, helper });
    this.nextLightId++;
    this.notificationService.mostrarMensaje('Luz direccional creada correctamente');
  }  

  private cambiarPosicion(args: string[] | undefined): void {
    if (!args || args.length !== 4) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiar posición de luz');
      return;
    }

    const id = Number(args[0]);
    const x = Number(args[1]);
    const y = Number(args[2]);
    const z = Number(args[3]);

    if (isNaN(id) || isNaN(x) || isNaN(y) || isNaN(z)) {
      this.notificationService.mostrarMensaje('ID y posición deben ser números');
      return;
    }

    const light = this.lights.find(l => l.id === id);
    if (light) {
      light.light.position.set(x, y, z);
      light.visual.position.set(x, y, z);
      light.helper.update();
      this.notificationService.mostrarMensaje('Posición de luz cambiada correctamente');
    } else {
      this.notificationService.mostrarMensaje('Luz no encontrada: ' + id);
    }
  }

  private actualizarLuz(args: string[] | undefined): void {
    if (!args || args.length !== 3) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para actualizar luz');
      return;
    }

    const id = Number(args[0]);
    const colorInput = args[1];
    const color = this.colorService.getColor(colorInput);
    const intensidad = Number(args[2]);

    if (isNaN(id) || isNaN(intensidad)) {
      this.notificationService.mostrarMensaje('ID e intensidad deben ser números');
      return;
    }

    const light = this.lights.find(l => l.id === id);
    if (light) {
      light.light.color.set(new THREE.Color(color));
      light.light.intensity = intensidad;
      if (light.visual.material instanceof THREE.MeshBasicMaterial) {
        light.visual.material.color.set(new THREE.Color(color));
      }
      light.helper.update();
      this.notificationService.mostrarMensaje('Luz actualizada correctamente');
    } else {
      this.notificationService.mostrarMensaje('Luz no encontrada: ' + id);
    }
  }

  private cambiarDireccionLuz(args: string[] | undefined): void {
    if (!args || args.length !== 4) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiar dirección de luz');
      return;
    }

    const id = Number(args[0]);
    const x = Number(args[1]);
    const y = Number(args[2]);
    const z = Number(args[3]);

    if (isNaN(id) || isNaN(x) || isNaN(y) || isNaN(z)) {
      this.notificationService.mostrarMensaje('ID y dirección deben ser números');
      return;
    }

    const light = this.lights.find(l => l.id === id);
    if (light) {
      light.light.target.position.set(x, y, z);
      light.helper.update();
      this.notificationService.mostrarMensaje('Dirección de luz cambiada correctamente');
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
      this.scene.remove(this.lights[lightIndex].visual);
      this.scene.remove(this.lights[lightIndex].helper);
      this.lights.splice(lightIndex, 1);
      this.notificationService.mostrarMensaje('Luz borrada correctamente');
    } else {
      this.notificationService.mostrarMensaje('Luz no encontrada: ' + id);
    }
  }

  private createLightVisual(x: number, y: number, z: number, color: string): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    return sphere;
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
