import { stateMachine, States } from '../core/state-machine.js';

/**
 * Hero Macro-Eye Scene (Stage 1: Welcome & Visual Impact).
 * Features a cinematic stylized eye with biophotonic iris,
 * reactive pupil with subtle breathing, and discreet entry trigger.
 */
export class MacroEyeScene {
  constructor() {
    this.time = 0;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.pupilRadius = 38;
    this.targetPupilRadius = 38;
    this.irisColor1 = '#00f2fe';
    this.irisColor2 = '#0284c7';
    this.hotspotEl = null;
  }

  onEnter(width, height) {
    this.hotspotEl = document.getElementById('eye-macro-hotspot');
    if (this.hotspotEl) {
      this.hotspotEl.style.display = 'block';
      // Force reflow to ensure entry animation triggers
      void this.hotspotEl.offsetWidth;
      this.hotspotEl.classList.remove('hidden');
    }

    this.mouse.x = width * 0.5;
    this.mouse.y = height * 0.5;
    this.mouse.targetX = this.mouse.x;
    this.mouse.targetY = this.mouse.y;
  }

  onExit() {
    if (this.hotspotEl) {
      this.hotspotEl.classList.add('hidden');
      setTimeout(() => {
        if (this.hotspotEl?.classList.contains('hidden')) {
          this.hotspotEl.style.display = 'none';
        }
      }, 450);
    }
  }

  onResize(width, height) {
    // Coordinate adjustment on resize
  }

  onMouseMove(x, y) {
    this.mouse.targetX = x;
    this.mouse.targetY = y;
  }

  onMouseDown(x, y) {
    // Clicking or tapping on the iris area transitions directly to anatomy
    const cx = window.innerWidth * 0.5;
    const cy = window.innerHeight * 0.5;
    const dist = Math.hypot(x - cx, y - cy);
    if (dist < 130) {
      stateMachine.next();
    }
  }

  update(dt) {
    this.time += dt;

    // Smooth pointer inertia for parallax effect
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * Math.min(1, dt * 5);
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * Math.min(1, dt * 5);

    // Subtle physiological pupil breathing
    const breathing = Math.sin(this.time * 1.5) * 2.5;
    this.pupilRadius = this.targetPupilRadius + breathing;
  }

  draw(ctx, width, height) {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const scale = Math.min(width / 1280, height / 800);
    const s = Math.max(0.75, Math.min(scale, 1.2));

    // Parallax gaze offset
    const lookOffsetX = ((this.mouse.x - cx) / width) * 26 * s;
    const lookOffsetY = ((this.mouse.y - cy) / height) * 20 * s;

    ctx.save();

    // 1. Posterior atmospheric eye halo
    const haloGrad = ctx.createRadialGradient(cx, cy, 60 * s, cx, cy, 320 * s);
    haloGrad.addColorStop(0, 'rgba(0, 242, 254, 0.18)');
    haloGrad.addColorStop(0.4, 'rgba(2, 132, 199, 0.08)');
    haloGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(cx - 350 * s, cy - 350 * s, 700 * s, 700 * s);

    // 2. Stylized elliptical sclera (Palpebral aperture / Eye shape)
    const eyeWidth = 340 * s;
    const eyeHeight = 160 * s;

    ctx.beginPath();
    ctx.moveTo(cx - eyeWidth, cy);
    ctx.bezierCurveTo(
      cx - eyeWidth * 0.45, cy - eyeHeight * 1.25,
      cx + eyeWidth * 0.45, cy - eyeHeight * 1.25,
      cx + eyeWidth, cy
    );
    ctx.bezierCurveTo(
      cx + eyeWidth * 0.45, cy + eyeHeight * 1.25,
      cx - eyeWidth * 0.45, cy + eyeHeight * 1.25,
      cx - eyeWidth, cy
    );
    ctx.closePath();

    // Sclera fill with depth
    const scleraGrad = ctx.createRadialGradient(
      cx, cy, 30 * s,
      cx, cy, eyeWidth
    );
    scleraGrad.addColorStop(0, '#0d1f3d');
    scleraGrad.addColorStop(0.65, '#071224');
    scleraGrad.addColorStop(1, '#020611');
    ctx.fillStyle = scleraGrad;
    ctx.fill();

    // Palpebral aperture rim with fine glow
    ctx.lineWidth = 2.5 * s;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 12 * s;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Clip drawing to eyelid interior
    ctx.clip();

    // 3. Iris (Biometric bioluminescent circle with fibers)
    const irisX = cx + lookOffsetX;
    const irisY = cy + lookOffsetY;
    const irisRadius = 100 * s;

    // Iris background
    const irisGrad = ctx.createRadialGradient(
      irisX, irisY, this.pupilRadius * s,
      irisX, irisY, irisRadius
    );
    irisGrad.addColorStop(0, '#0284c7');
    irisGrad.addColorStop(0.45, '#0369a1');
    irisGrad.addColorStop(0.85, '#00f2fe');
    irisGrad.addColorStop(1, '#07172f');

    ctx.beginPath();
    ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // Radial stromal iris fibers (microscopic details)
    const fibersCount = 64;
    ctx.save();
    ctx.translate(irisX, irisY);
    for (let i = 0; i < fibersCount; i++) {
      const angle = (i / fibersCount) * Math.PI * 2;
      const lengthVar = Math.sin(i * 1.7 + this.time * 0.5) * 8 * s;
      const startR = (this.pupilRadius + 4) * s;
      const endR = (irisRadius - 6 + lengthVar) * s;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * startR, Math.sin(angle) * startR);
      ctx.lineTo(Math.cos(angle) * endR, Math.sin(angle) * endR);
      ctx.lineWidth = (i % 2 === 0 ? 1.4 : 0.8) * s;
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(0, 242, 254, 0.45)' : 'rgba(56, 189, 248, 0.2)';
      ctx.stroke();
    }
    ctx.restore();

    // Outer corneal / limbus ring
    ctx.beginPath();
    ctx.arc(irisX, irisY, irisRadius, 0, Math.PI * 2);
    ctx.lineWidth = 3 * s;
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.stroke();

    // 4. Deep black pupil with gradient
    ctx.beginPath();
    ctx.arc(irisX, irisY, this.pupilRadius * s, 0, Math.PI * 2);
    ctx.fillStyle = '#010309';
    ctx.fill();

    // 5. Specular highlights and glints (Corneal light reflection)
    const refl1X = irisX - irisRadius * 0.35;
    const refl1Y = irisY - irisRadius * 0.35;
    ctx.beginPath();
    ctx.ellipse(refl1X, refl1Y, 14 * s, 9 * s, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8 * s;
    ctx.fill();

    const refl2X = irisX + irisRadius * 0.28;
    const refl2Y = irisY + irisRadius * 0.28;
    ctx.beginPath();
    ctx.arc(refl2X, refl2Y, 5 * s, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}
