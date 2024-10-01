import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';

@Injectable({
  providedIn: 'root'
})
export class ModelLoaderService {

  constructor() { }

 cargarFBX(url: string, scene: THREE.Scene): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      const fbxLoader = new FBXLoader();
      fbxLoader.load(
        url,
        (object) => {
          object.scale.set(3, 3, 3);
          object.rotation.x = Math.PI / 2;

          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshStandardMaterial({
                color: 0xbcbcbc,
                metalness: 0.5,
                roughness: 0.4 
              });
            }
          });

          scene.add(object);
          console.log('Modelo FBX cargado con éxito');
          resolve(object);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% cargado');
        },
        (error) => {
          console.error('Un error ocurrió al cargar el modelo FBX:', error);
          reject(error);
        }
      );
    });
  }

  cargarOBJ(url: string, urlTexture: string, scene: THREE.Scene): Promise<THREE.Object3D> {
    return new Promise((resolve, reject) => {
      const textureLoader = new TextureLoader();
      const texture = textureLoader.load(urlTexture);

      const objLoader = new OBJLoader();
      objLoader.load(
        url,
        (object) => {
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.material = new THREE.MeshStandardMaterial({ map: texture });
            }
          });

          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          object.position.x += (object.position.x - center.x);
          object.position.y += (object.position.y - center.y);
          object.position.z += (object.position.z - center.z);

          scene.add(object);
          console.log('Modelo y textura cargados con éxito');
          resolve(object);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% cargado');
        },
        (error) => {
          console.error('Un error ocurrió al cargar el modelo o la textura:', error);
          reject(error);
        }
      );
    });
  }
}
