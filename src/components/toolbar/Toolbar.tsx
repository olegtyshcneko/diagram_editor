import { MousePointer2, Square, Circle, ArrowRight } from 'lucide-react';
import { useInteractionStore } from '@/stores/interactionStore';
import { ToolButton } from './ToolButton';
import type { Tool } from '@/types/tools';

export function Toolbar() {
  const activeTool = useInteractionStore((s) => s.activeTool);
  const setActiveTool = useInteractionStore((s) => s.setActiveTool);

  const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select', shortcut: 'V' },
    { id: 'rectangle', icon: <Square size={20} />, label: 'Rectangle', shortcut: 'R' },
    { id: 'ellipse', icon: <Circle size={20} />, label: 'Ellipse', shortcut: 'E' },
    { id: 'connection', icon: <ArrowRight size={20} />, label: 'Connection', shortcut: 'C' },
  ];

  return (
    <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-2 gap-1">
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          shortcut={tool.shortcut}
          isActive={activeTool === tool.id}
          onClick={() => setActiveTool(tool.id)}
        />
      ))}
    </aside>
  );
}
