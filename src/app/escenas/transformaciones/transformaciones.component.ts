import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { NotificationService } from '../../servicios/notification.service';

@Component({
  selector: 'app-transformaciones',
  templateUrl: './transformaciones.component.html',
  styleUrls: ['./transformaciones.component.scss']
})
export class TransformacionesComponent implements AfterViewInit {
  @ViewChild('c') private canvasRef!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private controls!: OrbitControls;
  private cube!: THREE.Mesh;
  userCommand: string = '';

  constructor(private notificationService: NotificationService) { }

  ngAfterViewInit(): void {
    this.initTHREE();
    this.animate();
  }

  private initTHREE(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth * 0.85, window.innerHeight * 0.75);
    this.renderer.setClearColor(0x1C1C1C);
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(5, 5, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(-1, 1, -1);
    this.scene.add(ambientLight, directionalLight);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({ color: 0x00FF49 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    const axesHelper = new THREE.AxesHelper(3);
    this.scene.add(axesHelper);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  executeCommand(): void {
    const commands = this.userCommand.split(';');
    const transformMatrix = new THREE.Matrix4();
    let valid = true;

    for (const command of commands) {
      const commandParts = command.split('(');
      const commandName = commandParts[0];
      const args = commandParts[1]?.replace(')', '').split(',');

      switch (commandName) {
        case 'rotar':
          if (!this.validateRotation(args)) {
            valid = false;
          }
          break;
        case 'escalar':
          if (!this.validateScaling(args)) {
            valid = false;
          }
          break;
        case 'trasladar':
          if (!this.validateTranslation(args)) {
            valid = false;
          }
          break;
        default:
          this.notificationService.mostrarMensaje('Comando no reconocido: ' + commandName);
          valid = false;
      }
    }

    if (valid) {
      for (const command of commands) {
        const commandParts = command.split('(');
        const commandName = commandParts[0];
        const args = commandParts[1]?.replace(')', '').split(',');

        switch (commandName) {
          case 'rotar':
            this.applyRotation(transformMatrix, args);
            break;
          case 'escalar':
            this.applyScaling(transformMatrix, args);
            break;
          case 'trasladar':
            this.applyTranslation(transformMatrix, args);
            break;
        }
      }

      this.cube.applyMatrix4(transformMatrix);
      this.notificationService.mostrarMensaje('Transformación aplicada correctamente');
    }
  }

  private isNumeric(value: string): boolean {
    return !isNaN(Number(value));
  }

  private validateScaling(args: string[] | undefined): boolean {
    if (!args || args.length !== 3 || !this.isNumeric(args[0]) || !this.isNumeric(args[1]) || !this.isNumeric(args[2])) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para escalado');
      return false;
    }
    return true;
  }

  private applyScaling(matrix: THREE.Matrix4, args: string[] | undefined): void {
    const scaleX = Number(args![0]);
    const scaleY = Number(args![1]);
    const scaleZ = Number(args![2]);
    const scalingMatrix = new THREE.Matrix4();
    scalingMatrix.makeScale(scaleX, scaleY, scaleZ);
    matrix.multiply(scalingMatrix);
  }

  private validateRotation(args: string[] | undefined): boolean {
    if (!args || args.length !== 2 || !this.isNumeric(args[1])) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para rotación');
      return false;
    }

    const axis = args[0].toLowerCase();
    if (axis !== 'x' && axis !== 'y' && axis !== 'z') {
      this.notificationService.mostrarMensaje('Eje de rotación no reconocido: ' + axis);
      return false;
    }

    return true;
  }

  private applyRotation(matrix: THREE.Matrix4, args: string[] | undefined): void {
    const axis = args![0].toLowerCase();
    const angle = Number(args![1]) * (Math.PI / 180);
    const rotationMatrix = new THREE.Matrix4();

    if (axis === 'x') {
      rotationMatrix.makeRotationX(angle);
    } else if (axis === 'y') {
      rotationMatrix.makeRotationY(angle);
    } else if (axis === 'z') {
      rotationMatrix.makeRotationZ(angle);
    }

    matrix.multiply(rotationMatrix);
  }

  private validateTranslation(args: string[] | undefined): boolean {
    if (!args || args.length !== 3 || !this.isNumeric(args[0]) || !this.isNumeric(args[1]) || !this.isNumeric(args[2])) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para translación');
      return false;
    }
    return true;
  }

  private applyTranslation(matrix: THREE.Matrix4, args: string[] | undefined): void {
    const x = Number(args![0]);
    const y = Number(args![1]);
    const z = Number(args![2]);
    const translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(x, y, z);
    matrix.multiply(translationMatrix);
  }

  resetScene(): void {
    this.cube.position.set(0, 0, 0);
    this.cube.rotation.set(0, 0, 0);
    this.cube.scale.set(1, 1, 1);
    this.cube.matrix.identity();

    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

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
