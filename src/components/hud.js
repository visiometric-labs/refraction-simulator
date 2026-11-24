import { stateMachine, States, STAGE_SEQUENCE, STAGE_TITLES } from '../core/state-machine.js';
import { events } from '../core/events.js';
import { toggleFullscreen, isFullscreenActive } from '../core/device-guard.js';

export class HudController {
  constructor() {
    this.stageBadgeEl = document.getElementById('current-stage-badge');
    this.btnPrev = document.getElementById('hud-btn-prev');
    this.btnNext = document.getElementById('hud-btn-next');
    this.btnReset = document.getElementById('hud-btn-reset');
    this.btnPlayPause = document.getElementById('hud-btn-playpause');
    this.iconPlay = document.getElementById('icon-play');
    this.iconPause = document.getElementById('icon-pause');
    this.stageDots = document.querySelectorAll('.stage-dot');
    this.btnToggleFs = document.getElementById('btn-toggle-fullscreen');
    this.iconFsEnter = document.getElementById('icon-fullscreen-enter');
    this.iconFsExit = document.getElementById('icon-fullscreen-exit');
    this.shortcutBtns = document.querySelectorAll('.shortcut-pill');

    this.bindEvents();
  }

  bindEvents() {
    // HUD navigation
    this.btnPrev?.addEventListener('click', () => stateMachine.prev());
    this.btnNext?.addEventListener('click', () => stateMachine.next());
    this.btnReset?.addEventListener('click', () => stateMachine.reset());

    // Play / Pause
    this.btnPlayPause?.addEventListener('click', () => {
      const isPaused = stateMachine.togglePlayPause();
      if (this.iconPlay && this.iconPause) {
        this.iconPlay.style.display = isPaused ? 'block' : 'none';
        this.iconPause.style.display = isPaused ? 'none' : 'block';
      }
    });

    // Click on timeline stage dots
    this.stageDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const stageIdx = parseInt(dot.dataset.stage, 10);
        stateMachine.jumpTo(stageIdx);
      });
    });

    // Top shortcut pills
    this.shortcutBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.jump;
        stateMachine.jumpTo(target);
      });
    });

    // Discreet fullscreen toggle button
    this.btnToggleFs?.addEventListener('click', async () => {
      await toggleFullscreen();
      this.updateFullscreenIcon();
    });

    document.addEventListener('fullscreenchange', () => this.updateFullscreenIcon());
    document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenIcon());

    // Discreet button above Macro-Eye
    const btnEnterEye = document.getElementById('btn-enter-interior');
    btnEnterEye?.addEventListener('click', () => {
      stateMachine.jumpTo(States.ANATOMY);
    });

    // Listen to state changes from state machine
    events.on('state:change', ({ to, index, title }) => {
      this.syncUI(to, index, title);
    });
  }

  syncUI(toState, index, title) {
    // 1. Top badge
    if (this.stageBadgeEl) {
      this.stageBadgeEl.textContent = title || STAGE_TITLES[toState] || '';
    }

    // 2. Stage timeline dots
    this.stageDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
      dot.classList.toggle('completed', idx < index);
    });

    // 3. Top shortcut pills
    this.shortcutBtns.forEach(btn => {
      const jump = btn.dataset.jump;
      const isMatch = (jump === 'eye-hero' && toState === States.EYE_HERO) ||
                      (jump === 'anatomy' && toState === States.ANATOMY) ||
                      (jump === 'myopia' && (toState === States.MYOPIA || toState === States.MYOPIA_PERCEPTION)) ||
                      (jump === 'hyperopia' && (toState === States.HYPEROPIA || toState === States.HYPEROPIA_PERCEPTION)) ||
                      (jump === 'astigmatism' && (toState === States.ASTIGMATISM || toState === States.ASTIGMATISM_PERCEPTION)) ||
                      (jump === 'presbyopia' && (toState === States.PRESBIOPIA || toState === States.PRESBIOPIA_PERCEPTION));
      btn.classList.toggle('active', isMatch);
    });

    // 4. Previous button (disabled on stage 0)
    if (this.btnPrev) {
      this.btnPrev.style.opacity = index <= 0 ? '0.35' : '1';
      this.btnPrev.style.pointerEvents = index <= 0 ? 'none' : 'auto';
    }

    // 5. Next button (dynamic text on final stage)
    if (this.btnNext) {
      const nextSpan = this.btnNext.querySelector('span');
      if (nextSpan) {
        nextSpan.textContent = index === STAGE_SEQUENCE.length - 1 ? 'Finalizar' : 'Siguiente';
      }
    }
  }

  updateFullscreenIcon() {
    const isFs = isFullscreenActive();
    if (this.iconFsEnter && this.iconFsExit) {
      this.iconFsEnter.style.display = isFs ? 'none' : 'inline-block';
      this.iconFsExit.style.display = isFs ? 'inline-block' : 'none';
    }
    if (this.btnToggleFs) {
      this.btnToggleFs.title = isFs ? 'Salir de pantalla completa' : 'Pantalla completa para tablet';
      if (isFs) {
        this.btnToggleFs.classList.add('active');
      } else {
        this.btnToggleFs.classList.remove('active');
      }
    }
  }
}
