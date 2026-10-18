import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Marco de todas las pantallas: panel de marca a la izquierda (escritorio) y tarjeta con la página activa. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div class="shell">
      <aside class="marca-panel">
        <a class="marca" href="https://juarezcampos.net"><span class="marca-mark">JC</span><span>Juarez Campos<small>Identidad</small></span></a>
        <div class="mensaje">
          <h2>Una sola cuenta para todos tus sistemas.</h2>
          <p>Ingresa una vez y continúa en cada sistema de Juarez Campos donde tengas acceso.</p>
          <ul class="puntos">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Tu contraseña solo se escribe en esta página. Los sistemas nunca la ven.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Después de 10 intentos fallidos, tu cuenta se bloquea para protegerla.</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>
              <span>Cada sistema te muestra solo lo que tu rol permite.</span>
            </li>
          </ul>
        </div>
        <div class="pie-panel">identidad.juarezcampos.net</div>
      </aside>

      <main class="zona">
        <div class="tarjeta">
          <a class="marca solo-movil" href="https://juarezcampos.net"><span class="marca-mark">JC</span><span>Juarez Campos<small>Identidad</small></span></a>
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: `
    .shell { min-height: 100%; display: grid; grid-template-columns: 1fr; }
    @media (min-width: 960px) { .shell { grid-template-columns: minmax(380px, 44%) 1fr; } }

    .marca-panel {
      display: none; position: relative; overflow: hidden; color: #e9eef5; padding: 48px 56px;
      background: radial-gradient(120% 80% at 0% 0%, #0a3a73 0%, transparent 55%),
                  radial-gradient(90% 70% at 100% 100%, #03306a 0%, transparent 60%), var(--ink-2);
    }
    @media (min-width: 960px) { .marca-panel { display: flex; flex-direction: column; justify-content: space-between; } }
    .marca-panel::after {
      content: ""; position: absolute; inset: auto -120px -160px auto; width: 420px; height: 420px; border-radius: 50%;
      border: 1px solid rgba(255,255,255,.07); box-shadow: 0 0 0 60px rgba(255,255,255,.025), 0 0 0 120px rgba(255,255,255,.018);
    }
    .mensaje { position: relative; z-index: 1; }
    h2 { font: 800 clamp(30px, 3vw, 40px)/1.12 var(--display); letter-spacing: -.02em; margin: 0 0 18px; max-width: 15ch; color: #fff; }
    .mensaje p { color: #b7c3d3; max-width: 40ch; margin: 0; }
    .puntos { list-style: none; padding: 0; margin: 34px 0 0; display: grid; gap: 16px; max-width: 42ch; }
    .puntos li { display: grid; grid-template-columns: 28px 1fr; gap: 12px; align-items: start; color: #d5deea; font-size: 14.5px; }
    .puntos svg { width: 28px; height: 28px; padding: 6px; border-radius: 8px; background: rgba(3,127,255,.18); color: #7dbbff; }
    .pie-panel { font-size: 13px; color: #8494a8; position: relative; z-index: 1; }

    .marca { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: inherit; font: 700 16px/1 var(--display); }
    .marca-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; background: var(--blue); color: #fff; font: 800 14px/1 var(--display); letter-spacing: .02em; }
    .marca small { display: block; margin-top: 4px; font: 500 12px/1 var(--body); color: var(--muted); letter-spacing: .02em; }
    .marca-panel .marca small { color: #8fa0b5; }

    .zona {
      display: grid; place-items: center; padding: 40px 16px;
      background: radial-gradient(circle at 50% 38%, #dcecff, transparent 46%), var(--cream);
    }
    .tarjeta {
      width: min(430px, 100%); background: var(--white); border-radius: 18px; padding: 36px 34px 28px;
      box-shadow: 0 20px 60px #037fff20, 0 1px 2px rgba(9,10,12,.05);
    }
    @media (max-width: 420px) { .tarjeta { padding: 28px 22px 22px; } }
    .solo-movil { display: flex; width: fit-content; margin-bottom: 28px; }
    @media (min-width: 960px) { .solo-movil { display: none; } }
  `,
})
export class App {}
