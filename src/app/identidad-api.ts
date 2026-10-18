import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Usuario { nombre: string; email: string }
export interface Sistema { codigo: string; nombre: string }

/** Respuesta de /api/authorize cuando todo está bien: a dónde volver con el código. */
export interface Autorizado { redirect_to: string; sistema: Sistema }

/** Cuerpo de error de la API de identidad. */
export interface ErrorIdentidad {
  codigo?: 'login_requerido' | 'sin_acceso' | 'solicitud_invalida' | 'credenciales' | 'bloqueada' | 'limite' | 'sin_sesion';
  message?: string;
  sistema?: Sistema;
  usuario?: Usuario;
  errors?: Record<string, string[]>;
}

/**
 * Cliente de la API de identidad (Laravel). Se sirve en el mismo dominio bajo /api, así la cookie
 * de sesión SSO es HttpOnly y de primera parte, y Angular envía el token CSRF (XSRF-TOKEN) solo.
 */
@Injectable({ providedIn: 'root' })
export class IdentidadApi {
  private http = inject(HttpClient);

  sesion() {
    return this.http.get<{ usuario: Usuario }>('/api/sesion');
  }

  login(email: string, password: string) {
    return this.http.post<{ usuario: Usuario }>('/api/login', { email, password });
  }

  logout(postLogoutRedirectUri: string | null) {
    return this.http.post<{ redirect_to: string | null }>('/api/logout', { post_logout_redirect_uri: postLogoutRedirectUri });
  }

  /** Reenvía tal cual los parámetros OAuth que trajo el sistema cliente. */
  autorizar(queryString: string) {
    return this.http.get<Autorizado>(`/api/authorize${queryString}`);
  }
}
