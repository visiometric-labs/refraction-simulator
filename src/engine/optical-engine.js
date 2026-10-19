/**
 * Core 60 FPS 2D Canvas rendering engine for the Refraction Simulator.
 * Manages scene lifecycle, ambient particles, animated cinematic
 * transitions, and Retina/4K display support.
 */

export class OpticalEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    this.activeScene = null;
    this.isPaused = false;
    this.lastTime = 0;
    this.animationFrameId = null;

    // Cinematic transition system
    this.isTransitioning = false;
    this.transitionType = 'photon-sweep'; // 'zoom-in' | 'zoom-out' | 'photon-sweep' | 'crossfade'
    this.transitionProgress = 0;
    this.transitionDuration = 0.85; // Seconds
    this.fromScene = null;
    this.toScene = null;

    // Ambient light particles (suspended photonic dust)
    this.particles = [];
    this.initParticles(45);

    // Bindings
    this._renderLoop = this._renderLoop.bind(this);
    this._handleResize = this._handleResize.bind(this);

    window.addEventListener('resize', this._handleResize);
    this._attachInputListeners();
    this._handleResize();
  }

  /**
   * Initializes bioluminescent background photonic particles
   * @param {number} count 
   */
  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.8 + 0.6,
        speedX: (Math.random() - 0.5) * 0.015,
        speedY: (Math.random() - 0.5) * 0.015,
        opacity: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.4 ? '#00f2fe' : '#38bdf8'
      });
    }
  }

  /**
   * Resizes canvas accounting for devicePixelRatio
   */
  _handleResize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (this.activeScene?.onResize) {
      this.activeScene.onResize(this.width, this.height);
    }
    if (this.toScene?.onResize) {
      this.toScene.onResize(this.width, this.height);
    }
  }

  /**
   * Immediate scene switch without animation (used only on init)
   * @param {object} scene 
   */
  setScene(scene) {
    if (this.activeScene?.onExit) {
      this.activeScene.onExit();
    }
    this.activeScene = scene;
    if (this.activeScene?.onEnter) {
      this.activeScene.onEnter(this.width, this.height);
    }
  }

  /**
   * Smooth cinematic transition between scenes with camera effects
   * @param {object} targetScene Target scene to transition towards
   * @param {'zoom-in'|'zoom-out'|'photon-sweep'|'crossfade'} [type='photon-sweep']
   * @param {number} [duration=0.85] Duration in seconds
   */
  transitionTo(targetScene, type = 'photon-sweep', duration = 0.85) {
    if (!this.activeScene) {
      this.setScene(targetScene);
      return;
    }

    if (this.activeScene === targetScene) {
      // If already active scene but reactivated (e.g. returning from perception), ensure UI re-initialization
      targetScene?.onEnter?.(this.width, this.height);
      return;
    }

    // If a transition was already in progress, exit previous immediately
    if (this.isTransitioning && this.fromScene) {
      this.fromScene.onExit?.();
    }

    // Exit current scene and clean its UI before starting new one
    this.activeScene?.onExit?.();

    this.fromScene = this.activeScene;
    this.toScene = targetScene;
    this.transitionType = type;
    this.transitionDuration = Math.max(0.3, duration);
    this.transitionProgress = 0;
    this.isTransitioning = true;

    // Initialize incoming scene
    if (this.toScene?.onEnter) {
      this.toScene.onEnter(this.width, this.height);
    }
  }

  /**
   * Cubic-bezier easing function for cinematic motion
   */
  _easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Starts the render loop
   */
  start() {
    if (!this.animationFrameId) {
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this._renderLoop);
    }
  }

  /**
   * Stops the render loop
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Toggles pause state of render loop
   */
  setPaused(paused) {
    this.isPaused = paused;
  }

  /**
   * Main animation loop at 60 FPS
   * @param {number} timestamp 
   */
  _renderLoop(timestamp) {
    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 0.1); // clamp delta-time

    // 1. Clear background with night gradient
    this._renderBackground();

    // 2. Background photonic particles
    this._renderParticles(dt);

    // 3. Normal or transition scene render
    if (this.isTransitioning && this.fromScene && this.toScene) {
      this._renderTransition(dt);
    } else if (this.activeScene) {
      if (!this.isPaused && this.activeScene.update) {
        this.activeScene.update(dt);
      }
      if (this.activeScene.draw) {
        this.activeScene.draw(this.ctx, this.width, this.height);
      }
    }

    this.animationFrameId = requestAnimationFrame(this._renderLoop);
  }

  /**
   * Renders cinematic transition between scenes
   * @param {number} dt 
   */
  _renderTransition(dt) {
    this.transitionProgress += dt / this.transitionDuration;
    const t = Math.min(1, Math.max(0, this.transitionProgress));
    const ease = this._easeInOutCubic(t);

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w * 0.5;
    const cy = h * 0.5;

    // Update both scenes during transition so they do not freeze
    if (!this.isPaused) {
      this.fromScene.update?.(dt);
      this.toScene.update?.(dt);
    }

    if (this.transitionType === 'zoom-in') {
      // Cinematic Zoom-In: Macro eye expands into pupil and fades as sagittal cut emerges from center
      ctx.save();
      ctx.translate(cx, cy);
      const scaleFrom = 1 + ease * 2.8;
      ctx.scale(scaleFrom, scaleFrom);
      ctx.translate(-cx, -cy);
      ctx.globalAlpha = Math.max(0, 1 - ease * 1.3);
      this.fromScene.draw(ctx, w, h);
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      const scaleTo = 0.72 + ease * 0.28;
      ctx.scale(scaleTo, scaleTo);
      ctx.translate(-cx, -cy);
      ctx.globalAlpha = Math.min(1, ease * 1.4);
      this.toScene.draw(ctx, w, h);
      ctx.restore();

      // Shockwave ring when passing through pupil portal
      this._drawWarpShockwave(ctx, cx, cy, ease, Math.max(w, h));

    } else if (this.transitionType === 'zoom-out') {
      // Cinematic Zoom-Out: Sagittal cut zooms out and macro eye envelops
      ctx.save();
      ctx.translate(cx, cy);
      const scaleFrom = 1 - ease * 0.35;
      ctx.scale(scaleFrom, scaleFrom);
      ctx.translate(-cx, -cy);
      ctx.globalAlpha = Math.max(0, 1 - ease * 1.3);
      this.fromScene.draw(ctx, w, h);
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      const scaleTo = 2.4 - ease * 1.4;
      ctx.scale(scaleTo, scaleTo);
      ctx.translate(-cx, -cy);
      ctx.globalAlpha = Math.min(1, ease * 1.3);
      this.toScene.draw(ctx, w, h);
      ctx.restore();

    } else {
      // 'photon-sweep' / 'crossfade': Dissolve with bioluminescent laser beam sweep
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - ease);
      this.fromScene.draw(ctx, w, h);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = Math.min(1, ease);
      this.toScene.draw(ctx, w, h);
      ctx.restore();

      // Transverse photonic laser sweep
      this._drawLaserSweep(ctx, w, h, ease);
    }

    // Complete transition when 100% reached
    if (t >= 1) {
      this.activeScene = this.toScene;
      this.fromScene = null;
      this.toScene = null;
      this.isTransitioning = false;
    }
  }

  /**
   * Draws a vertical cyan laser beam that sweeps across the screen
   */
  _drawLaserSweep(ctx, w, h, ease) {
    const sweepX = ease * (w + 240) - 120;
    const beamWidth = 140;

    ctx.save();
    const beamGrad = ctx.createLinearGradient(sweepX - beamWidth, 0, sweepX + beamWidth, 0);
    beamGrad.addColorStop(0, 'rgba(0, 242, 254, 0)');
    beamGrad.addColorStop(0.5, 'rgba(0, 242, 254, 0.45)');
    beamGrad.addColorStop(1, 'rgba(0, 242, 254, 0)');

    ctx.fillStyle = beamGrad;
    ctx.fillRect(sweepX - beamWidth, 0, beamWidth * 2, h);

    // Central bright laser line
    ctx.beginPath();
    ctx.moveTo(sweepX, 0);
    ctx.lineTo(sweepX, h);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws bioluminescent shockwave during zoom into pupil interior
   */
  _drawWarpShockwave(ctx, cx, cy, ease, maxDim) {
    const radius = ease * maxDim * 0.65;
    const alpha = Math.sin(ease * Math.PI) * 0.7;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(10, radius), 0, Math.PI * 2);
    ctx.lineWidth = 4 * (1 - ease * 0.6);
    ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 24;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws medical background with radial atmospheric gradient
   */
  _renderBackground() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const bgGrad = ctx.createRadialGradient(
      w * 0.55, h * 0.48, 50,
      w * 0.50, h * 0.50, Math.max(w, h) * 0.75
    );
    bgGrad.addColorStop(0, '#0a172e');
    bgGrad.addColorStop(0.55, '#060e1d');
    bgGrad.addColorStop(1, '#020611');

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Updates and draws suspended photonic particles
   * @param {number} dt 
   */
  _renderParticles(dt) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    for (const p of this.particles) {
      if (!this.isPaused) {
        p.x += p.speedX * dt * 60;
        p.y += p.speedY * dt * 60;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Binds touch and mouse interaction listeners
   */
  _attachInputListeners() {
    const forwardPointer = (method, e) => {
      if (this.isTransitioning) return; // Avoid spurious clicks during transition animation
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (this.activeScene?.[method]) {
        this.activeScene[method](x, y, e);
      }
    };

    this.canvas.addEventListener('mousemove', (e) => forwardPointer('onMouseMove', e));
    this.canvas.addEventListener('mousedown', (e) => forwardPointer('onMouseDown', e));
    this.canvas.addEventListener('mouseup', (e) => forwardPointer('onMouseUp', e));

    this.canvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      if (t) forwardPointer('onMouseDown', t);
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      if (t) forwardPointer('onMouseMove', t);
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      if (t) forwardPointer('onMouseUp', t);
    }, { passive: true });
  }

  /**
   * Resource cleanup on teardown
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._handleResize);
  }
}
