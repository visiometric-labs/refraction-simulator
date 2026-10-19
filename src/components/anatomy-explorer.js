import { EyeGeometry } from '../simulation/eye-model.js';
import { events } from '../core/events.js';

export class AnatomyExplorerScene {
  constructor() {
    this.geometry = new EyeGeometry();
    this.time = 0;
    this.selectedStructureIndex = -1; // -1 means nothing is selected initially
    this.pillsLayerEl = null;

    this.structures = [
      {
        id: 'cornea',
        title: '1. Córnea',
        name: 'Córnea',
        shortDesc: 'Potente lente frontal (~43 D)',
        fullDesc: 'Es la superficie transparente exterior del ojo. Realiza más del 70% del poder refractivo total, haciendo converger los rayos de luz entrantes hacia la pupila.',
        relX: -175,
        relY: -65,
        targetX: -140,
        targetY: -20,
        tooltipPos: 'top'
      },
      {
        id: 'anterior-chamber',
        title: '2. Cámara Anterior',
        name: 'Cámara Anterior',
        shortDesc: 'Espacio con humor acuoso nutritivo',
        fullDesc: 'Cavidad llena de líquido ultra-transparente que mantiene la presión intraocular y nutre a la córnea y al cristalino.',
        relX: -115,
        relY: 90,
        targetX: -95,
        targetY: 25,
        tooltipPos: 'bottom'
      },
      {
        id: 'lens',
        title: '3. Cristalino',
        name: 'Cristalino',
        shortDesc: 'Lente interna de enfoque dinámico',
        fullDesc: 'Lente bi-convexa flexible. Mediante la acomodación muscular, modifica su curvatura para afinar el enfoque a cualquier distancia.',
        relX: -30,
        relY: -148, // Adjusted downward for balanced aesthetics
        targetX: -60,
        targetY: -45,
        tooltipPos: 'top' // Tooltip opens upward to avoid covering lower structures
      },
      {
        id: 'vitreous',
        title: '4. Humor Vítreo',
        name: 'Humor Vítreo',
        shortDesc: 'Gel que mantiene la forma esférica',
        fullDesc: 'Gel transparente que ocupa el 80% del volumen ocular, manteniendo la retina extendida y una trayectoria libre para la luz.',
        relX: 75,
        relY: 105,
        targetX: 50,
        targetY: 30,
        tooltipPos: 'bottom'
      },
      {
        id: 'retina',
        title: '5. Retina & Fóvea',
        name: 'Retina & Fóvea',
        shortDesc: 'Pantalla sensorial fotorreceptora',
        fullDesc: 'Capa fotosensible del fondo ocular. La fóvea central es el área de máxima nitidez visual donde deben confluir todos los haces de luz.',
        relX: 220,
        relY: -10,
        targetX: 195,
        targetY: 0,
        tooltipPos: 'top'
      }
    ];
  }

  onEnter(width, height) {
    this.geometry.updateLayout(width, height);
    this.selectedStructureIndex = -1; // Start with no selection
    this.pillsLayerEl = document.getElementById('anatomy-pills-layer');
    if (this.pillsLayerEl) {
      this.pillsLayerEl.style.display = 'block';
      this.renderPins();

      // Clicking on free background deselects
      this.pillsLayerEl.onclick = (e) => {
        if (e.target === this.pillsLayerEl) {
          this.selectStructure(-1);
        }
      };
    }
    this.updateCardContent(null);
  }

  onExit() {
    if (this.pillsLayerEl) {
      this.pillsLayerEl.style.display = 'none';
      this.pillsLayerEl.innerHTML = '';
      this.pillsLayerEl.onclick = null;
    }
  }

  onResize(width, height) {
    this.geometry.updateLayout(width, height);
    this.renderPins();
  }

  onMouseDown(x, y) {
    // Clicking on canvas outside pins deselects
    this.selectStructure(-1);
  }

  renderPins() {
    if (!this.pillsLayerEl) return;
    this.pillsLayerEl.innerHTML = '';

    const s = this.geometry.scale;
    const cx = this.geometry.centerX;
    const cy = this.geometry.centerY;

    this.structures.forEach((st, idx) => {
      const pinX = cx + st.relX * s;
      const pinY = cy + st.relY * s;

      const pinEl = document.createElement('div');
      pinEl.className = `anatomy-pin ${idx === this.selectedStructureIndex ? 'active' : ''} tooltip-${st.tooltipPos || 'bottom'}`;
      pinEl.style.left = `${pinX}px`;
      pinEl.style.top = `${pinY}px`;
      pinEl.style.animationDelay = `${0.35 + idx * 0.08}s`;
      pinEl.innerHTML = `
        <div class="pin-badge">
          <span class="pin-num">${idx + 1}</span>
          <span class="pin-name">${st.name}</span>
        </div>
        <div class="pin-tooltip">
          <span>${st.shortDesc}</span>
        </div>
      `;

      pinEl.addEventListener('click', (e) => {
        e.stopPropagation();
        // If already selected, clicking again deselects
        if (this.selectedStructureIndex === idx) {
          this.selectStructure(-1);
        } else {
          this.selectStructure(idx);
        }
      });

      this.pillsLayerEl.appendChild(pinEl);
    });
  }

  selectStructure(idx) {
    this.selectedStructureIndex = idx;
    const pins = this.pillsLayerEl?.querySelectorAll('.anatomy-pin');
    pins?.forEach((p, i) => {
      p.classList.toggle('active', i === idx);
    });

    if (idx >= 0 && idx < this.structures.length) {
      this.updateCardContent(this.structures[idx]);
    } else {
      this.updateCardContent(null);
    }
  }

  updateCardContent(st) {
    const titleEl = document.getElementById('card-title');
    const descEl = document.getElementById('card-desc');
    const kickerEl = document.getElementById('card-kicker');
    const controlsEl = document.getElementById('card-controls');

    if (kickerEl) kickerEl.textContent = 'EXPLORACIÓN ANATÓMICA';

    if (st) {
      // Selected element
      if (titleEl) titleEl.textContent = st.title;
      if (descEl) descEl.textContent = `${st.fullDesc}`;
    } else {
      // No element selected (general overview)
      if (titleEl) titleEl.textContent = 'Corte Sagital del Ojo';
      if (descEl) {
        descEl.textContent = 'Toca o haz clic sobre cualquiera de las estructuras señaladas en el ojo (Córnea, Cámara Anterior, Cristalino, Humor Vítreo o Retina) para conocer su función anatómica y su papel en el enfoque de la luz.';
      }
    }

    // Selector buttons removed per user requirement
    if (controlsEl) {
      controlsEl.innerHTML = '';
    }
  }

  update(dt) {
    this.time += dt;
  }

  draw(ctx, width, height) {
    // 1. Draw base sagittal section
    this.geometry.drawSagittal(ctx, {
      retinaColor: '#00f2fe',
      retinaGlow: 'rgba(0, 242, 254, 0.4)'
    });

    const s = this.geometry.scale;
    const cx = this.geometry.centerX;
    const cy = this.geometry.centerY;
    const cApex = this.geometry.corneaApex;
    const lCenter = this.geometry.lensCenter;
    const rApex = this.geometry.retinaApex;

    // 2. Subtle connector lines from badges to anatomical structures
    ctx.save();
    for (let idx = 0; idx < this.structures.length; idx++) {
      const st = this.structures[idx];
      const pinX = cx + st.relX * s;
      const pinY = cy + st.relY * s;
      const targetX = cx + st.targetX * s;
      const targetY = cy + st.targetY * s;
      const isActive = idx === this.selectedStructureIndex;

      ctx.beginPath();
      ctx.moveTo(pinX, pinY);
      ctx.lineTo(targetX, targetY);
      ctx.setLineDash([3 * s, 3 * s]);
      ctx.lineWidth = (isActive ? 1.8 : 1) * s;
      ctx.strokeStyle = isActive ? '#00f2fe' : 'rgba(56, 189, 248, 0.28)';
      ctx.stroke();

      // Target dot over anatomical structure
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(targetX, targetY, (isActive ? 4 : 2.5) * s, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? '#00f2fe' : 'rgba(56, 189, 248, 0.6)';
      if (isActive) {
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 8 * s;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // 3. Trace educational light beams entering the eye
    ctx.save();
    const rayOffsets = [-45, -25, 0, 25, 45];
    ctx.lineWidth = 1.8 * s;
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 8 * s;

    for (const offset of rayOffsets) {
      const startX = cApex.x - 220 * s;
      const startY = cy + offset * s;

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      const corneaHitX = cApex.x + 8 * s;
      const corneaHitY = startY * 0.96 + cy * 0.04;
      ctx.lineTo(corneaHitX, corneaHitY);

      const lensHitX = lCenter.x;
      const lensHitY = startY * 0.75 + cy * 0.25;
      ctx.lineTo(lensHitX, lensHitY);

      ctx.lineTo(rApex.x, cy);
      ctx.stroke();
    }
    ctx.restore();
  }
}
