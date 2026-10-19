import { stateMachine, States } from './core/state-machine.js';
import { events } from './core/events.js';
import { isMobileDevice, requestFullscreen } from './core/device-guard.js';
import { OpticalEngine } from './engine/optical-engine.js';
import { HudController } from './components/hud.js';
import { MacroEyeScene } from './components/macro-eye.js';
import { AnatomyExplorerScene } from './components/anatomy-explorer.js';
import { RefractionScene } from './components/refraction-scene.js';
import { PerceptionSimulator } from './components/perception-simulator.js';
import { SynthesisScene } from './components/synthesis-scene.js';

class App {
  constructor() {
    this.canvas = document.getElementById('optical-canvas');
    this.engine = new OpticalEngine(this.canvas);
    this.hud = new HudController();

    // Scene instances
    this.macroEyeScene = new MacroEyeScene();
    this.anatomyScene = new AnatomyExplorerScene();
    this.myopiaRefractionScene = new RefractionScene('myopia');
    this.myopiaPerceptionScene = new PerceptionSimulator('myopia');
    this.hyperopiaRefractionScene = new RefractionScene('hyperopia');
    this.hyperopiaPerceptionScene = new PerceptionSimulator('hyperopia');
    this.astigmatismRefractionScene = new RefractionScene('astigmatism');
    this.astigmatismPerceptionScene = new PerceptionSimulator('astigmatism');
    this.presbyopiaRefractionScene = new RefractionScene('presbyopia');
    this.presbyopiaPerceptionScene = new PerceptionSimulator('presbyopia');
    this.synthesisScene = new SynthesisScene();

    this.init();
  }

  init() {
    // 1. Mobile Gate check and tablet adaptation
    this.checkMobileGate();
    const sceneOverlay = document.getElementById('scene-overlay');
    window.addEventListener('resize', () => {
      this.checkMobileGate();
      if (window.innerWidth > 1024) {
        sceneOverlay?.classList.remove('collapsed');
      }
    });

    // 2. Clinical card collapse/restore control on tablet
    const btnToggleCard = document.getElementById('btn-toggle-card');
    const btnRestoreCard = document.getElementById('btn-restore-card');

    btnToggleCard?.addEventListener('click', (e) => {
      e.stopPropagation();
      sceneOverlay?.classList.add('collapsed');
    });

    btnRestoreCard?.addEventListener('click', (e) => {
      e.stopPropagation();
      sceneOverlay?.classList.remove('collapsed');
    });

    // 3. Welcome screen / Fullscreen control
    const entryGate = document.getElementById('entry-gate');
    const btnStart = document.getElementById('btn-start-experience');

    btnStart?.addEventListener('click', async () => {
      // Attempts native fullscreen via user gesture
      await requestFullscreen();

      // Dismisses welcome screen with fade out
      if (entryGate) {
        entryGate.classList.add('dismissed');
      }

      // Transitions to first stage of sequence
      stateMachine.transition(States.EYE_HERO);
    });

    // 4. Scene switcher orchestrator with cinematic transitions
    events.on('state:change', ({ from, to }) => {
      this.handleSceneSwitch(from, to);
    });

    // 5. Simulation pause
    events.on('simulation:pause', (isPaused) => {
      this.engine.setPaused(isPaused);
    });

    // Start 60 FPS loop
    this.engine.start();
  }

  checkMobileGate() {
    const mobileGateEl = document.getElementById('mobile-gate');
    if (!mobileGateEl) return;
    if (isMobileDevice()) {
      mobileGateEl.style.display = 'flex';
      this.engine.setPaused(true);
    } else {
      mobileGateEl.style.display = 'none';
      this.engine.setPaused(false);
    }
  }

  /**
   * Manages scene switching with animated transitions on both
   * Canvas and interface overlays.
   * @param {string} from Previous state
   * @param {string} to Target state
   */
  handleSceneSwitch(from, to) {
    const sceneOverlay = document.getElementById('scene-overlay');

    // Deactivate perception simulator if active with exit animation
    if (from === States.MYOPIA_PERCEPTION) {
      this.myopiaPerceptionScene.onExit();
    }
    if (from === States.HYPEROPIA_PERCEPTION) {
      this.hyperopiaPerceptionScene.onExit();
    }
    if (from === States.ASTIGMATISM_PERCEPTION) {
      this.astigmatismPerceptionScene.onExit();
    }
    if (from === States.PRESBIOPIA_PERCEPTION) {
      this.presbyopiaPerceptionScene.onExit();
    }

    // Hide refraction dock when entering any perception example
    if (to === States.MYOPIA_PERCEPTION || to === States.HYPEROPIA_PERCEPTION || to === States.ASTIGMATISM_PERCEPTION || to === States.PRESBIOPIA_PERCEPTION) {
      const dockEl = document.getElementById('refraction-dock');
      if (dockEl) {
        dockEl.style.display = 'none';
        dockEl.innerHTML = '';
      }
    }

    // Configure cinematic transition type
    let transitionType = 'photon-sweep';
    let duration = 0.85;

    if (from === States.EYE_HERO && to === States.ANATOMY) {
      // Cinematic Zoom-In: from front macro view to sagittal interior
      transitionType = 'zoom-in';
      duration = 0.95;
    } else if (from === States.ANATOMY && to === States.EYE_HERO) {
      // Cinematic Zoom-Out: return to macro eye
      transitionType = 'zoom-out';
      duration = 0.95;
    } else if (from === States.ENTRY) {
      // Smooth initial entrance
      transitionType = 'crossfade';
      duration = 0.6;
    }

    // Animate clinical explanation card
    this.animateCardChange(() => {
      switch (to) {
        case States.EYE_HERO:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.updateCardForHero();
          this.engine.transitionTo(this.macroEyeScene, transitionType, duration);
          break;

        case States.ANATOMY:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.engine.transitionTo(this.anatomyScene, transitionType, duration);
          break;

        case States.MYOPIA:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.engine.transitionTo(this.myopiaRefractionScene, transitionType, duration);
          break;

        case States.MYOPIA_PERCEPTION:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.myopiaPerceptionScene.onEnter();
          break;

        case States.HYPEROPIA:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.engine.transitionTo(this.hyperopiaRefractionScene, transitionType, duration);
          break;

        case States.HYPEROPIA_PERCEPTION:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.hyperopiaPerceptionScene.onEnter();
          break;

        case States.ASTIGMATISM:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.engine.transitionTo(this.astigmatismRefractionScene, transitionType, duration);
          break;

        case States.ASTIGMATISM_PERCEPTION:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.astigmatismPerceptionScene.onEnter();
          break;

        case States.PRESBIOPIA:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.engine.transitionTo(this.presbyopiaRefractionScene, transitionType, duration);
          break;

        case States.PRESBIOPIA_PERCEPTION:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.presbyopiaPerceptionScene.onEnter();
          break;

        case States.SYNTHESIS:
          if (sceneOverlay) sceneOverlay.style.display = 'block';
          this.engine.transitionTo(this.synthesisScene, transitionType, duration);
          break;
      }
    });
  }

  /**
   * Smooths text and controls update on clinical card
   * @param {Function} updateFn 
   */
  animateCardChange(updateFn) {
    const card = document.getElementById('scene-card');
    if (!card) {
      updateFn();
      return;
    }
    card.classList.add('switching');
    setTimeout(() => {
      updateFn();
      card.classList.remove('switching');
    }, 180);
  }

  updateCardForHero() {
    const kickerEl = document.getElementById('card-kicker');
    const titleEl = document.getElementById('card-title');
    const descEl = document.getElementById('card-desc');
    const controlsEl = document.getElementById('card-controls');

    if (kickerEl) kickerEl.textContent = 'BIENVENIDO A OCULARIS';
    if (titleEl) titleEl.textContent = 'El Sistema Óptico Humano';
    if (descEl) {
      descEl.textContent = 'El ojo humano capta la luz del entorno y la enfoca sobre la retina para formar imágenes nítidas. Puedes tocar el botón sobre el ojo o hacer clic en "Siguiente" para explorar su estructura interna.';
    }
    if (controlsEl) {
      controlsEl.innerHTML = `
        <div class="control-row">
          <div class="toggle-btn-group">
            <button class="toggle-pill-btn active" id="btn-hero-explore">
              <span>✦ Explorar Anatomía Interna</span>
            </button>
          </div>
        </div>
      `;
      controlsEl.querySelector('#btn-hero-explore')?.addEventListener('click', () => {
        stateMachine.next();
      });
    }
  }
}

// Initialize application once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
