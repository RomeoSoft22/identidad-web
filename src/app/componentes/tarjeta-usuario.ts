import { Component, computed, input } from '@angular/core';
import { Usuario } from '../identidad-api';

@Component({
  selector: 'jc-tarjeta-usuario',
  template: `
    <div class="usuario">
      <span class="avatar" aria-hidden="true">{{ inicial() }}</span>
      <div><strong>{{ usuario().nombre }}</strong><span>{{ usuario().email }}</span></div>
    </div>
  `,
  styles: `
    .usuario { display: flex; align-items: center; gap: 12px; padding: 12px; margin: 0 0 20px; border: 1px solid var(--line); border-radius: 12px; }
    .avatar { flex: none; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: var(--blue-soft); color: var(--blue); font: 800 15px/1 var(--display); }
    div { min-width: 0; }
    strong { display: block; font-size: 14.5px; }
    span:not(.avatar) { display: block; font-size: 13.5px; color: var(--muted); overflow-wrap: anywhere; }
  `,
})
export class TarjetaUsuario {
  usuario = input.required<Usuario>();
  inicial = computed(() => (this.usuario().nombre || this.usuario().email).charAt(0).toUpperCase());
}
