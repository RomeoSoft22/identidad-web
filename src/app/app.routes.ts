import { Routes } from '@angular/router';
import { Autorizar } from './paginas/autorizar';
import { Ingresar } from './paginas/ingresar';
import { Salir } from './paginas/salir';

export const routes: Routes = [
  { path: 'authorize', component: Autorizar, title: 'Iniciar sesión · Juarez Campos' },
  { path: 'login', component: Ingresar, title: 'Iniciar sesión · Juarez Campos' },
  { path: 'logout', component: Salir, title: 'Sesión cerrada · Juarez Campos' },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
