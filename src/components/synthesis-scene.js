import { stateMachine, States } from '../core/state-machine.js';

/**
 * Clinical Synthesis Scene (Stage 11).
 * Pedagogical conclusion from optometrist to patient,
 * reinforcing prescription value and visual care.
 */
export class SynthesisScene {
  constructor() {
    this.time = 0;
  }

  onEnter(width, height) {
    this.setupUI();
  }

  onExit() {
    // Cleanup
  }

  onResize(width, height) {}

  setupUI() {
    const kickerEl = document.getElementById('card-kicker');
    const titleEl = document.getElementById('card-title');
    const descEl = document.getElementById('card-desc');
    const controlsEl = document.getElementById('card-controls');

    if (kickerEl) kickerEl.textContent = 'CONCLUSIÓN DE CONSULTA';
    if (titleEl) titleEl.textContent = 'Síntesis y Plan de Corrección Óptica';
    if (descEl) {
      descEl.textContent = 'Hemos repasado cómo la luz se enfoca en tu sistema visual y el motivo anatómico de tu graduación. Una lente formulada con exactitud reposiciona los fotones directamente sobre la fóvea.';
    }

    if (controlsEl) {
      controlsEl.innerHTML = `
        <div class="control-row">
          <div class="toggle-btn-group" style="flex-direction: column;">
            <button class="toggle-pill-btn" id="btn-re-myopia" style="text-align: left; padding: 12px 16px;">
              <span>🔍 Revisar de nuevo Miopía</span>
            </button>
            <button class="toggle-pill-btn" id="btn-re-hyperopia" style="text-align: left; padding: 12px 16px;">
              <span>🔮 Revisar de nuevo Hipermetropía</span>
            </button>
            <button class="toggle-pill-btn" id="btn-re-astig" style="text-align: left; padding: 12px 16px;">
              <span>📐 Revisar de nuevo Astigmatismo</span>
            </button>
            <button class="toggle-pill-btn" id="btn-re-presby" style="text-align: left; padding: 12px 16px;">
              <span>📖 Revisar de nuevo Presbicia</span>
            </button>
            <button class="toggle-pill-btn active" id="btn-restart-all" style="text-align: left; padding: 12px 16px;">
              <span>↺ Reiniciar Experiencia Completa</span>
            </button>
          </div>
          <div class="synthesis-copyright" style="margin-top: 18px; padding-top: 12px; border-top: 1px solid var(--border-subtle); text-align: center; width: 100%;">
            <span style="font-size: 0.72rem; color: var(--text-tertiary); letter-spacing: 0.03em;">
              Ocularis &middot; © ${new Date().getFullYear()} Jayzir Martinez &middot; Todos los derechos reservados.
            </span>
          </div>
        </div>
      `;

      controlsEl.querySelector('#btn-re-myopia')?.addEventListener('click', () => {
        stateMachine.jumpTo(States.MYOPIA);
      });
      controlsEl.querySelector('#btn-re-hyperopia')?.addEventListener('click', () => {
        stateMachine.jumpTo(States.HYPEROPIA);
      });
      controlsEl.querySelector('#btn-re-astig')?.addEventListener('click', () => {
        stateMachine.jumpTo(States.ASTIGMATISM);
      });
      controlsEl.querySelector('#btn-re-presby')?.addEventListener('click', () => {
        stateMachine.jumpTo(States.PRESBIOPIA);
      });
      controlsEl.querySelector('#btn-restart-all')?.addEventListener('click', () => {
        stateMachine.reset();
      });
    }
  }

  update(dt) {
    this.time += dt;
  }

  draw(ctx, width, height) {
    const cx = width * 0.58;
    const cy = height * 0.5;
    const scale = Math.min(width / 1280, height / 800);

    ctx.save();

    // Harmonic concentric light rings (representing visual health and refractive equilibrium)
    const rings = 4;
    for (let i = 0; i < rings; i++) {
      const radius = (60 + i * 45 + Math.sin(this.time * 2 + i) * 8) * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.lineWidth = 1.8 * scale;
      ctx.strokeStyle = i === 0 ? '#10b981' : (i === 1 ? '#00f2fe' : 'rgba(56, 189, 248, 0.25)');
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 10 * scale;
      ctx.stroke();
    }

    // Sharp emerald central focus
    ctx.beginPath();
    ctx.arc(cx, cy, 12 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 20 * scale;
    ctx.fill();

    ctx.restore();
  }
}
