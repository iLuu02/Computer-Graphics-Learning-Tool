import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransformacionesComponent } from './escenas/transformaciones/transformaciones.component';
import { MainComponent } from './paginas/main/main.component';
import { AmbientalComponent } from './escenas/luces/ambiental/ambiental.component';
import { DireccionalComponent } from './escenas/luces/direccional/direccional.component';
import { PuntualComponent } from './escenas/luces/puntual/puntual.component';
import { FocoComponent } from './escenas/luces/foco/foco.component';
import { AplicacionComponent } from './escenas/texturas/aplicacion/aplicacion.component';
import { BumpmappingComponent } from './escenas/texturas/bumpmapping/bumpmapping.component';
import { ReflexionComponent } from './escenas/texturas/reflexion/reflexion.component';
import { GrafoComponent } from './escenas/grafo/grafo.component';
import { MallasComponent } from './escenas/mallas/mallas.component';
import { EscenaLibreComponent} from './escenas/escenalibre/escenalibre.component';


const routes: Routes = [
  {
    path: '',   // Ruta raíz del proyecto
    redirectTo: '/main/transformaciones',
    pathMatch: 'full'
  },
  {
    path: 'main',  // MainComponent como ruta principal
    component: MainComponent,
    children: [
      {
        path: '',  //No se permite la ruta /main, redirige a /main/transformaciones
        redirectTo: 'transformaciones',
        pathMatch: 'full'
      },
      { path: 'transformaciones', component: TransformacionesComponent },
      { path: 'ambiental', component: AmbientalComponent },
      { path: 'direccional', component: DireccionalComponent },
      { path: 'puntual', component: PuntualComponent },
      { path: 'foco', component: FocoComponent },
      { path: 'aplicacion', component: AplicacionComponent },
      { path: 'bumpmapping', component: BumpmappingComponent },
      { path: 'reflexion', component: ReflexionComponent },
      { path: 'grafo', component: GrafoComponent },
      { path: 'malla', component: MallasComponent },
      { path: 'escenalibre', component: EscenaLibreComponent }
    ]
  },
  {
    path: '**',  // Redirigie cualquier ruta inválida a /main/transformaciones
    redirectTo: '/main/transformaciones'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
