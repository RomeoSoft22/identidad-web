import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Usuario { nombre: string; email: string }
export interface Sistema { codigo: string; nombre: string }

/** Respuesta de /api/authorize cuando todo está bien: a dónde volver con el código. */
export interface Autorizado { redirect_to: string; sistema: Sistema }

/** Cuerpo de error de la API de identidad. */
export interface ErrorIdentidad {
  codigo?: 'login_requerido' | 'sin_acceso' | 'solicitud_invalida' | 'credenciales' | 'limite' | 'sin_sesion'
    | 'verificacion_requerida' | 'codigo_incorrecto' | 'codigo_vencido';
  /** Correo enmascarado al que se envió el código (j***z@gmail.com). */
  correo?: string;
  message?: string;
  sistema?: Sistema;
  usuario?: Usuario;
  errors?: Record<string, string[]>;
}

function zonaHoraria(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

/**
 * Cliente de la API de identidad (Laravel). Se sirve en el mismo dominio bajo /api, así la cookie
 * de sesión SSO es HttpOnly y de primera parte, y Angular envía el token CSRF (XSRF-TOKEN) solo.
 */
@Injectable({ providedIn: 'root' })
export class IdentidadApi {
  private http = inject(HttpClient);

  /** Métodos de ingreso habilitados en identidad (por ahora, si hay ingreso con Google). */
  metodos() {
    return this.http.get<{ google: boolean }>('/api/metodos');
  }

  sesion() {
    return this.http.get<{ usuario: Usuario }>('/api/sesion');
  }

  /** Además de las credenciales, envía la zona horaria y el idioma del navegador para la auditoría de la sesión. */
  login(email: string, password: string) {
    return this.http.post<{ usuario: Usuario }>('/api/login', {
      email,
      password,
      zona_horaria: zonaHoraria(),
      idioma: navigator.language || null,
    });
  }

  /** Segundo paso cuando la cuenta está bloqueada: el código de 6 dígitos enviado al correo. */
  verificarCodigo(codigo: string) {
    return this.http.post<{ usuario: Usuario }>('/api/login/verificar', { codigo });
  }

  logout(postLogoutRedirectUri: string | null) {
    return this.http.post<{ redirect_to: string | null }>('/api/logout', { post_logout_redirect_uri: postLogoutRedirectUri });
  }

  /** Reenvía tal cual los parámetros OAuth que trajo el sistema cliente. */
  autorizar(queryString: string) {
    return this.http.get<Autorizado>(`/api/authorize${queryString}`);
  }
}
