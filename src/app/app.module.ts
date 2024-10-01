import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TransformacionesComponent } from './escenas/transformaciones/transformaciones.component';
import { FormsModule } from '@angular/forms';
import { MainComponent } from './paginas/main/main.component';
import { AmbientalComponent } from './escenas/luces/ambiental/ambiental.component';
import { PuntualComponent } from './escenas/luces/puntual/puntual.component';
import { DireccionalComponent } from './escenas/luces/direccional/direccional.component';
import { FocoComponent } from './escenas/luces/foco/foco.component';
import { AplicacionComponent } from './escenas/texturas/aplicacion/aplicacion.component';
import { BumpmappingComponent } from './escenas/texturas/bumpmapping/bumpmapping.component';
import { ReflexionComponent } from './escenas/texturas/reflexion/reflexion.component';
import { GrafoComponent } from './escenas/grafo/grafo.component';
import { MallasComponent } from './escenas/mallas/mallas.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { EscenaLibreComponent } from './escenas/escenalibre/escenalibre.component';

@NgModule({
  declarations: [
    AppComponent,
    TransformacionesComponent,
    MainComponent,
    AmbientalComponent,
    PuntualComponent,
    DireccionalComponent,
    FocoComponent,
    AplicacionComponent,
    BumpmappingComponent,
    ReflexionComponent,
    GrafoComponent,
    MallasComponent,
    EscenaLibreComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
