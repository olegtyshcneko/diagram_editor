import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  isActive: boolean;
  onClick: () => void;
}

export function ToolButton({
  icon,
  label,
  shortcut,
  isActive,
  onClick,
}: ToolButtonProps) {
  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size="icon"
      onClick={onClick}
      title={`${label} (${shortcut})`}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        'w-10 h-10',
        isActive && 'bg-blue-500 text-white hover:bg-blue-600'
      )}
      data-tool={label.toLowerCase()}
    >
      {icon}
    </Button>
  );
}
