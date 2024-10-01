import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private colorNames: { [key: string]: string } = {
    rojo: "#ff0000",
    verde: "#00ff00",
    azul: "#0000ff",
    amarillo: "#ffff00",
    morado: "#800080",
    cian: "#00ffff",
    blanco: "#ffffff",
    negro: "#000000",
    rosa: "#ffc0cb",
    naranja: "#ffa500",
    marron: "#8b4513",
    gris: "#808080",
    oro: "#ffd700",
    plata: "#c0c0c0",
  };

  getColor(color: string): string {
    return this.colorNames[color.toLowerCase()] || '#ffffff';
  }
}
