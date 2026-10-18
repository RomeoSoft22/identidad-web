import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { switchMap, catchError, of } from 'rxjs';
import { IdentidadApi } from '../identidad-api';

/**
 * /logout: cierra la sesión SSO en todos los sistemas. Si el sistema envió
 * post_logout_redirect_uri y está registrado, vuelve allí; si no, muestra la confirmación.
 */
@Component({
  selector: 'jc-salir',
  imports: [RouterLink],
  template: `
    @if (cerrando()) {
      <div class="centrado"><span class="spinner oscuro" aria-hidden="true"></span><p>Cerrando tu sesión…</p></div>
    } @else {
      <div class="icono-estado">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
      </div>
      <h1>Cerraste sesión</h1>
      <p class="lead">Saliste de todos los sistemas de Juarez Campos en este navegador.</p>
      <a class="boton" routerLink="/login">Volver a ingresar</a>
    }
  `,
  styles: `
    .centrado { display: grid; justify-items: center; gap: 14px; padding: 28px 0; color: var(--muted); }
    .centrado p { margin: 0; }
  `,
})
export class Salir implements OnInit {
  private api = inject(IdentidadApi);
  cerrando = signal(true);

  ngOnInit(): void {
    const destino = new URLSearchParams(location.search).get('post_logout_redirect_uri');
    // GET /api/sesion primero: deja la cookie XSRF-TOKEN que el POST necesita.
    this.api.sesion().pipe(
      catchError(() => of(null)),
      switchMap(() => this.api.logout(destino)),
    ).subscribe({
      next: r => r.redirect_to ? location.replace(r.redirect_to) : this.cerrando.set(false),
      error: () => this.cerrando.set(false),
    });
  }
}
