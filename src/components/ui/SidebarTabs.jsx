import { useState } from 'react';

/**
 * SidebarTabs - Sidebar avec onglets pour éviter le scroll.
 * Chaque onglet contient un panneau de contenu.
 *
 * Props:
 *  - tabs: [{ key: string, label: string, icon?: ReactNode, content: ReactNode }]
 *  - defaultTab?: string (key de l'onglet par défaut)
 *  - width?: string (classe Tailwind, ex: 'w-80')
 */
export function SidebarTabs({ tabs, defaultTab, width = 'w-80' }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key);

  const activeContent = tabs.find(t => t.key === activeTab)?.content;

  return (
    <div className={`${width} bg-surface-1 border-l border-border flex flex-col overflow-hidden`}>
      {/* Onglets */}
      <div className="flex-shrink-0 flex border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-caption font-semibold transition-all ${
              activeTab === tab.key
                ? 'text-accent border-b-2 border-accent bg-accent-light/50'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-2'
            }`}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeContent}
      </div>
    </div>
  );
}
