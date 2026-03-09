import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../i18n/I18nContext';
import { useFullscreen } from '../../hooks/useFullscreen';

/**
 * TopBar - Barre flottante en haut à droite avec :
 *  - Toggle langue FR/EN
 *  - Toggle thème clair/sombre
 *  - Toggle fullscreen
 */
export function TopBar() {
  const { isDark, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useTranslation();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const btnClass = "w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all rounded-lg";

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center bg-surface-1/90 backdrop-blur-sm border border-border rounded-xl shadow-sm overflow-hidden divide-x divide-border">
      {/* Toggle langue */}
      <button
        onClick={toggleLocale}
        className="px-3 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all"
        title={locale === 'fr' ? 'Switch to English' : 'Passer en français'}
      >
        {locale === 'fr' ? 'EN' : 'FR'}
      </button>

      {/* Toggle thème */}
      <button
        onClick={toggleTheme}
        className={btnClass}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Toggle fullscreen */}
      <button
        onClick={toggleFullscreen}
        className={btnClass}
        title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
      >
        {isFullscreen ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v4m0-4h4m7 5l5-5m0 0v4m0-4h-4m-7 10l-5 5m0 0v-4m0 4h4m7-5l5 5m0 0v-4m0 4h-4" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        )}
      </button>
    </div>
  );
}
