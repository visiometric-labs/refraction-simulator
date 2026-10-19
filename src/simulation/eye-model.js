/**
 * Simplified 2D geometric and optical model of the human eye for educational refraction.
 */

export class EyeGeometry {
  constructor() {
    // Anatomical base parameters
    this.centerX = 0;
    this.centerY = 0;
    this.scale = 1;

    // Relative px dimensions
    this.corneaRadius = 80;
    this.corneaThickness = 12;
    this.lensRadiusX = 22;
    this.lensRadiusY = 65;
    this.axialLength = 340; // Distance from corneal apex to fovea
    this.eyeRadiusY = 130;  // Eyeball vertical radius
    
    // Refractive parameters
    this.axialElongation = 0; // Additional px to simulate myopia (0 = emmetrope)
    this.corneaPowerFactor = 1.0;
    this.lensPowerFactor = 1.0;
    this.astigmatismMeridianOffset = 0; // Power difference between meridians
  }

  /**
   * Updates eye dimensions and center according to viewport size.
   * @param {number} width 
   * @param {number} height 
   */
  updateLayout(width, height) {
    this.scale = Math.min(width / 1360, height / 820);
    this.scale = Math.max(0.65, Math.min(this.scale, 1.15));

    // Centered towards the right to ensure full separation from left concept card
    this.centerX = Math.max(width * 0.58, 470 * this.scale);
    this.centerY = height * 0.49;
  }

  /**
   * Position of the anterior corneal apex
   */
  get corneaApex() {
    return {
      x: this.centerX - 140 * this.scale,
      y: this.centerY
    };
  }

  /**
   * Center of the crystalline lens
   */
  get lensCenter() {
    return {
      x: this.centerX - 60 * this.scale,
      y: this.centerY
    };
  }

  /**
   * Position of fovea / central retina
   */
  get retinaApex() {
    const totalLength = (this.axialLength + this.axialElongation) * this.scale;
    return {
      x: this.corneaApex.x + totalLength,
      y: this.centerY
    };
  }

  /**
   * Draws complete sagittal cross-section with gradients and premium medical style
   * @param {CanvasRenderingContext2D} ctx 
   * @param {object} options
   */
  drawSagittal(ctx, options = {}) {
    const s = this.scale;
    const cApex = this.corneaApex;
    const lCenter = this.lensCenter;
    const rApex = this.retinaApex;
    const eyeR_Y = this.eyeRadiusY * s;

    ctx.save();

    // 1. Sclera & Posterior wall (Eyeball)
    ctx.beginPath();
    ctx.moveTo(cApex.x + 30 * s, this.centerY - eyeR_Y * 0.85);
    ctx.bezierCurveTo(
      cApex.x + 120 * s, this.centerY - eyeR_Y * 1.05,
      rApex.x - 40 * s, this.centerY - eyeR_Y * 1.05,
      rApex.x, this.centerY
    );
    ctx.bezierCurveTo(
      rApex.x - 40 * s, this.centerY + eyeR_Y * 1.05,
      cApex.x + 120 * s, this.centerY + eyeR_Y * 1.05,
      cApex.x + 30 * s, this.centerY + eyeR_Y * 0.85
    );

    // Vitreous humor fill with subtle bioluminescent gradient
    const vitreousGrad = ctx.createRadialGradient(
      this.centerX + 20 * s, this.centerY, 20 * s,
      this.centerX + 40 * s, this.centerY, eyeR_Y * 1.2
    );
    vitreousGrad.addColorStop(0, 'rgba(8, 26, 52, 0.45)');
    vitreousGrad.addColorStop(0.8, 'rgba(4, 14, 28, 0.7)');
    vitreousGrad.addColorStop(1, 'rgba(2, 8, 18, 0.95)');
    ctx.fillStyle = vitreousGrad;
    ctx.fill();

    // Outer sclera stroke
    ctx.lineWidth = 4 * s;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.stroke();

    // 2. Retina layer (Posterior sensory boundary with amber/emerald glow)
    ctx.beginPath();
    ctx.arc(rApex.x - 120 * s, this.centerY, 125 * s, -Math.PI * 0.38, Math.PI * 0.38);
    ctx.lineWidth = 3 * s;
    ctx.strokeStyle = options.retinaColor || 'rgba(245, 158, 11, 0.6)';
    ctx.shadowColor = options.retinaGlow || 'rgba(245, 158, 11, 0.4)';
    ctx.shadowBlur = 12 * s;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // Fovea marker
    ctx.beginPath();
    ctx.arc(rApex.x, this.centerY, 4 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#00f2fe';
    ctx.fill();

    // 3. Cornea (Anterior transparent dome)
    ctx.beginPath();
    ctx.arc(cApex.x + 70 * s, this.centerY, 85 * s, Math.PI * 0.72, Math.PI * 1.28);
    ctx.lineWidth = 7 * s;
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 10 * s;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Iris (Superior and inferior pupillary aperture)
    const pupilHalf = 32 * s;
    ctx.lineWidth = 5 * s;
    ctx.strokeStyle = '#0284c7';
    // Superior iris
    ctx.beginPath();
    ctx.moveTo(lCenter.x - 12 * s, this.centerY - eyeR_Y * 0.75);
    ctx.lineTo(lCenter.x - 6 * s, this.centerY - pupilHalf);
    ctx.stroke();
    // Inferior iris
    ctx.beginPath();
    ctx.moveTo(lCenter.x - 12 * s, this.centerY + eyeR_Y * 0.75);
    ctx.lineTo(lCenter.x - 6 * s, this.centerY + pupilHalf);
    ctx.stroke();

    // 5. Crystalline lens (Internal biconvex lens)
    ctx.beginPath();
    ctx.ellipse(
      lCenter.x,
      lCenter.y,
      this.lensRadiusX * s,
      this.lensRadiusY * s,
      0, 0, Math.PI * 2
    );
    const lensGrad = ctx.createRadialGradient(
      lCenter.x, lCenter.y, 4 * s,
      lCenter.x, lCenter.y, this.lensRadiusY * s
    );
    lensGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    lensGrad.addColorStop(0.8, 'rgba(14, 116, 144, 0.35)');
    lensGrad.addColorStop(1, 'rgba(8, 47, 73, 0.5)');
    ctx.fillStyle = lensGrad;
    ctx.fill();
    ctx.lineWidth = 2 * s;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.stroke();

    ctx.restore();
  }
}
