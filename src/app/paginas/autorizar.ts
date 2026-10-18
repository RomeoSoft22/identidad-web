import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormularioLogin } from '../componentes/formulario-login';
import { TarjetaUsuario } from '../componentes/tarjeta-usuario';
import { ErrorIdentidad, IdentidadApi, Sistema, Usuario } from '../identidad-api';

type Estado = 'cargando' | 'login' | 'sin-acceso' | 'invalida' | 'redirigiendo';

/**
 * /authorize: a esta página redirigen los sistemas (ISTQB y otros) con los parámetros OAuth.
 * Pregunta a la API qué hacer: pedir login, mostrar "sin acceso" o volver al sistema con el código.
 */
@Component({
  selector: 'jc-autorizar',
  imports: [FormularioLogin, TarjetaUsuario, RouterLink],
  template: `
    @switch (estado()) {
      @case ('cargando') {
        <div class="centrado"><span class="spinner oscuro" aria-hidden="true"></span><p>Comprobando tu sesión…</p></div>
      }
      @case ('redirigiendo') {
        <div class="centrado"><span class="spinner oscuro" aria-hidden="true"></span><p>Volviendo a {{ sistema()?.nombre }}…</p></div>
      }
      @case ('login') {
        <jc-formulario-login [sistemaDestino]="sistema()?.nombre ?? null" (ingreso)="autorizar()" />
      }
      @case ('sin-acceso') {
        <div class="icono-estado aviso">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h1>No tienes acceso a {{ sistema()?.nombre }}</h1>
        <p class="lead">Tu cuenta existe, pero todavía no está habilitada para este sistema. Pide al administrador que te dé acceso.</p>
        @if (usuario(); as u) { <jc-tarjeta-usuario [usuario]="u" /> }
        <button type="button" class="boton secundario" (click)="otraCuenta()">Ingresar con otra cuenta</button>
      }
      @case ('invalida') {
        <div class="icono-estado error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
        </div>
        <h1>No pudimos iniciar el ingreso</h1>
        <p class="lead">{{ mensaje() }}</p>
        <a class="boton secundario" routerLink="/login">Ir al inicio de sesión</a>
      }
    }
  `,
  styles: `
    .centrado { display: grid; justify-items: center; gap: 14px; padding: 28px 0; color: var(--muted); text-align: center; }
    .centrado p { margin: 0; }
  `,
})
export class Autorizar implements OnInit {
  private api = inject(IdentidadApi);

  estado = signal<Estado>('cargando');
  sistema = signal<Sistema | null>(null);
  usuario = signal<Usuario | null>(null);
  mensaje = signal('');

  ngOnInit(): void {
    this.autorizar();
  }

  autorizar(): void {
    if (!location.search) {
      this.invalida('Falta la información del sistema al que quieres ingresar. Vuelve al sistema e inténtalo de nuevo.');
      return;
    }
    this.estado.set('cargando');
    this.api.autorizar(location.search).subscribe({
      next: r => {
        this.sistema.set(r.sistema);
        this.estado.set('redirigiendo');
        location.replace(r.redirect_to);
      },
      error: (e: HttpErrorResponse) => {
        const cuerpo = (e.error ?? {}) as ErrorIdentidad;
        this.sistema.set(cuerpo.sistema ?? null);
        switch (cuerpo.codigo) {
          case 'login_requerido': this.estado.set('login'); break;
          case 'sin_acceso': this.usuario.set(cuerpo.usuario ?? null); this.estado.set('sin-acceso'); break;
          default: this.invalida(cuerpo.message || 'No pudimos conectar con identidad. Revisa tu conexión e inténtalo de nuevo.');
        }
      },
    });
  }

  /** Cierra la sesión actual y vuelve a esta misma solicitud para ingresar con otro usuario. */
  otraCuenta(): void {
    this.api.logout(null).subscribe({ complete: () => this.autorizar() });
  }

  private invalida(mensaje: string): void {
    this.mensaje.set(mensaje);
    this.estado.set('invalida');
  }
}
