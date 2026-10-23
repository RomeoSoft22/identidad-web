import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ErrorIdentidad, IdentidadApi, Usuario } from '../identidad-api';

/** Resultado del ingreso con Google que identidad devuelve en ?google=… */
const MENSAJES_GOOGLE: Record<string, { tipo: 'aviso' | 'error'; texto: string }> = {
  pendiente: {
    tipo: 'aviso',
    texto: 'Recibimos tu solicitud de acceso. Un administrador debe aprobarla y asignarte los sistemas; te avisaremos por correo.',
  },
  cancelado: { tipo: 'aviso', texto: 'Cancelaste el ingreso con Google. Puedes intentarlo de nuevo o usar tu correo y contraseña.' },
  correo_no_verificado: { tipo: 'error', texto: 'Tu cuenta de Google no tiene el correo verificado. Verifícalo en Google e inténtalo de nuevo.' },
  bloqueada: {
    tipo: 'error',
    texto: 'Tu cuenta está bloqueada. Ingresa con tu correo y contraseña para recibir un código de desbloqueo, o pide ayuda al administrador.',
  },
  sin_acceso: { tipo: 'error', texto: 'Tu cuenta no está habilitada. Pide al administrador que revise tu acceso.' },
  no_disponible: { tipo: 'error', texto: 'El ingreso con Google no está disponible en este momento. Usa tu correo y contraseña.' },
  error: { tipo: 'error', texto: 'No pudimos completar el ingreso con Google. Inténtalo de nuevo.' },
};

/** Formulario de correo y contraseña, con la opción «Continuar con Google». Emite el usuario cuando el ingreso es correcto. */
@Component({
  selector: 'jc-formulario-login',
  imports: [FormsModule],
  template: `
    <p class="eyebrow">Iniciar sesión</p>
    <h1>Hola de nuevo</h1>
    <p class="lead">Ingresa con tu cuenta de Juarez Campos.</p>

    @if (sistemaDestino()) {
      <div class="destino">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        <span>Vas a ingresar a <strong>{{ sistemaDestino() }}</strong></span>
      </div>
    }

    @if (error()) {
      <div class="alerta" role="alert" id="error-login">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
        <span>{{ error() }}</span>
      </div>
    }

    @if (avisoGoogle() && paso() === 'credenciales') {
      <div class="aviso" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>
        <span>{{ avisoGoogle() }}</span>
      </div>
    }

    @if (paso() === 'codigo') {
      <div class="aviso" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
        <span>{{ aviso() }}</span>
      </div>
      <form (ngSubmit)="verificar()" novalidate>
        <div class="campo">
          <label for="codigo">Código de verificación</label>
          <input #campoCodigo id="codigo" name="codigo" class="codigo" [(ngModel)]="codigo" inputmode="numeric" autocomplete="one-time-code"
                 maxlength="6" pattern="[0-9]*" placeholder="000000" required
                 [attr.aria-invalid]="error() ? true : null" [attr.aria-describedby]="error() ? 'error-login' : null">
        </div>
        <button type="submit" class="boton" [disabled]="enviando() || codigo.length !== 6">
          @if (enviando()) { <span class="spinner" aria-hidden="true"></span> Verificando… } @else { Verificar y continuar }
        </button>
      </form>
      <button type="button" class="enlace" (click)="volver()">Usar otra cuenta o pedir un código nuevo</button>
    } @else {
    <form (ngSubmit)="ingresar()" novalidate>
      <div class="campo">
        <label for="email">Correo electrónico</label>
        <input #correo id="email" name="email" type="email" [(ngModel)]="email" placeholder="nombre@juarezcampos.net"
               autocomplete="username" inputmode="email" required
               [attr.aria-invalid]="error() ? true : null" [attr.aria-describedby]="error() ? 'error-login' : null">
      </div>

      <div class="campo">
        <label for="password">Contraseña</label>
        <div class="con-boton">
          <input id="password" name="password" [type]="verPassword() ? 'text' : 'password'" [(ngModel)]="password"
                 autocomplete="current-password" required
                 [attr.aria-invalid]="error() ? true : null" [attr.aria-describedby]="error() ? 'error-login' : null">
          <button type="button" class="ver" (click)="verPassword.set(!verPassword())"
                  [attr.aria-label]="verPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'" [attr.aria-pressed]="verPassword()" aria-controls="password">
            @if (verPassword()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2M6.6 6.6C3.9 8.3 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1"/></svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>
      </div>

      <button type="submit" class="boton" [disabled]="enviando()">
        @if (enviando()) { <span class="spinner" aria-hidden="true"></span> Ingresando… } @else { Ingresar }
      </button>
    </form>

    <!-- Siempre visible. Si identidad aún no tiene Google configurado, vuelve con ?google=no_disponible y un aviso claro. -->
    <div class="separador" role="separator"><span>o</span></div>
    <a class="boton-google" [href]="urlGoogle()">
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.2 44 33 44 24c0-1.3-.1-2.4-.4-3.5z"/>
        </svg>
        Continuar con Google
    </a>
    }

    <p class="ayuda">¿No puedes ingresar? Escribe al administrador de tu sistema.</p>
  `,
  styles: `
    .destino { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin: 0 0 22px; border-radius: 10px; background: var(--blue-soft); font-size: 14px; }
    .destino svg { flex: none; width: 18px; height: 18px; color: var(--blue); }
    .destino strong { font-weight: 700; }
    .alerta { display: grid; grid-template-columns: 20px 1fr; gap: 10px; padding: 12px 14px; margin: 0 0 18px; border-radius: 10px; background: var(--danger-soft); color: #8c1d1d; font-size: 14px; }
    .alerta svg { width: 20px; height: 20px; color: var(--danger); }
    .campo { display: grid; gap: 7px; margin-bottom: 16px; }
    label { font-weight: 600; font-size: 14px; }
    .con-boton { position: relative; }
    input {
      width: 100%; height: 48px; padding: 0 14px; font: inherit; color: var(--ink); background: var(--white);
      border: 1.5px solid var(--line); border-radius: 10px; transition: border-color .15s, box-shadow .15s;
    }
    input::placeholder { color: #9aa1ab; }
    input:hover { border-color: #c5cfdb; }
    input:focus { outline: none; border-color: var(--blue); box-shadow: 0 0 0 4px #037fff22; }
    input[aria-invalid="true"] { border-color: var(--danger); }
    .con-boton input { padding-right: 52px; }
    .ver { position: absolute; top: 4px; right: 4px; width: 40px; height: 40px; display: grid; place-items: center; border: 0; border-radius: 8px; background: transparent; color: var(--muted); cursor: pointer; }
    .ver:hover { background: var(--cream); color: var(--ink); }
    .ver svg { width: 20px; height: 20px; }
    .separador { display: flex; align-items: center; gap: 14px; margin: 22px 0 18px; color: var(--muted); font-size: 13px; }
    .separador::before, .separador::after { content: ""; flex: 1; height: 1px; background: var(--line); }
    .boton-google {
      display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; height: 48px;
      font: 600 15px/1 var(--body); color: var(--ink); text-decoration: none; background: var(--white);
      border: 1.5px solid var(--line); border-radius: 10px; transition: background .15s, border-color .15s;
    }
    .boton-google:hover { background: var(--cream); border-color: #c5cfdb; }
    .boton-google svg { width: 20px; height: 20px; }
    .aviso { display: grid; grid-template-columns: 20px 1fr; gap: 10px; padding: 12px 14px; margin: 0 0 18px; border-radius: 10px; background: var(--blue-soft); font-size: 14px; }
    .aviso svg { width: 20px; height: 20px; color: var(--blue); }
    .codigo { font: 700 24px/1 var(--body); letter-spacing: .5em; text-align: center; }
    .enlace { display: block; margin: 14px auto 0; border: 0; background: none; color: var(--blue); font: inherit; font-size: 14px; cursor: pointer; text-decoration: underline; }
    .ayuda { margin: 22px 0 0; padding-top: 18px; border-top: 1px solid var(--line); font-size: 13.5px; color: var(--muted); text-align: center; }
  `,
})
export class FormularioLogin {
  private api = inject(IdentidadApi);
  private correo = viewChild<ElementRef<HTMLInputElement>>('correo');
  private campoCodigo = viewChild<ElementRef<HTMLInputElement>>('campoCodigo');

  sistemaDestino = input<string | null>(null);
  ingreso = output<Usuario>();

  email = '';
  password = '';
  codigo = '';
  /** 'credenciales': correo y contraseña. 'codigo': segundo paso con el código que llegó al correo. */
  paso = signal<'credenciales' | 'codigo'>('credenciales');
  aviso = signal('');
  verPassword = signal(false);
  enviando = signal(false);
  error = signal('');

  /** Mensaje informativo al volver de Google (por ejemplo, solicitud pendiente de aprobación). */
  avisoGoogle = signal('');

  ngOnInit(): void {
    const parametros = new URLSearchParams(location.search);
    const resultado = parametros.get('google');
    if (resultado) {
      const mensaje = MENSAJES_GOOGLE[resultado] ?? MENSAJES_GOOGLE['error'];
      (mensaje.tipo === 'aviso' ? this.avisoGoogle : this.error).set(mensaje.texto);
      // Se quita el parámetro de la barra de direcciones para que no se repita al recargar.
      parametros.delete('google');
      history.replaceState(history.state, '', location.pathname + (parametros.size ? `?${parametros}` : ''));
    }
  }

  /** Va a Google y, al volver, regresa a esta misma pantalla (con los datos del sistema que pidió el ingreso). */
  urlGoogle(): string {
    const parametros = new URLSearchParams(location.search);
    parametros.delete('google');
    const retorno = location.pathname + (parametros.size ? `?${parametros}` : '');
    const datos = new URLSearchParams({ retorno, idioma: navigator.language || '' });
    try {
      datos.set('zona_horaria', Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    } catch {
      /* sin zona horaria */
    }
    return `/api/google/redirect?${datos}`;
  }

  ngAfterViewInit(): void {
    this.correo()?.nativeElement.focus();
  }

  ingresar(): void {
    this.enviando.set(true);
    this.error.set('');
    this.api.login(this.email.trim(), this.password).subscribe({
      next: r => this.ingreso.emit(r.usuario),
      error: (e: HttpErrorResponse) => {
        const cuerpo = (e.error ?? {}) as ErrorIdentidad;
        this.password = '';
        this.enviando.set(false);
        if (cuerpo.codigo === 'verificacion_requerida') {
          this.codigo = '';
          this.aviso.set(cuerpo.message ?? 'Te enviamos un código de 6 dígitos a tu correo.');
          this.paso.set('codigo');
          setTimeout(() => this.campoCodigo()?.nativeElement.focus());
          return;
        }
        this.error.set(this.mensaje(cuerpo));
      },
    });
  }

  verificar(): void {
    this.enviando.set(true);
    this.error.set('');
    this.api.verificarCodigo(this.codigo.trim()).subscribe({
      next: r => this.ingreso.emit(r.usuario),
      error: (e: HttpErrorResponse) => {
        const cuerpo = (e.error ?? {}) as ErrorIdentidad;
        this.enviando.set(false);
        this.codigo = '';
        if (cuerpo.codigo === 'codigo_vencido') {
          this.volver();
        }
        this.error.set(this.mensaje(cuerpo));
      },
    });
  }

  volver(): void {
    this.paso.set('credenciales');
    this.codigo = '';
    this.error.set('');
    setTimeout(() => this.correo()?.nativeElement.focus());
  }

  private mensaje(cuerpo: ErrorIdentidad): string {
    const deCampo = cuerpo.errors ? Object.values(cuerpo.errors).flat()[0] : null;
    return deCampo || cuerpo.message || 'No pudimos conectar con identidad. Revisa tu conexión e inténtalo de nuevo.';
  }
}
