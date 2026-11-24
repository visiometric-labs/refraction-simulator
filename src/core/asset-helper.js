/**
 * Utilidad universal para resolución de assets tanto en Vite (build/dev)
 * como en GitHub Pages sirviendo estáticos directamente desde rama.
 * Estandarizado para Ocularis (Visiometric Labs).
 */
export function getAssetUrl(path) {
  if (!path) return '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // 1. Si Vite inyectó BASE_URL
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
      const base = import.meta.env.BASE_URL.replace(/\/$/, '');
      return `${base}/${cleanPath}`;
    }
  } catch (e) {
    // Entorno sin import.meta
  }

  // 2. Si corre directamente en GitHub Pages en subdirectorios
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.pathname.includes('/refraction-simulator/dev')) {
      return `/refraction-simulator/dev/${cleanPath}`;
    }
    if (window.location.pathname.includes('/refraction-simulator')) {
      return `/refraction-simulator/${cleanPath}`;
    }
  }

  // 3. Fallback relativo local
  return `./${cleanPath}`;
}
