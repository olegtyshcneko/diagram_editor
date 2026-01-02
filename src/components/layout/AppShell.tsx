import { CanvasContainer } from '@/components/canvas/CanvasContainer';
import { StatusBar } from './StatusBar';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { PropertyPanel } from '@/components/panels/PropertyPanel';

export function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Menu Bar */}
      <header className="h-10 bg-white border-b border-gray-200 flex items-center px-4">
        <span className="font-semibold text-gray-800">Naive Draw.io</span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar / Shape Panel */}
        <Toolbar />

        {/* Canvas Area */}
        <main className="flex-1 bg-gray-50 relative overflow-hidden">
          <CanvasContainer />
        </main>

        {/* Property Panel */}
        <PropertyPanel />
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
