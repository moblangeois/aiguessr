/**
 * ScreenShell - Wrapper standard pour les écrans h-screen sans scroll.
 * Fournit un layout flex-col avec header, contenu, et footer optionnels.
 */
export function ScreenShell({ children, className = '' }) {
  return (
    <div className={`h-screen flex flex-col bg-surface-0 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/**
 * ScreenHeader - Zone fixe en haut de l'écran.
 */
export function ScreenHeader({ children, className = '' }) {
  return (
    <div className={`flex-shrink-0 bg-surface-1 border-b border-border p-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * ScreenContent - Zone principale qui prend tout l'espace restant.
 */
export function ScreenContent({ children, className = '' }) {
  return (
    <div className={`flex-1 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/**
 * ScreenFooter - Zone fixe en bas de l'écran.
 */
export function ScreenFooter({ children, className = '' }) {
  return (
    <div className={`flex-shrink-0 bg-surface-1 border-t border-border p-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * ScreenCenter - Écran centré (pour ConfigScreen, PlayerJoinScreen, etc.)
 */
export function ScreenCenter({ children, className = '' }) {
  return (
    <div className={`h-screen flex items-center justify-center bg-surface-0 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
