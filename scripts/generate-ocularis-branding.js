import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = 'public/branding';
const brandingDir = 'branding';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(brandingDir)) fs.mkdirSync(brandingDir, { recursive: true });

async function generateBranding() {
  console.log('--- Generando Assets de Marca para Ocularis (Visiometric Labs) ---');

  // =========================================================================
  // 1. AVATAR OFICIAL VECTORIAL (1024 x 1024)
  // Ojo biofotónico con iris de refracción, anillo de titanio graduado y haz fotónico
  // =========================================================================
  const avatarSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <!-- Fondo oscuro de cabina clínica con gradiente radial -->
      <radialGradient id="ocBg" cx="50%" cy="50%" r="65%">
        <stop offset="0%" stop-color="#071b33"/>
        <stop offset="45%" stop-color="#040e1f"/>
        <stop offset="80%" stop-color="#030712"/>
        <stop offset="100%" stop-color="#010308"/>
      </radialGradient>

      <!-- Gradiente del bisel exterior de titanio óptico -->
      <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f2fe"/>
        <stop offset="35%" stop-color="#0284c7"/>
        <stop offset="70%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>

      <!-- Gradiente del Iris Biofotónico -->
      <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="18%" stop-color="#67e8f9"/>
        <stop offset="40%" stop-color="#00f2fe"/>
        <stop offset="70%" stop-color="#0284c7"/>
        <stop offset="92%" stop-color="#034875"/>
        <stop offset="100%" stop-color="#021c33"/>
      </radialGradient>

      <!-- Haz de rayos fotónicos convergentes -->
      <linearGradient id="rayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.1"/>
        <stop offset="50%" stop-color="#00f2fe" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95"/>
      </linearGradient>

      <!-- Filtros de resplandor / glow -->
      <filter id="eyeGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="22" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>

      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Base Circular Oscura -->
    <rect width="1024" height="1024" fill="url(#ocBg)"/>

    <!-- Anillos de Calibración Óptica (Grados y dioptrías) -->
    <circle cx="512" cy="512" r="472" fill="none" stroke="url(#rimGrad)" stroke-width="10"/>
    <circle cx="512" cy="512" r="448" fill="none" stroke="#00f2fe" stroke-width="2.5" stroke-opacity="0.4" stroke-dasharray="8 12"/>
    <circle cx="512" cy="512" r="424" fill="#030c1c" stroke="#1e293b" stroke-width="3" stroke-opacity="0.6"/>

    <!-- Marcas de transportador / meridiano de astigmatismo (0° a 180°) -->
    <line x1="90" y1="512" x2="130" y2="512" stroke="#00f2fe" stroke-width="3" opacity="0.6"/>
    <line x1="894" y1="512" x2="934" y2="512" stroke="#00f2fe" stroke-width="3" opacity="0.6"/>
    <line x1="512" y1="90" x2="512" y2="130" stroke="#00f2fe" stroke-width="3" opacity="0.6"/>
    <line x1="512" y1="894" x2="512" y2="934" stroke="#00f2fe" stroke-width="3" opacity="0.6"/>

    <!-- AURA DEL GLOBO OCULAR -->
    <g filter="url(#eyeGlow)" opacity="0.5">
      <path d="M 170 512 C 280 300, 744 300, 854 512 C 744 724, 280 724, 170 512 Z" fill="#00f2fe" opacity="0.25"/>
      <circle cx="512" cy="512" r="190" fill="#0284c7" opacity="0.3"/>
    </g>

    <!-- ESCLERA Y SILUETA OCULAR PRINCIPAL -->
    <path d="M 170 512 C 280 300, 744 300, 854 512 C 744 724, 280 724, 170 512 Z"
          fill="#061224" stroke="url(#rimGrad)" stroke-width="14" stroke-linejoin="round"/>

    <!-- CÓRNEA ANTERIOR ELEVADA (Lente convexa frontal) -->
    <path d="M 320 512 C 320 370, 430 350, 512 350 C 594 350, 704 370, 704 512" fill="none" stroke="#38bdf8" stroke-width="3" stroke-opacity="0.4" stroke-dasharray="6 8"/>

    <!-- RAYOS FOTÓNICOS GUÍA DE REFRACCIÓN -->
    <g opacity="0.75" filter="url(#softGlow)">
      <line x1="160" y1="440" x2="512" y2="512" stroke="url(#rayGrad)" stroke-width="3"/>
      <line x1="140" y1="512" x2="512" y2="512" stroke="url(#rayGrad)" stroke-width="4"/>
      <line x1="160" y1="584" x2="512" y2="512" stroke="url(#rayGrad)" stroke-width="3"/>
    </g>

    <!-- IRIS BIOFOTÓNICO -->
    <circle cx="512" cy="512" r="182" fill="url(#irisGrad)" filter="url(#softGlow)"/>

    <!-- Fibras del Iris (Estructura radial de alta fidelidad) -->
    <g stroke="#ffffff" stroke-opacity="0.22" stroke-width="2">
      <line x1="512" y1="335" x2="512" y2="425"/>
      <line x1="512" y1="599" x2="512" y2="689"/>
      <line x1="335" y1="512" x2="425" y2="512"/>
      <line x1="599" y1="512" x2="689" y2="512"/>
      <line x1="387" y1="387" x2="451" y2="451"/>
      <line x1="637" y1="387" x2="573" y2="451"/>
      <line x1="387" y1="637" x2="451" y2="573"/>
      <line x1="637" y1="637" x2="573" y2="573"/>
    </g>

    <!-- PUPILA CENTRAL PROFUNDA -->
    <circle cx="512" cy="512" r="78" fill="#020617"/>
    <circle cx="512" cy="512" r="78" fill="none" stroke="#00f2fe" stroke-width="2" stroke-opacity="0.5"/>

    <!-- DESTELLOS CORNEALES QUIRÚRGICOS (Reflexión de luz clínica) -->
    <ellipse cx="460" cy="455" rx="34" ry="24" transform="rotate(-25 460 455)" fill="#ffffff" opacity="0.95"/>
    <circle cx="550" cy="545" r="12" fill="#ffffff" opacity="0.6"/>

    <!-- PUNTO FOCAL RETINIANO / FÓVEA -->
    <circle cx="512" cy="512" r="5" fill="#ffffff" filter="url(#softGlow)"/>
  </svg>
  `;

  // Guardar SVG Maestro del Avatar
  fs.writeFileSync(path.join(outDir, 'ocularis-avatar-official.svg'), avatarSvg);
  fs.writeFileSync(path.join(brandingDir, 'ocularis-avatar-official.svg'), avatarSvg);

  // Generar PNGs de alta resolución
  console.log('Generando avatares PNG (1024px y 512px)...');
  await sharp(Buffer.from(avatarSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(outDir, 'ocularis-avatar-1024.png'));
  fs.copyFileSync(path.join(outDir, 'ocularis-avatar-1024.png'), path.join(brandingDir, 'ocularis-avatar-1024.png'));

  await sharp(Buffer.from(avatarSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, 'ocularis-avatar-512.png'));
  fs.copyFileSync(path.join(outDir, 'ocularis-avatar-512.png'), path.join(brandingDir, 'ocularis-avatar-512.png'));

  await sharp(Buffer.from(avatarSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  fs.copyFileSync(path.join(outDir, 'apple-touch-icon.png'), path.join(brandingDir, 'apple-touch-icon.png'));

  await sharp(Buffer.from(avatarSvg))
    .resize(64, 64)
    .png()
    .toFile(path.join(outDir, 'favicon-opt1.png'));
  fs.copyFileSync(path.join(outDir, 'favicon-opt1.png'), path.join(brandingDir, 'favicon-opt1.png'));

  // =========================================================================
  // 2. FAVICON ANIMADO VECTORIAL (SVG)
  // Con efecto sutil de respiración en la pupila y resplandor
  // =========================================================================
  const animatedFaviconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
    <defs>
      <radialGradient id="favIris" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#00f2fe"/>
        <stop offset="65%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#071b33"/>
      </radialGradient>
      <filter id="favGlow">
        <feGaussianBlur stdDeviation="1.8" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <style>
        @keyframes pulseEye {
          0%, 100% { r: 6.5px; opacity: 1; }
          50% { r: 7.8px; opacity: 0.85; }
        }
        @keyframes glowFlicker {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0.55; }
        }
        .pupil-anim { animation: pulseEye 3.6s ease-in-out infinite; }
        .glow-anim { animation: glowFlicker 3.6s ease-in-out infinite; }
      </style>
    </defs>
    <!-- Fondo redondeado oscuro -->
    <rect width="64" height="64" rx="14" fill="#030712"/>
    <rect width="62" height="62" x="1" y="1" rx="13" fill="none" stroke="#00f2fe" stroke-width="1.2" stroke-opacity="0.4"/>

    <!-- Silueta Ocular -->
    <path d="M 6 32 C 16 17, 48 17, 58 32 C 48 47, 16 47, 6 32 Z"
          stroke="#00f2fe" stroke-width="2.5" fill="#040e1f" filter="url(#favGlow)" class="glow-anim"/>

    <!-- Iris -->
    <circle cx="32" cy="32" r="13" fill="url(#favIris)"/>

    <!-- Pupila animada con respiración -->
    <circle cx="32" cy="32" r="6.5" fill="#020617" class="pupil-anim"/>
    <circle cx="32" cy="32" r="6.5" fill="none" stroke="#00f2fe" stroke-width="1" opacity="0.6"/>

    <!-- Destellos corneales -->
    <circle cx="28" cy="27" r="2.2" fill="#ffffff" opacity="0.9"/>
    <circle cx="35" cy="35" r="1.1" fill="#ffffff" opacity="0.5"/>
  </svg>
  `;
  fs.writeFileSync(path.join(outDir, 'favicon-animated.svg'), animatedFaviconSvg);
  fs.writeFileSync(path.join(brandingDir, 'favicon-animated.svg'), animatedFaviconSvg);
  // Reemplazar también el favicon.svg raíz de public
  fs.writeFileSync('public/favicon.svg', animatedFaviconSvg);

  // =========================================================================
  // 3. WHATSAPP LINK PREVIEW & OPEN GRAPH CARD (1200 x 630 px)
  // =========================================================================
  console.log('Generando WhatsApp / Open Graph Link Preview Card (1200x630)...');

  const cardSvg = `
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020712"/>
        <stop offset="50%" stop-color="#051226"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>

      <linearGradient id="titleCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00f2fe"/>
        <stop offset="50%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#60a5fa"/>
      </linearGradient>

      <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>

      <radialGradient id="irisPreview" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="25%" stop-color="#00f2fe"/>
        <stop offset="65%" stop-color="#0284c7"/>
        <stop offset="100%" stop-color="#041b36"/>
      </radialGradient>

      <filter id="cardGlow">
        <feGaussianBlur stdDeviation="16" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <!-- Fondo de cabina médica oscura -->
    <rect width="1200" height="630" fill="url(#cardBg)"/>

    <!-- Retícula sutil tecnológica de fondo -->
    <g stroke="#00f2fe" stroke-opacity="0.05" stroke-width="1">
      <line x1="0" y1="105" x2="1200" y2="105"/>
      <line x1="0" y1="210" x2="1200" y2="210"/>
      <line x1="0" y1="315" x2="1200" y2="315"/>
      <line x1="0" y1="420" x2="1200" y2="420"/>
      <line x1="0" y1="525" x2="1200" y2="525"/>
      <line x1="200" y1="0" x2="200" y2="630"/>
      <line x1="400" y1="0" x2="400" y2="630"/>
      <line x1="600" y1="0" x2="600" y2="630"/>
      <line x1="800" y1="0" x2="800" y2="630"/>
      <line x1="1000" y1="0" x2="1000" y2="630"/>
    </g>

    <!-- Resplandor bioluminiscente en el cuadrante derecho -->
    <circle cx="940" cy="315" r="300" fill="#00f2fe" opacity="0.12" filter="url(#cardGlow)"/>

    <!-- Píldora Superior: Ecosistema Visiometric Labs -->
    <g transform="translate(80, 56)">
      <rect width="230" height="36" rx="18" fill="url(#pillGrad)" stroke="#00f2fe" stroke-width="1.2" stroke-opacity="0.5"/>
      <circle cx="22" cy="18" r="5" fill="#00f2fe"/>
      <text x="38" y="23" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" letter-spacing="1.5">VISIOMETRIC LABS</text>
    </g>

    <!-- Título Principal: OCULARIS -->
    <text x="80" y="172" fill="url(#titleCyan)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="76" font-weight="900" letter-spacing="-1.5">
      OCULARIS
    </text>
    <text x="80" y="210" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="600" letter-spacing="0.5">
      by Visiometric Labs • JayzirTech
    </text>

    <!-- Titular Descriptivo Clínico -->
    <text x="80" y="278" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="800">
      Simulador de Refracción Óptica &amp; Anatomía Ocular
    </text>
    <text x="80" y="318" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500">
      Trazado Fotónico a 60 FPS • Miopía, Hipermetropía, Astigmatismo &amp; Presbicia
    </text>

    <!-- Badges de Capacidades Clínicas -->
    <g transform="translate(80, 375)">
      <!-- Badge 1: Trazado 60 FPS -->
      <rect x="0" y="0" width="195" height="44" rx="12" fill="#0f172a" stroke="#00f2fe" stroke-width="1.5"/>
      <text x="22" y="27" fill="#00f2fe" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">⚡ Trazado Rayos 60 FPS</text>

      <!-- Badge 2: Split-Screen -->
      <rect x="210" y="0" width="220" height="44" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="232" y="27" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">📊 Split-Screen Percepción</text>

      <!-- Badge 3: Anatomía Sagital -->
      <rect x="445" y="0" width="185" height="44" rx="12" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
      <text x="465" y="27" fill="#34d399" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700">👁️ Anatomía Sagital</text>
    </g>

    <!-- Pie Informativo -->
    <text x="80" y="560" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="500">
      Plataforma clínica para explicación diagnóstica en consulta optométrica presencial.
    </text>

    <!-- ILUSTRACIÓN DERECHA: OJO BIOFOTÓNICO 3D CON HAZ LUMINOSO -->
    <g transform="translate(930, 315)">
      <!-- Aros concéntricos de titanio -->
      <circle cx="0" cy="0" r="220" fill="none" stroke="#00f2fe" stroke-width="3" stroke-opacity="0.3" stroke-dasharray="8 10"/>
      <circle cx="0" cy="0" r="195" fill="#061326" stroke="#0284c7" stroke-width="6"/>

      <!-- Rayos de luz convergentes -->
      <line x1="-280" y1="-80" x2="0" y2="0" stroke="#00f2fe" stroke-width="2.5" opacity="0.6"/>
      <line x1="-310" y1="0" x2="0" y2="0" stroke="#ffffff" stroke-width="3.5" opacity="0.9"/>
      <line x1="-280" y1="80" x2="0" y2="0" stroke="#00f2fe" stroke-width="2.5" opacity="0.6"/>

      <!-- Contorno de la esclera -->
      <path d="M -150 0 C -70 -130, 70 -130, 150 0 C 70 130, -70 130, -150 0 Z" fill="#091b36" stroke="#00f2fe" stroke-width="5"/>

      <!-- Iris bioluminiscente -->
      <circle cx="0" cy="0" r="75" fill="url(#irisPreview)"/>
      <circle cx="0" cy="0" r="32" fill="#020617"/>
      <circle cx="0" cy="0" r="32" fill="none" stroke="#00f2fe" stroke-width="1.5" opacity="0.6"/>

      <!-- Destello corneal -->
      <ellipse cx="-18" cy="-18" rx="14" ry="9" transform="rotate(-25 -18 -18)" fill="#ffffff" opacity="0.95"/>
      <circle cx="16" cy="16" r="5" fill="#ffffff" opacity="0.5"/>
    </g>
  </svg>
  `;

  // Guardar SVG de la Tarjeta
  fs.writeFileSync(path.join(outDir, 'ocularis-whatsapp-preview.svg'), cardSvg);
  fs.writeFileSync(path.join(brandingDir, 'ocularis-whatsapp-preview.svg'), cardSvg);

  // Convertir a JPG 1200 x 630 para WhatsApp y Twitter (Open Graph estándar)
  await sharp(Buffer.from(cardSvg))
    .resize(1200, 630)
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(path.join(outDir, 'ocularis-whatsapp-preview.jpg'));
  fs.copyFileSync(path.join(outDir, 'ocularis-whatsapp-preview.jpg'), path.join(brandingDir, 'ocularis-whatsapp-preview.jpg'));

  // También guardar con el nombre estandarizado og-cover-opt1.jpg
  fs.copyFileSync(path.join(outDir, 'ocularis-whatsapp-preview.jpg'), path.join(outDir, 'og-cover-opt1.jpg'));
  fs.copyFileSync(path.join(outDir, 'ocularis-whatsapp-preview.jpg'), path.join(brandingDir, 'og-cover-opt1.jpg'));

  console.log('✅ ¡Assets de marca generados con éxito para Ocularis!');
}

generateBranding().catch(err => {
  console.error('Error generando branding:', err);
  process.exit(1);
});
