/**
 * Visual representation and mathematical refraction of corrective lenses:
 * - Divergent lens (concave) for Myopia
 * - Convergent lens (convex) for Hyperopia
 * - Toric / cylindrical lens for Astigmatism
 * - Progressive lens (multifocal) for Presbyopia
 */

export class CorrectiveLens {
  constructor(type = 'divergent') {
    this.type = type; // 'divergent' | 'convergent' | 'toric' | 'progressive'
    this.active = false;
    this.opacity = 0; // For smooth fade-in/out transition animation
    this.power = 1.0; // Correction factor (0 = uncorrected, 1 = full correction)
    this.targetSeverity = 0.5; // Target condition severity (0.0 = mild/normal, 1.0 = severe)
    this.currentSeverity = 0.5; // Interpolated severity for fluid thickness animation
  }

  /**
   * Sets condition severity to dynamically scale lens thickness via fluid animation.
   * @param {number} severity 0.0 (minimum) to 1.0 (maximum)
   */
  setSeverity(severity) {
    this.targetSeverity = Math.max(0, Math.min(1, severity));
    this.power = 0.6 + this.targetSeverity * 0.9;
  }

  /**
   * Updates visibility and lens thickness interpolation animation.
   * @param {number} dt 
   */
  update(dt) {
    const targetOpacity = this.active ? 1.0 : 0.0;
    this.opacity += (targetOpacity - this.opacity) * Math.min(1, dt * 6);

    // Real-time smooth interpolated (lerp) animation of lens thickness
    this.currentSeverity += (this.targetSeverity - this.currentSeverity) * Math.min(1, dt * 10);
  }

  /**
   * Draws the corrective lens in front of the cornea, dynamically animating thickness and curvature.
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} x Frame/lens X position
   * @param {number} y Optical center Y position
   * @param {number} scale Eye scale factor
   */
  draw(ctx, x, y, scale) {
    if (this.opacity <= 0.01) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;

    const s = scale;
    const h = 114 * s;
    const sev = this.currentSeverity;

    let edgeWTop = 14 * s;
    let edgeWBottom = 14 * s;
    let centerW = 8 * s;
    let cpXLeft = x;
    let cpXRight = x;

    if (this.type === 'divergent') {
      // Divergent lens (concave for myopia):
      // Thick upper/lower edges and thin optical center with safe separation (no crossing/collisions)
      const edgeW = (14 + sev * 24) * s;
      centerW = Math.max(6 * s, (9.5 - sev * 3.5) * s);
      edgeWTop = edgeW;
      edgeWBottom = edgeW;

      // Quadratic control points so curves pass accurately through center vertices
      cpXLeft = 2 * (x - centerW / 2) - (x - edgeW / 2);
      cpXRight = 2 * (x + centerW / 2) - (x + edgeW / 2);
    } else if (this.type === 'convergent') {
      // Convergent lens (convex for hyperopia):
      // Higher severity makes center visibly thicker/bulging, edges stay thin
      const edgeW = Math.max(4.5 * s, (8.5 - sev * 4) * s);
      centerW = (12 + sev * 26) * s;
      edgeWTop = edgeW;
      edgeWBottom = edgeW;

      cpXLeft = 2 * (x - centerW / 2) - (x - edgeW / 2);
      cpXRight = 2 * (x + centerW / 2) - (x + edgeW / 2);
    } else if (this.type === 'progressive') {
      // Progressive lens (multifocal for presbyopia):
      // Upper distance zone neutral (thin) and lower reading zone convex with addition bulge
      edgeWTop = Math.max(5 * s, (8 - sev * 2) * s);
      edgeWBottom = Math.max(6 * s, (9 + sev * 3) * s);
      centerW = (10 + sev * 18) * s;

      cpXLeft = 2 * (x - centerW / 2) - (x - (edgeWTop + edgeWBottom) / 2);
      cpXRight = 2 * (x + centerW / 2) - (x + (edgeWTop + edgeWBottom) / 2);
    } else {
      // Toric / cylindrical lens (astigmatism):
      // Asymmetric profile with cylindrical bevel thicker with greater meridian asymmetry
      edgeWTop = (13 + sev * 22) * s;
      edgeWBottom = (10 + sev * 15) * s;
      centerW = (7 + sev * 5) * s;

      const avgEdge = (edgeWTop + edgeWBottom) / 2;
      cpXLeft = 2 * (x - centerW / 2) - (x - avgEdge / 2);
      cpXRight = 2 * (x + centerW / 2) - (x + avgEdge / 2);
    }

    // 1. Draw outer lens contour
    ctx.beginPath();
    // Top-left vertex
    ctx.moveTo(x - edgeWTop / 2, y - h / 2);
    // Anterior edge curved toward center
    ctx.quadraticCurveTo(cpXLeft, y, x - edgeWBottom / 2, y + h / 2);
    // Flat / polished bottom edge
    ctx.lineTo(x + edgeWBottom / 2, y + h / 2);
    // Posterior edge curved toward center
    ctx.quadraticCurveTo(cpXRight, y, x + edgeWTop / 2, y - h / 2);
    ctx.closePath();

    // Translucent optical glass fill with anti-reflective coating highlights (AR coating)
    const maxEdge = Math.max(edgeWTop, edgeWBottom, centerW);
    const lensGrad = ctx.createLinearGradient(x - maxEdge, y - h / 2, x + maxEdge, y + h / 2);
    if (this.type === 'convergent') {
      lensGrad.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
      lensGrad.addColorStop(0.3, 'rgba(192, 132, 252, 0.25)');
      lensGrad.addColorStop(0.7, 'rgba(0, 242, 254, 0.2)');
      lensGrad.addColorStop(1, 'rgba(16, 185, 129, 0.35)');
    } else if (this.type === 'progressive') {
      lensGrad.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
      lensGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.25)');
      lensGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.35)');
      lensGrad.addColorStop(1, 'rgba(52, 211, 153, 0.45)');
    } else if (this.type === 'toric') {
      lensGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      lensGrad.addColorStop(0.3, 'rgba(14, 165, 233, 0.25)');
      lensGrad.addColorStop(0.7, 'rgba(0, 242, 254, 0.2)');
      lensGrad.addColorStop(1, 'rgba(52, 211, 153, 0.35)');
    } else {
      lensGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      lensGrad.addColorStop(0.4, 'rgba(0, 242, 254, 0.15)');
      lensGrad.addColorStop(0.8, 'rgba(14, 116, 144, 0.25)');
      lensGrad.addColorStop(1, 'rgba(16, 185, 129, 0.35)');
    }
    ctx.fillStyle = lensGrad;
    ctx.fill();

    // 2. Outer rim and profile with photonic glow
    ctx.lineWidth = Math.max(1.8 * s, 2 * s);
    const strokeColor = this.type === 'convergent' ? '#a855f7' : (this.type === 'progressive' ? '#10b981' : (this.type === 'toric' ? '#38bdf8' : '#00f2fe'));
    const shadowGlow = this.type === 'convergent' ? '#c084fc' : (this.type === 'progressive' ? '#34d399' : '#00f2fe');
    ctx.strokeStyle = strokeColor;
    ctx.shadowColor = shadowGlow;
    ctx.shadowBlur = 8 * s;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Polished facets on thick edges and soft specular reflection
    ctx.save();
    if (this.type === 'divergent') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.moveTo(x - edgeWTop / 2 + 1 * s, y - h / 2);
      ctx.lineTo(x + edgeWTop / 2 - 1 * s, y - h / 2);
      ctx.moveTo(x - edgeWBottom / 2 + 1 * s, y + h / 2);
      ctx.lineTo(x + edgeWBottom / 2 - 1 * s, y + h / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - edgeWTop * 0.36, y - h * 0.44);
      ctx.quadraticCurveTo(x - centerW * 0.4, y - h * 0.28, x - centerW * 0.4, y - h * 0.14);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
    } else if (this.type === 'progressive') {
      // Progressive corridor lines and characteristic optical micro-engraving
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      // Lower addition corridor marker
      ctx.arc(x - centerW * 0.25, y + h * 0.22, 3 * s, 0, Math.PI * 2);
      ctx.arc(x + centerW * 0.25, y + h * 0.22, 3 * s, 0, Math.PI * 2);
      ctx.stroke();

      // Soft reflection in lower reading zone
      ctx.beginPath();
      ctx.moveTo(x - centerW * 0.35, y - h * 0.3);
      ctx.quadraticCurveTo(x - centerW * 0.45, y + h * 0.1, x - centerW * 0.3, y + h * 0.35);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x - centerW * 0.35, y - h * 0.42);
      ctx.quadraticCurveTo(x - centerW * 0.45, y - h * 0.25, x - centerW * 0.45, y - h * 0.12);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2 * s;
      ctx.stroke();
    }
    ctx.restore();

    // 4. Clean identifying lens label
    ctx.shadowBlur = 0;
    ctx.fillStyle = strokeColor;
    ctx.font = `600 ${Math.max(11, 12 * s)}px 'Plus Jakarta Sans', sans-serif`;
    ctx.textAlign = 'center';
    let label = 'Lente Divergente (—)';
    if (this.type === 'convergent') {
      label = 'Lente Convergente (+)';
    } else if (this.type === 'progressive') {
      label = 'Lente Progresiva (Multifocal)';
    } else if (this.type === 'toric') {
      label = 'Lente Cilíndrica / Tórica';
    }
    ctx.fillText(label, x, y - h / 2 - 14 * s);

    ctx.restore();
  }

  /**
   * Modifies ray angle or deflection before striking the cornea
   * @param {number} rayY Relative Y position to eye center
   * @param {number} scale
   * @returns {number} Deflection angle in radians
   */
  getDeflectionAngle(rayY, scale) {
    if (!this.active || this.opacity <= 0.05) return 0;

    const normalizedY = rayY / (100 * scale);
    const effPower = this.power * this.opacity;

    if (this.type === 'divergent') {
      return normalizedY * 0.12 * effPower;
    } else if (this.type === 'convergent') {
      return -normalizedY * 0.13 * effPower;
    } else if (this.type === 'progressive') {
      // Progressive refraction: smooth convergent addition in reading zone and center
      return -normalizedY * 0.14 * effPower;
    } else {
      return normalizedY * 0.08 * effPower;
    }
  }
}
