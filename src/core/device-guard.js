/**
 * Device detection (Mobile Gate) and Fullscreen API wrappers.
 */

/**
 * Returns true if current device is a smartphone/mobile
 * (screen width < 768px or mobile userAgent).
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;

  const isSmallScreen = window.innerWidth < 768;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTabletUA = /ipad|tablet|playbook|silk/i.test(userAgent) || (navigator.maxTouchPoints > 1 && window.innerWidth >= 768);

  // If tablet with large screen, allowed
  if (isTabletUA && window.innerWidth >= 768) {
    return false;
  }

  return isSmallScreen || (isMobileUA && !isTabletUA);
}

/**
 * Requests cross-browser fullscreen mode.
 * Must be invoked inside a user gesture event (click/tap).
 */
export async function requestFullscreen() {
  const docEl = document.documentElement;
  try {
    if (docEl.requestFullscreen) {
      await docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      await docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
      await docEl.msRequestFullscreen();
    }
  } catch (err) {
    console.warn('[DeviceGuard] Could not activate fullscreen:', err);
  }
}

/**
 * Exits fullscreen mode.
 */
export async function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      await document.msExitFullscreen();
    }
  } catch (err) {
    console.warn('[DeviceGuard] Error exiting fullscreen:', err);
  }
}

/**
 * Returns true if fullscreen is currently active.
 */
export function isFullscreenActive() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Toggles fullscreen mode between active and inactive.
 */
export async function toggleFullscreen() {
  if (isFullscreenActive()) {
    await exitFullscreen();
  } else {
    await requestFullscreen();
  }
}
