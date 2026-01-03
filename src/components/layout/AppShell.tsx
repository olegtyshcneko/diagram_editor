import { CanvasContainer } from '@/components/canvas/CanvasContainer';
import { StatusBar } from './StatusBar';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { PropertyPanel } from '@/components/panels/PropertyPanel';
import { MenuBar } from '@/components/menu';

export function AppShell() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Menu Bar */}
      <MenuBar />

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
