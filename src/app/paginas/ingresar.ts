import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormularioLogin } from '../componentes/formulario-login';
import { TarjetaUsuario } from '../componentes/tarjeta-usuario';
import { IdentidadApi, Usuario } from '../identidad-api';

/** /login: entrada directa a identidad, sin venir de un sistema. */
@Component({
  selector: 'jc-ingresar',
  imports: [FormularioLogin, TarjetaUsuario],
  template: `
    @if (cargando()) {
      <div class="centrado"><span class="spinner oscuro" aria-hidden="true"></span><p>Comprobando tu sesión…</p></div>
    } @else if (usuario(); as u) {
      <div class="icono-estado">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
      </div>
      <h1>Ya tienes una sesión abierta</h1>
      <p class="lead">Vuelve al sistema que estabas usando para continuar.</p>
      <jc-tarjeta-usuario [usuario]="u" />
      <button type="button" class="boton secundario" (click)="salir()">Cerrar sesión</button>
    } @else {
      <jc-formulario-login (ingreso)="usuario.set($event)" />
    }
  `,
  styles: `
    .centrado { display: grid; justify-items: center; gap: 14px; padding: 28px 0; color: var(--muted); }
    .centrado p { margin: 0; }
  `,
})
export class Ingresar implements OnInit {
  private api = inject(IdentidadApi);
  private router = inject(Router);

  cargando = signal(true);
  usuario = signal<Usuario | null>(null);

  ngOnInit(): void {
    this.api.sesion().subscribe({
      next: r => { this.usuario.set(r.usuario); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  salir(): void {
    this.router.navigateByUrl('/logout');
  }
}
