import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader } from 'three';
import { ColorService } from '../../servicios/color.service';
import { NotificationService } from '../../servicios/notification.service';

interface Light {
  id: number;
  type: string;
  light: THREE.Light;
  helper?: THREE.Object3D;
  visual?: THREE.Mesh;
}

@Component({
  selector: 'app-escenalibre',
  templateUrl: './escenalibre.component.html',
  styleUrls: ['./escenalibre.component.scss']
})
export class EscenaLibreComponent implements AfterViewInit {
  @ViewChild('c') private canvasRef!: ElementRef;

  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private controls!: OrbitControls;
  private objects: { [id: number]: THREE.Mesh } = {};
  private lights: { [id: number]: Light } = {};
  private objectIdCounter: number = 0;
  private lightIdCounter: number = 0;
  userCommand: string = '';
  bumpScale: number = 1;

  bumpTextures = [
    { name: 'Ladrillos', colorPath: '/assets/textures/bumpmap/bricks_color.jpg', bumpPath: '/assets/textures/bumpmap/bricks_bump.jpg' },
    { name: 'Tela', colorPath: '/assets/textures/bumpmap/fabric_color.jpg', bumpPath: '/assets/textures/bumpmap/fabric_bump.jpg' },
    { name: 'Gravila', colorPath: '/assets/textures/bumpmap/gravel_color.jpg', bumpPath: '/assets/textures/bumpmap/gravel_bump.jpg' },
    { name: 'Azulejos', colorPath: '/assets/textures/bumpmap/tiles_color.jpg', bumpPath: '/assets/textures/bumpmap/tiles_bump.jpg' },
  ];

  constructor(private colorService: ColorService, private notificationService: NotificationService) { }

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

    const axesHelper = new THREE.AxesHelper(3);
    this.scene.add(axesHelper);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  getObjectsList(): { id: number, type: string }[] {
    return Object.keys(this.objects).map(id => ({
      id: Number(id),
      type: this.getObjectType(this.objects[Number(id)])
    }));
  }

  getLightsList(): { id: number, type: string, color: string, position: string }[] {
    return Object.keys(this.lights).map(id => {
      const light = this.lights[Number(id)];
      return {
        id: light.id,
        type: light.type,
        color: light.light.color.getStyle(),
        position: `(${Math.round(light.light.position.x)}, ${Math.round(light.light.position.y)}, ${Math.round(light.light.position.z)})`,
      };
    });
  }  

  private getObjectType(mesh: THREE.Mesh): string {
    const geometry = mesh.geometry;
    if (geometry instanceof THREE.BoxGeometry) return 'Cubo';
    if (geometry instanceof THREE.SphereGeometry) return 'Esfera';
    if (geometry instanceof THREE.CylinderGeometry) return 'Cilindro';
    if (geometry instanceof THREE.ConeGeometry) return 'Cono';
    if (geometry instanceof THREE.PlaneGeometry) return 'Plano';
    if (geometry instanceof THREE.TetrahedronGeometry) return 'Tetraedro';
    if (geometry instanceof THREE.OctahedronGeometry) return 'Octaedro';
    if (geometry instanceof THREE.IcosahedronGeometry) return 'Icosaedro';
    if (geometry instanceof THREE.TorusGeometry) return 'Torus';
    return 'Desconocido';
  }
  
  executeCommand(): void {
    const command = this.userCommand.trim();
    const transformationMatrix = new THREE.Matrix4();
    let id: number | null = null;

    const [commandName, paramString] = command.split('(');
    const args = paramString?.replace(')', '').split(',').map(arg => arg.trim());

    switch (commandName) {
      case 'crearPrimitiva':
        if (this.objectIdCounter >= 10) {
          this.notificationService.mostrarMensaje('No es posible crear más de 10 primitivas.');
        } else {
          this.createPrimitive(args);
        }
        break;
      case 'rotar':
      case 'escalar':
      case 'trasladar':
        id = Number(args![0]);
        if (isNaN(id) || !this.objects[id]) {
          this.notificationService.mostrarMensaje('ID de objeto no válido.');
          return;
        }
        if (commandName === 'rotar') {
          this.applyRotation(transformationMatrix, args);
        } else if (commandName === 'escalar') {
          this.applyScaling(transformationMatrix, args);
        } else if (commandName === 'trasladar') {
          this.applyTranslation(transformationMatrix, args);
        }
        break;
      case 'borrarPrimitiva':
        this.deletePrimitive(Number(args![0]));
        break;
      case 'crearLuzAmbiental':
      case 'crearLuzDireccional':
      case 'crearLuzPuntual':
      case 'crearLuzFoco':
        if (this.lightIdCounter >= 10) {
          this.notificationService.mostrarMensaje('No es posible crear más de 10 luces.');
        } else {
          if (commandName === 'crearLuzAmbiental') this.crearLuzAmbiental(args);
          if (commandName === 'crearLuzDireccional') this.crearLuzDireccional(args);
          if (commandName === 'crearLuzPuntual') this.crearLuzPuntual(args);
          if (commandName === 'crearLuzFoco') this.crearLuzFoco(args);
        }
        break;
      case 'actualizarLuzAmbiental':
        this.actualizarLuzAmbiental(args);
        break;
      case 'actualizarLuzDireccional':
        this.actualizarLuzDireccional(args);
        break;
      case 'actualizarLuzPuntual':
        this.actualizarLuzPuntual(args);
        break;
      case 'actualizarLuzFoco':
        this.actualizarLuzFoco(args);
        break;
      case 'cambiarPosicionLuz':
        this.cambiarPosicionLuz(args);
        break;
      case 'cambiarDireccionLuz':
        this.cambiarDireccionLuz(args);
        break;
      case 'borrarLuz':
        this.borrarLuz(Number(args![0]));
        break;
      case 'aplicarTextura':
        this.aplicarTextura(args);
        break;
      case 'setMinFilter':
        this.setMinFilter(args);
        break;
      case 'setMagFilter':
        this.setMagFilter(args);
        break;
      case 'cambiarDifuso':
        this.cambiarDifuso(args);
        break;
      case 'cambiarEspecular':
        this.cambiarEspecular(args);
        break;
      case 'setBumpScale':
        this.setBumpScale(args);
        break;
      default:
        this.notificationService.mostrarMensaje('Comando no reconocido.');
        break;
    }

    if (id !== null && this.objects[id]) {
      const mesh = this.objects[id];
      mesh.applyMatrix4(transformationMatrix);
    }
  }
 
  private createPrimitive(args: string[] | undefined): void {
    if (!args || args.length !== 1) {
      this.notificationService.mostrarMensaje('Número incorrecto de parámetros para crearPrimitiva.');
      return;
    }

    const type = args[0].toLowerCase();
    let geometry: THREE.BufferGeometry;

    switch (type) {
      case 'plano':
        geometry = new THREE.PlaneGeometry();
        break;
      case 'cubo':
        geometry = new THREE.BoxGeometry();
        break;
      case 'esfera':
        geometry = new THREE.SphereGeometry();
        break;
      case 'cilindro':
        geometry = new THREE.CylinderGeometry();
        break;
      case 'cono':
        geometry = new THREE.ConeGeometry();
        break;
      case 'tetraedro':
        geometry = new THREE.TetrahedronGeometry();
        break;
      case 'octaedro':
        geometry = new THREE.OctahedronGeometry();
        break;
      case 'icosaedro':
        geometry = new THREE.IcosahedronGeometry();
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry();
        break;
      default:
        this.notificationService.mostrarMensaje('Tipo de primitiva no reconocido.');
        return;
    }

    const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;

    const id = this.objectIdCounter++;
    this.objects[id] = mesh;
    this.scene.add(mesh);
    this.notificationService.mostrarMensaje('Primitiva creada correctamente.');
  }

  private applyRotation(matrix: THREE.Matrix4, args: string[] | undefined): void {
    if (!args || args.length !== 3 || !['x', 'y', 'z'].includes(args[1].toLowerCase()) || isNaN(Number(args[2]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para rotar.');
      return;
    }

    const axis = args[1].toLowerCase();
    const angle = Number(args[2]) * (Math.PI / 180);
    const rotationMatrix = new THREE.Matrix4();

    switch (axis) {
      case 'x':
        rotationMatrix.makeRotationX(angle);
        break;
      case 'y':
        rotationMatrix.makeRotationY(angle);
        break;
      case 'z':
        rotationMatrix.makeRotationZ(angle);
        break;
    }

    matrix.multiply(rotationMatrix);
    this.notificationService.mostrarMensaje('Rotación aplicada correctamente.');
  }

  private applyScaling(matrix: THREE.Matrix4, args: string[] | undefined): void {
    if (!args || args.length !== 4 || isNaN(Number(args[1])) || isNaN(Number(args[2])) || isNaN(Number(args[3]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para escalar.');
      return;
    }

    const scaleX = Number(args[1]);
    const scaleY = Number(args[2]);
    const scaleZ = Number(args[3]);
    const scalingMatrix = new THREE.Matrix4();
    scalingMatrix.makeScale(scaleX, scaleY, scaleZ);

    matrix.multiply(scalingMatrix);
    this.notificationService.mostrarMensaje('Escalado aplicado correctamente.');
  }

  private applyTranslation(matrix: THREE.Matrix4, args: string[] | undefined): void {
    if (!args || args.length !== 4 || isNaN(Number(args[1])) || isNaN(Number(args[2])) || isNaN(Number(args[3]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para trasladar.');
      return;
    }

    const x = Number(args[1]);
    const y = Number(args[2]);
    const z = Number(args[3]);
    const translationMatrix = new THREE.Matrix4();
    translationMatrix.makeTranslation(x, y, z);

    matrix.multiply(translationMatrix);
    this.notificationService.mostrarMensaje('Traslación aplicada correctamente.');
  }

  private deletePrimitive(id: number): void {
    if (this.objects[id]) {
      this.scene.remove(this.objects[id]);
      delete this.objects[id];
      this.notificationService.mostrarMensaje('Primitiva eliminada correctamente.');
    } else {
      this.notificationService.mostrarMensaje('ID de primitiva no válido.');
    }
  }

  private crearLuzAmbiental(args: string[] | undefined): void {
    if (!args || args.length !== 2 || isNaN(Number(args[1]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para crearLuzAmbiental.');
      return;
    }
  
    const color = this.colorService.getColor(args[0]);
    let intensidad = Number(args[1]);
    if (intensidad < 0) {
      intensidad = 0;
    }
  
    const luz = new THREE.AmbientLight(color, intensidad);
    this.scene.add(luz);
  
    const id = this.lightIdCounter++;
    this.lights[id] = { id, type: 'ambient', light: luz };
    this.notificationService.mostrarMensaje('Luz ambiental creada correctamente.');
  }
  

  private crearLuzDireccional(args: string[] | undefined): void {
    if (!args || args.length !== 5 || isNaN(Number(args[1])) || isNaN(Number(args[2])) || isNaN(Number(args[3])) || isNaN(Number(args[4]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para crearLuzDireccional.');
      return;
    }
  
    const color = this.colorService.getColor(args[0]);
    let intensidad = Number(args[1]);
    if (intensidad < 0) {
      intensidad = 0;
    }
  
    const x = Number(args[2]);
    const y = Number(args[3]);
    const z = Number(args[4]);
  
    const luz = new THREE.DirectionalLight(new THREE.Color(color), intensidad);
    luz.position.set(x, y, z);
    luz.castShadow = true;
  
    const helper = new THREE.DirectionalLightHelper(luz, 5);
    this.scene.add(helper);
  
    const id = this.lightIdCounter++;
    this.lights[id] = { id, type: 'directional', light: luz, helper };
    this.scene.add(luz);
    this.notificationService.mostrarMensaje('Luz direccional creada correctamente.');
  }
  

  private crearLuzPuntual(args: string[] | undefined): void {
    if (!args || args.length !== 7 || isNaN(Number(args[1])) || isNaN(Number(args[2])) || isNaN(Number(args[3])) || isNaN(Number(args[4])) || isNaN(Number(args[5])) || isNaN(Number(args[6]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para crearLuzPuntual.');
      return;
    }
  
    const color = this.colorService.getColor(args[0]);
    let intensidad = Number(args[1]);
    let distancia = Number(args[2]);
    let decay = Number(args[3]);
    if (intensidad < 0) {
      intensidad = 0;
    }
    if (distancia < 0) {
      distancia = 0;
    }
    if (decay < 0) {
      decay = 0;
    }
  
    const x = Number(args[4]);
    const y = Number(args[5]);
    const z = Number(args[6]);
  
    const luz = new THREE.PointLight(new THREE.Color(color), intensidad, distancia, decay);
    luz.position.set(x, y, z);
    luz.castShadow = true;
  
    const visual = this.createLightVisual(x, y, z, color);
    this.scene.add(visual);
  
    const id = this.lightIdCounter++;
    this.lights[id] = { id, type: 'point', light: luz, visual };
    this.scene.add(luz);
    this.notificationService.mostrarMensaje('Luz puntual creada correctamente.');
  }
  

  private crearLuzFoco(args: string[] | undefined): void {
    if (!args || args.length !== 8 || isNaN(Number(args[1])) || isNaN(Number(args[2])) || isNaN(Number(args[3])) || isNaN(Number(args[4])) || isNaN(Number(args[5])) || isNaN(Number(args[6])) || isNaN(Number(args[7]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para crearLuzFoco.');
      return;
    }
  
    const color = this.colorService.getColor(args[0]);
    let intensidad = Number(args[1]);
    let distancia = Number(args[2]);
    let angulo = Number(args[3]) * (Math.PI / 180);
    let penumbra = Number(args[4]);
    if (intensidad < 0) {
      intensidad = 0;
    }
    if (distancia < 0) {
      distancia = 0;
    }
    if (angulo < 0) {
      angulo = 0;
    }
    if (penumbra < 0) {
      penumbra = 0;
    }
  
    const x = Number(args[5]);
    const y = Number(args[6]);
    const z = Number(args[7]);
  
    const luz = new THREE.SpotLight(new THREE.Color(color), intensidad, distancia, angulo, penumbra);
    luz.position.set(x, y, z);
    luz.castShadow = true;
  
    const helper = new THREE.SpotLightHelper(luz);
    this.scene.add(helper);
  
    const visual = this.createLightVisual(x, y, z, color);
    this.scene.add(visual);
  
    const id = this.lightIdCounter++;
    this.lights[id] = { id, type: 'spot', light: luz, helper, visual };
    this.scene.add(luz);
    this.notificationService.mostrarMensaje('Luz foco creada correctamente.');
  }
  
  private actualizarLuzAmbiental(args: string[] | undefined): void {
    if (!args || args.length !== 3 || isNaN(Number(args[2]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para actualizarLuzAmbiental.');
      return;
    }
  
    const id = Number(args[0]);
    const color = this.colorService.getColor(args[1]);
    let intensidad = Number(args[2]);
    if (intensidad < 0) {
      intensidad = 0;
    }
  
    const light = this.lights[id];
    if (light && light.type === 'ambient') {
      light.light.color.set(color);
      light.light.intensity = intensidad;
      this.notificationService.mostrarMensaje('Luz ambiental actualizada correctamente.');
    } else {
      this.notificationService.mostrarMensaje('ID de luz ambiental no válido.');
    }
  }
  

  private actualizarLuzDireccional(args: string[] | undefined): void {
    if (!args || args.length !== 3 || isNaN(Number(args[2]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para actualizarLuzDireccional.');
      return;
    }
  
    const id = Number(args[0]);
    const color = this.colorService.getColor(args[1]);
    let intensidad = Number(args[2]);
    if (intensidad < 0) {
      intensidad = 0;
      this.notificationService.mostrarMensaje('Valor de intensidad negativo ajustado a 0.');
    }
  
    const light = this.lights[id];
    if (light && light.type === 'directional') {
      light.light.color.set(color);
      light.light.intensity = intensidad;
      if (light.helper && light.helper instanceof THREE.DirectionalLightHelper) {
        light.helper.update();
      }
      this.notificationService.mostrarMensaje('Luz direccional actualizada correctamente.');
    } else {
      this.notificationService.mostrarMensaje('ID de luz direccional no válido.');
    }
  }
  

  private actualizarLuzPuntual(args: string[] | undefined): void {
    if (!args || args.length !== 5 || isNaN(Number(args[2])) || isNaN(Number(args[3])) || isNaN(Number(args[4]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para actualizarLuzPuntual.');
      return;
    }
  
    const id = Number(args[0]);
    const color = this.colorService.getColor(args[1]);
    let intensidad = Number(args[2]);
    let distancia = Number(args[3]);
    let decay = Number(args[4]);
    if (intensidad < 0) {
      intensidad = 0;
      this.notificationService.mostrarMensaje('Valor de intensidad negativo ajustado a 0.');
    }
    if (distancia < 0) {
      distancia = 0;
      this.notificationService.mostrarMensaje('Valor de distancia negativo ajustado a 0.');
    }
    if (decay < 0) {
      decay = 0;
      this.notificationService.mostrarMensaje('Valor de decay negativo ajustado a 0.');
    }
  
    const light = this.lights[id];
    if (light && light.type === 'point') {
      light.light.color.set(color);
      light.light.intensity = intensidad;
      (light.light as THREE.PointLight).distance = distancia;
      (light.light as THREE.PointLight).decay = decay;
      if (light.visual && light.visual.material instanceof THREE.MeshBasicMaterial) {
        light.visual.material.color.set(color);
      }
      this.notificationService.mostrarMensaje('Luz puntual actualizada correctamente.');
    } else {
      this.notificationService.mostrarMensaje('ID de luz puntual no válido.');
    }
  }  

  private actualizarLuzFoco(args: string[] | undefined): void {
    if (!args || args.length !== 6 || isNaN(Number(args[2])) || isNaN(Number(args[3])) || isNaN(Number(args[4])) || isNaN(Number(args[5]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para actualizarLuzFoco.');
      return;
    }
  
    const id = Number(args[0]);
    const color = this.colorService.getColor(args[1]);
    let intensidad = Number(args[2]);
    let distancia = Number(args[3]);
    let angulo = Number(args[4]) * (Math.PI / 180);
    let penumbra = Number(args[5]);
    if (intensidad < 0) {
      intensidad = 0;
    }
    if (distancia < 0) {
      distancia = 0;
    }
    if (angulo < 0) {
      angulo = 0;
    }
    if (penumbra < 0) {
      penumbra = 0;
    }
  
    const light = this.lights[id];
    if (light && light.type === 'spot') {
      light.light.color.set(color);
      light.light.intensity = intensidad;
      (light.light as THREE.SpotLight).distance = distancia;
      (light.light as THREE.SpotLight).angle = angulo;
      (light.light as THREE.SpotLight).penumbra = penumbra;
      if (light.visual && light.visual.material instanceof THREE.MeshBasicMaterial) {
        light.visual.material.color.set(color);
      }
      if (light.helper && light.helper instanceof THREE.SpotLightHelper) {
        light.helper.update();
      }
      this.notificationService.mostrarMensaje('Luz foco actualizada correctamente.');
    } else {
      this.notificationService.mostrarMensaje('ID de luz foco no válido.');
    }
  }  

  private cambiarPosicionLuz(args: string[] | undefined): void {
    if (!args || args.length !== 4 || isNaN(Number(args[0])) || isNaN(Number(args[1])) || isNaN(Number(args[2])) || isNaN(Number(args[3]))) {
        this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiarPosicionLuz.');
        return;
    }

    const id = Number(args[0]);
    const x = Number(args[1]);
    const y = Number(args[2]);
    const z = Number(args[3]);

    const light = this.lights[id];
    if (light) {
        light.light.position.set(x, y, z);
        if (light.visual) {
            light.visual.position.set(x, y, z);
        }
        if (light.helper && light.helper instanceof THREE.DirectionalLightHelper) {
            (light.helper as THREE.DirectionalLightHelper).update();
        } else if (light.helper && light.helper instanceof THREE.SpotLightHelper) {
            (light.helper as THREE.SpotLightHelper).update();
        }
        this.notificationService.mostrarMensaje('Posición de luz actualizada correctamente.');
    } else {
        this.notificationService.mostrarMensaje('ID de luz no válido.');
    }
}

private cambiarDireccionLuz(args: string[] | undefined): void {
  if (!args || args.length !== 4 || isNaN(Number(args[0])) || isNaN(Number(args[1])) || isNaN(Number(args[2])) || isNaN(Number(args[3]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiarDireccionLuz.');
      return;
  }

  const id = Number(args[0]);
  const x = Number(args[1]);
  const y = Number(args[2]);
  const z = Number(args[3]);

  const light = this.lights[id];
  if (light && light.type === 'directional' && light.light instanceof THREE.DirectionalLight) {
      light.light.target.position.set(x, y, z);
      if (light.helper && light.helper instanceof THREE.DirectionalLightHelper) {
          (light.helper as THREE.DirectionalLightHelper).update();
      }
      this.notificationService.mostrarMensaje('Dirección de luz direccional actualizada correctamente.');
  } else if (light && light.type === 'spot' && light.light instanceof THREE.SpotLight) {
      light.light.target.position.set(x, y, z);
      if (light.helper && light.helper instanceof THREE.SpotLightHelper) {
          (light.helper as THREE.SpotLightHelper).update();
      }
      this.notificationService.mostrarMensaje('Dirección de luz foco actualizada correctamente.');
  } else {
      this.notificationService.mostrarMensaje('ID de luz no válido.');
  }
}

  private borrarLuz(id: number): void {
    const light = this.lights[id];
    if (light) {
      this.scene.remove(light.light);
      if (light.visual) {
        this.scene.remove(light.visual);
      }
      if (light.helper) {
        this.scene.remove(light.helper);
      }
      delete this.lights[id];
      this.notificationService.mostrarMensaje('Luz eliminada correctamente.');
    } else {
      this.notificationService.mostrarMensaje('ID de luz no válido.');
    }
  }

  private createLightVisual(x: number, y: number, z: number, color: string): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.25, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    return sphere;
  }

  private aplicarTextura(args: string[] | undefined): void {
    const id = Number(args![0]);
    const textureName = args![1].trim();
    const textureData = this.bumpTextures.find(t => t.name === textureName);
    if (textureData) {
      const loader = new TextureLoader();
      loader.load(textureData.colorPath, (colorTexture) => {
        loader.load(textureData.bumpPath, (bumpTexture) => {
          const object = this.objects[id];
          if (object) {
            object.material = new THREE.MeshStandardMaterial({
              map: colorTexture,
              bumpMap: bumpTexture,
              bumpScale: this.bumpScale,
            });
            colorTexture.needsUpdate = true;
            bumpTexture.needsUpdate = true;
            this.notificationService.mostrarMensaje('Textura aplicada correctamente.');
          } else {
            this.notificationService.mostrarMensaje('ID de objeto no válido.');
          }
        });
      });
    } else {
      this.notificationService.mostrarMensaje('Nombre de textura no válido.');
    }
  }

  private setBumpScale(args: string[] | undefined): void {
    if (!args || args.length !== 2 || isNaN(Number(args[0])) || isNaN(Number(args[1]))) {
        this.notificationService.mostrarMensaje('Parámetros incorrectos para setBumpScale.');
        return;
    }

    const id = Number(args[0]);
    let scale = Number(args[1]);
    scale = scale < 0 ? 0 : (scale > 1000 ? 1000 : scale);

    const object = this.objects[id];
    if (object && object.material instanceof THREE.MeshStandardMaterial) {
        object.material.bumpScale = scale;
        object.material.needsUpdate = true;
        this.notificationService.mostrarMensaje('Escala de bump aplicada correctamente.');
    } else {
        this.notificationService.mostrarMensaje('ID de objeto no válido.');
    }
}

  private setMinFilter(args: string[] | undefined): void {
    const id = Number(args![0]);
    const filterType = args![1].trim();
    const object = this.objects[id];
    if (object && object.material instanceof THREE.MeshStandardMaterial) {
      const texture = object.material.map;
      if (texture) {
        const minFilter = this.getMinFilterByName(filterType);
        if (minFilter) {
          texture.minFilter = minFilter;
          texture.needsUpdate = true;
          this.notificationService.mostrarMensaje('Filtro aplicado correctamente.');
        } else {
          this.notificationService.mostrarMensaje('Filtro no reconocido.');
        }
      } else {
        this.notificationService.mostrarMensaje('Textura no encontrada.');
      }
    } else {
      this.notificationService.mostrarMensaje('ID de objeto no válido.');
    }
  }

  private setMagFilter(args: string[] | undefined): void {
    const id = Number(args![0]);
    const filterType = args![1].trim();
    const object = this.objects[id];
    if (object && object.material instanceof THREE.MeshStandardMaterial) {
      const texture = object.material.map;
      if (texture) {
        const magFilter = this.getMagFilterByName(filterType);
        if (magFilter) {
          texture.magFilter = magFilter;
          texture.needsUpdate = true;
          this.notificationService.mostrarMensaje('Filtro aplicado correctamente.');
        } else {
          this.notificationService.mostrarMensaje('Filtro no reconocido.');
        }
      } else {
        this.notificationService.mostrarMensaje('Textura no encontrada.');
      }
    } else {
      this.notificationService.mostrarMensaje('ID de objeto no válido.');
    }
  }

  private getMinFilterByName(filterName: string): THREE.MinificationTextureFilter | null {
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
        return null;
    }
  }

  private getMagFilterByName(filterName: string): THREE.MagnificationTextureFilter | null {
    switch (filterName) {
      case 'NearestFilter':
        return THREE.NearestFilter;
      case 'LinearFilter':
        return THREE.LinearFilter;
      default:
        return null;
    }
  }

  private cambiarDifuso(args: string[] | undefined): void {
    if (!args || args.length !== 2 || isNaN(Number(args[0])) || isNaN(Number(args[1]))) {
        this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiarDifuso.');
        return;
    }

    const id = Number(args[0]);
    let intensidad = Number(args[1]);
    intensidad = Math.max(0, Math.min(1, intensidad));
    const object = this.objects[id];
    if (object && object.material instanceof THREE.MeshStandardMaterial) {
        object.material.roughness = intensidad;
        object.material.needsUpdate = true;
        this.notificationService.mostrarMensaje('Propiedad difusa actualizada correctamente.');
    } else {
        this.notificationService.mostrarMensaje('ID de objeto no válido.');
    }
}

private cambiarEspecular(args: string[] | undefined): void {
  if (!args || args.length !== 2 || isNaN(Number(args[0])) || isNaN(Number(args[1]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para cambiarEspecular.');
      return;
  }

  const id = Number(args[0]);
  let valor = Number(args[1]);
  valor = Math.max(0, Math.min(1, valor));
  const object = this.objects[id];
  if (object && object.material instanceof THREE.MeshStandardMaterial) {
      object.material.metalness = valor;
      object.material.needsUpdate = true;
      this.notificationService.mostrarMensaje('Propiedad especular actualizada correctamente.');
  } else {
      this.notificationService.mostrarMensaje('ID de objeto no válido.');
  }
}


  resetScene(): void {
    for (const id in this.objects) {
      this.scene.remove(this.objects[id]);
    }
    for (const id in this.lights) {
      const light = this.lights[id];
      this.scene.remove(light.light);
      if (light.visual) {
        this.scene.remove(light.visual);
      }
      if (light.helper) {
        this.scene.remove(light.helper);
      }
    }
    this.objects = {};
    this.lights = {};
    this.objectIdCounter = 0;
    this.lightIdCounter = 0;

    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls.reset();
    this.notificationService.mostrarMensaje('Escena restablecida con éxito.');
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
