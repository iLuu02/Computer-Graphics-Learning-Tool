import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { NotificationService } from '../../servicios/notification.service';

@Component({
  selector: 'app-mallas',
  templateUrl: './mallas.component.html',
  styleUrls: ['./mallas.component.scss']
})
export class MallasComponent implements AfterViewInit {
  @ViewChild('c') protected canvasRef!: ElementRef;

  protected renderer!: THREE.WebGLRenderer;
  protected camera!: THREE.PerspectiveCamera;
  protected scene!: THREE.Scene;
  protected controls!: OrbitControls;
  protected group: THREE.Group | null = null;
  userCommand: string = '';

  constructor(private notificationService: NotificationService) { }

  ngAfterViewInit(): void {
    this.initTHREE();
    this.crearOModificarFigura(['torus', '5', '2', '16', '32'], false);
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
    this.camera.position.set(5, 5, 25);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(ambientLight);
  }

  protected animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();

    if (this.group) {
      this.group.rotation.x += 0.001;
      this.group.rotation.y += 0.001;
    }

    this.renderer.render(this.scene, this.camera);
  }

  executeCommand(): void {
    const commandParts = this.userCommand.split('(');
    const commandName = commandParts[0];
    const args = commandParts[1]?.replace(')', '').split(',');

    try {
      switch (commandName) {
        case 'crear':
          this.crearOModificarFigura(args, true);
          break;
        default:
          this.notificationService.mostrarMensaje('Comando no reconocido: ' + commandName);
      }
    } catch (error: any) {
      this.notificationService.mostrarMensaje(error.message);
    }
  }

  private clearScene(): void {
    if (this.group) {
      this.scene.remove(this.group);
      this.group.children.forEach((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      this.group = null;
    }
  }

  private validarParametros(tipo: string, parametros: string[]): { valores: number[], modificados: boolean } {
    const maxRadio = 10;
    const maxSegmentos = 64;
    const maxAltura = 20;
    let modificados = false;

    const valores = parametros.map((param, index) => {
      const valor = Number(param);
      if (isNaN(valor)) {
        throw new Error(`El parámetro ${index + 1} no es un número válido: ${param}`);
      }
      return valor;
    });

    switch (tipo) {
      case 'cubo':
        if (valores.length !== 3) throw new Error('Número incorrecto de parámetros para cubo');
        return {
          valores: valores.map(valor => {
            if (valor > maxRadio) {
              modificados = true;
              return maxRadio;
            }
            return valor;
          }),
          modificados
        };
      case 'tetraedro':
      case 'octaedro':
      case 'icosaedro':
        if (valores.length !== 1) throw new Error('Número incorrecto de parámetros para ' + tipo);
        return {
          valores: valores.map(valor => {
            if (valor > maxRadio) {
              modificados = true;
              return maxRadio;
            }
            return valor;
          }),
          modificados
        };
      case 'esfera':
        if (valores.length !== 3) throw new Error('Número incorrecto de parámetros para esfera');
        return {
          valores: [
            valores[0] > maxRadio ? (modificados = true, maxRadio) : valores[0],
            valores[1] > maxSegmentos ? (modificados = true, maxSegmentos) : valores[1],
            valores[2] > maxSegmentos ? (modificados = true, maxSegmentos) : valores[2]
          ],
          modificados
        };
      case 'cilindro':
        if (valores.length !== 5) throw new Error('Número incorrecto de parámetros para cilindro');
        return {
          valores: [
            valores[0] > maxRadio ? (modificados = true, maxRadio) : valores[0],
            valores[1] > maxRadio ? (modificados = true, maxRadio) : valores[1],
            valores[2] > maxAltura ? (modificados = true, maxAltura) : valores[2],
            valores[3] > maxSegmentos ? (modificados = true, maxSegmentos) : valores[3],
            valores[4] > maxSegmentos ? (modificados = true, maxSegmentos) : valores[4]
          ],
          modificados
        };
      case 'cono':
        if (valores.length !== 4) throw new Error('Número incorrecto de parámetros para cono');
        return {
          valores: [
            valores[0] > maxRadio ? (modificados = true, maxRadio) : valores[0],
            valores[1] > maxAltura ? (modificados = true, maxAltura) : valores[1],
            valores[2] > maxSegmentos ? (modificados = true, maxSegmentos) : valores[2],
            valores[3] > maxSegmentos ? (modificados = true, maxSegmentos) : valores[3]
          ],
          modificados
        };
      case 'torus':
        if (valores.length !== 4) throw new Error('Número incorrecto de parámetros para torus');
        return {
          valores: [
            valores[0] > maxRadio ? (modificados = true, maxRadio) : valores[0],
            valores[1] > maxRadio / 2 ? (modificados = true, maxRadio / 2) : valores[1],
            valores[2] > maxSegmentos ? (modificados = true, maxSegmentos) : valores[2],
            valores[3] > maxSegmentos ? (modificados = true, maxSegmentos) : valores[3]
          ],
          modificados
        };
      default:
        throw new Error('Tipo de figura no reconocido: ' + tipo);
    }
  }

  private crearOModificarFigura(args: string[] | undefined, mostrarMensaje: boolean): void {
    if (!args || args.length === 0) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para crearOModificarFigura');
      return;
    }

    const tipo = args[0];
    let parametrosValidados;

    try {
      parametrosValidados = this.validarParametros(tipo, args.slice(1));
    } catch (error: any) {
      this.notificationService.mostrarMensaje(error.message);
      return;
    }

    const { valores: parametros, modificados } = parametrosValidados;

    this.clearScene();

    let geometry: THREE.BufferGeometry;

    switch (tipo) {
      case 'cubo':
        const [ancho, alto, profundidad] = parametros;
        geometry = new THREE.BoxGeometry(ancho, alto, profundidad);
        break;
      case 'tetraedro':
        const [tetraedroRadio] = parametros;
        geometry = new THREE.TetrahedronGeometry(tetraedroRadio);
        break;
      case 'octaedro':
        const [octaedroRadio] = parametros;
        geometry = new THREE.OctahedronGeometry(octaedroRadio);
        break;
      case 'icosaedro':
        const [icosaedroRadio] = parametros;
        geometry = new THREE.IcosahedronGeometry(icosaedroRadio);
        break;
      case 'esfera':
        const [radio, meridianos, paralelos] = parametros;
        geometry = new THREE.SphereGeometry(radio, meridianos, paralelos);
        break;
      case 'cilindro':
        const [radioSuperior, radioInferior, altura, radialSegments, heightSegments] = parametros;
        geometry = new THREE.CylinderGeometry(radioSuperior, radioInferior, altura, radialSegments, heightSegments);
        break;
      case 'torus':
        const [torusRadio, torusTube, torusRadialSegments, torusTubularSegments] = parametros;
        geometry = new THREE.TorusGeometry(torusRadio, torusTube, torusRadialSegments, torusTubularSegments);
        break;
      case 'cono':
        const [conoRadio, conoAltura, conoRadialSegments, conoHeightSegments] = parametros;
        geometry = new THREE.ConeGeometry(conoRadio, conoAltura, conoRadialSegments, conoHeightSegments);
        break;
      default:
        this.notificationService.mostrarMensaje('Tipo de figura no reconocido: ' + tipo);
        return;
    }

    const material = new THREE.MeshPhongMaterial({ color: 0x4200FF });
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    const mesh = new THREE.Mesh(geometry, material);
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), wireframeMaterial);

    this.group = new THREE.Group();
    this.group.add(mesh);
    this.group.add(wireframe);

    this.scene.add(this.group);

    if (modificados) {
      this.notificationService.mostrarMensaje('Figura creada con valores ajustados a los límites permitidos.');
    } else {
      if (mostrarMensaje) { this.notificationService.mostrarMensaje('Figura creada correctamente.'); }
    }
  }

  resetScene(): void {
    this.crearOModificarFigura(['torus', '5', '2', '16', '32'], false);

    this.camera.position.set(5, 5, 30);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls.reset();
    this.notificationService.mostrarMensaje("Escena restablecida con éxito.")
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
