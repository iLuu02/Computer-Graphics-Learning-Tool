import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ColorService } from '../../servicios/color.service';
import { NotificationService } from '../../servicios/notification.service';

interface Planet {
  id: number;
  planetObject: THREE.Object3D;
  orbit: THREE.Object3D;
  moons: Satellite[];
  color: string;
}

interface Satellite {
  id: number;
  moonObject: THREE.Object3D;
  orbit: THREE.Object3D;
  visualOrbit: THREE.Mesh;
  color: string;
}

@Component({
  selector: 'app-grafo',
  templateUrl: './grafo.component.html',
  styleUrls: ['./grafo.component.scss']
})
export class GrafoComponent implements AfterViewInit {
  @ViewChild('c') protected canvasRef!: ElementRef;

  protected renderer!: THREE.WebGLRenderer;
  protected camera!: THREE.PerspectiveCamera;
  protected scene!: THREE.Scene;
  protected controls!: OrbitControls;
  protected sun!: THREE.Mesh;
  protected planets: Planet[] = [];
  protected nextPlanetId: number = 1;
  protected nextSatelliteId: number = 1;
  protected distancePlanets: number = 10;
  protected distanceMoons: number = 2;
  userCommand: string = '';

  constructor(private colorService: ColorService, private notificationService: NotificationService) { }

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

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(20, 70, 35);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    const axesHelper = new THREE.AxesHelper(7);
    this.scene.add(axesHelper);

    const sunGeometry = new THREE.SphereGeometry(4, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: this.colorService.getColor('amarillo') });
    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.scene.add(this.sun);
  }

  protected animate(): void {
    requestAnimationFrame(() => this.animate());
    this.planets.forEach(planet => {
      planet.orbit.rotation.y += 0.01;
      planet.moons.forEach(moon => moon.orbit.rotation.y += 0.02);
    });
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  executeCommand(): void {
    const commandParts = this.userCommand.split('(');
    const commandName = commandParts[0];
    const args = commandParts[1]?.replace(')', '').split(',').map(arg => arg.trim());

    try {
      switch (commandName) {
        case 'crearPlaneta':
          this.crearPlaneta(args);
          break;
        case 'crearSatelite':
          this.crearSatelite(args);
          break;
        case 'borrarPlaneta':
          this.borrarPlaneta(args);
          break;
        case 'borrarSatelite':
          this.borrarSatelite(args);
          break;
        case 'rotarSol':
          this.rotarSol(args);
          break;
        case 'rotarPlaneta':
          this.rotarPlaneta(args);
          break;
        case 'rotarSatelite':
          this.rotarSatelite(args);
          break;
        default:
          this.notificationService.mostrarMensaje('Comando no reconocido: ' + commandName);
      }
    } catch (error: any) {
      this.notificationService.mostrarMensaje(error.message);
    }
  }

  private crearPlaneta(args: string[] | undefined): void {
    if (!args || args.length !== 1) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para crearPlaneta');
      return;
    }
  
    if (this.planets.length >= 4) {
      this.notificationService.mostrarMensaje('No se pueden crear más de 4 planetas');
      return;
    }
  
    const color = this.colorService.getColor(args[0]);
    const planetGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const planetMaterial = new THREE.MeshBasicMaterial({ color });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  
    const orbit = new THREE.Object3D();
    orbit.add(planet);
    this.sun.add(orbit);
    planet.position.set(this.distancePlanets, 0, 0);
  
    const curve = new THREE.EllipseCurve(0, 0, this.distancePlanets, this.distancePlanets, 0, 2 * Math.PI, false);
    const points = curve.getPoints(64);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const orbitLine = new THREE.Line(geometry, material);
    orbitLine.rotation.x = Math.PI / 2;
    orbit.add(orbitLine);
  
    this.distancePlanets += 10;
    this.planets.push({ id: this.nextPlanetId, planetObject: planet, orbit, moons: [], color: color });
    this.nextPlanetId++;

    this.notificationService.mostrarMensaje('Planeta creado correctamente');
  }

  private crearSatelite(args: string[] | undefined): void {
    if (!args || args.length !== 2) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para crearSatelite');
      return;
    }
  
    const planetId = Number(args[0]);
    const color = this.colorService.getColor(args[1]);
  
    const planet = this.planets.find(p => p.id === planetId);

    if (isNaN(planetId) || planetId < 1) {
      this.notificationService.mostrarMensaje('ID de planeta incorrecto');
      return;
    }
  
    if (!planet) {
      this.notificationService.mostrarMensaje('Planeta no encontrado');
      return;
    }

    if (planet.moons.length >= 2) {
      this.notificationService.mostrarMensaje('No se pueden crear más de 2 satélites por planeta');
      return;
    }
  
    const distance = 2 + (planet.moons.length * 1.5);
    const moonGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const moonMaterial = new THREE.MeshBasicMaterial({ color });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  
    const orbit = new THREE.Object3D();
    orbit.add(moon);
    planet.planetObject.add(orbit);
    moon.position.set(distance, 0, 0);
  
    const curve = new THREE.EllipseCurve(0, 0, distance, distance, 0, 2 * Math.PI, false, 0 );
    const points = curve.getPoints(64);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
    const orbitLine = new THREE.Line(geometry, material);
    orbitLine.rotation.x = Math.PI / 2;
    orbit.add(orbitLine);
  
    const visualOrbitGeometry = new THREE.TorusGeometry(0.5, 0.01, 16, 100);
    const visualOrbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const visualOrbit = new THREE.Mesh(visualOrbitGeometry, visualOrbitMaterial);
    visualOrbit.rotation.x = Math.PI / 2;
    moon.add(visualOrbit);
  
    planet.moons.push({ id: this.nextSatelliteId, moonObject: moon, orbit, visualOrbit, color: color });
    this.nextSatelliteId++;

    this.notificationService.mostrarMensaje('Satélite creado correctamente');
  }

  private borrarPlaneta(args: string[] | undefined): void {
    if (!args || args.length !== 1 || isNaN(Number(args[0]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para borrarPlaneta');
      return;
    }

    const planetId = Number(args[0]);

    const planetIndex = this.planets.findIndex(p => p.id === planetId);
    if (planetIndex !== -1) {
      const planet = this.planets[planetIndex];
     
      this.sun.remove(planet.orbit); 

      this.planets.splice(planetIndex, 1);

      this.notificationService.mostrarMensaje('Planeta borrado correctamente');
    } else {
      this.notificationService.mostrarMensaje('Planeta no encontrado: ' + planetId);
    }
  }

  private borrarSatelite(args: string[] | undefined): void {
    if (!args || args.length !== 2 || isNaN(Number(args[0])) || isNaN(Number(args[1]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para borrarSatelite');
      return;
    }

    const planetId = Number(args[0]);
    const satelliteId = Number(args[1]);

    const planet = this.planets.find(p => p.id === planetId);
    if (planet) {
      const satelliteIndex = planet.moons.findIndex(s => s.id === satelliteId);

      if (satelliteIndex !== -1) {
        const satellite = planet.moons[satelliteIndex];

        planet.planetObject.remove(satellite.orbit);

        planet.moons.splice(satelliteIndex, 1);

        this.notificationService.mostrarMensaje('Satélite borrado correctamente');
      } else {
        this.notificationService.mostrarMensaje('Satélite no encontrado: ' + satelliteId);
      }
    } else {
      this.notificationService.mostrarMensaje('Planeta no encontrado: ' + planetId);
    }
  }

  private rotarSol(args: string[] | undefined): void {
    if (!args || args.length !== 2 || !['x', 'y', 'z'].includes(args[0]) || isNaN(Number(args[1]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para rotarSol');
      return;
    }

    const eje = args[0];
    const angulo = THREE.MathUtils.degToRad(Number(args[1]));
    switch (eje) {
      case 'x':
        this.sun.rotation.x += angulo;
        break;
      case 'y':
        this.sun.rotation.y += angulo;
        break;
      case 'z':
        this.sun.rotation.z += angulo;
        break;
      default:
        this.notificationService.mostrarMensaje('Eje no reconocido: ' + eje);
    }
    this.notificationService.mostrarMensaje('Sol rotado correctamente');
  }

  private rotarPlaneta(args: string[] | undefined): void {
    if (!args || args.length !== 3 || isNaN(Number(args[0])) || !['x', 'y', 'z'].includes(args[1]) || isNaN(Number(args[2]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para rotarPlaneta');
      return;
    }

    const planetId = Number(args[0]);
    const eje = args[1];
    const angulo = THREE.MathUtils.degToRad(Number(args[2]));
    const planet = this.planets.find(p => p.id === planetId);
    if (planet) {
      switch (eje) {
        case 'x':
          planet.planetObject.rotation.x += angulo;
          break;
        case 'y':
          planet.planetObject.rotation.y += angulo;
          break;
        case 'z':
          planet.planetObject.rotation.z += angulo;
          break;
        default:
          this.notificationService.mostrarMensaje('Eje no reconocido: ' + eje);
      }
      this.notificationService.mostrarMensaje('Planeta rotado correctamente');
    } else {
      this.notificationService.mostrarMensaje('Planeta no encontrado: ' + planetId);
    }
  }

  private rotarSatelite(args: string[] | undefined): void {
    if (!args || args.length !== 4 || isNaN(Number(args[0])) || isNaN(Number(args[1])) || !['x', 'y', 'z'].includes(args[2]) || isNaN(Number(args[3]))) {
      this.notificationService.mostrarMensaje('Parámetros incorrectos para rotarSatelite');
      return;
    }

    const planetId = Number(args[0]);
    const satelliteId = Number(args[1]);
    const eje = args[2];
    const angulo = THREE.MathUtils.degToRad(Number(args[3]));
    const planet = this.planets.find(p => p.id === planetId);
    if (planet) {
      const satellite = planet.moons.find(s => s.id === satelliteId);
      if (satellite) {
        switch (eje) {
          case 'x':
            satellite.moonObject.rotation.x += angulo;
            break;
          case 'y':
            satellite.moonObject.rotation.y += angulo;
            break;
          case 'z':
            satellite.moonObject.rotation.z += angulo;
            break;
          default:
            this.notificationService.mostrarMensaje('Eje no reconocido: ' + eje);
        }
        this.notificationService.mostrarMensaje('Satélite rotado correctamente');
      } else {
        this.notificationService.mostrarMensaje('Satélite no encontrado: ' + satelliteId);
      }
    } else {
      this.notificationService.mostrarMensaje('Planeta no encontrado: ' + planetId);
    }
  }

  resetScene(): void {
    this.planets.forEach(planet => {
      this.sun.remove(planet.orbit);
    });
    this.planets = [];
    this.nextPlanetId = 1;
    this.nextSatelliteId = 1;

    this.sun.position.set(0, 0, 0);
    this.sun.rotation.set(0, 0, 0);

    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.controls.reset();
    this.notificationService.mostrarMensaje('Escena restablecida correctamente');
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


