import type { ReactNode } from 'react';

interface AppShellProps {
  children?: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Menu Bar */}
      <header className="h-10 bg-white border-b border-gray-200 flex items-center px-4">
        <span className="font-semibold text-gray-800">Naive Draw.io</span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar / Shape Panel */}
        <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-2">
          <div className="w-10 h-10 bg-gray-200 rounded mb-2" title="Select Tool" />
          <div className="w-10 h-10 bg-gray-200 rounded mb-2" title="Rectangle" />
          <div className="w-10 h-10 bg-gray-200 rounded mb-2" title="Ellipse" />
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 bg-gray-50 relative overflow-hidden">
          {children || (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Canvas will be implemented in Phase 1
            </div>
          )}
        </main>

        {/* Property Panel */}
        <aside className="w-64 bg-white border-l border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-4">Properties</h2>
          <p className="text-sm text-gray-500">
            Select an element to view its properties
          </p>
        </aside>
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-white border-t border-gray-200 flex items-center px-4 text-xs text-gray-500">
        <span>Zoom: 100%</span>
        <span className="mx-4">|</span>
        <span>Position: 0, 0</span>
      </footer>
    </div>
  );
}
