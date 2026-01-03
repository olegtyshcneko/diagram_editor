import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuItemProps {
  label: string;
  shortcut?: string;
  checked?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function MenuItem({
  label,
  shortcut,
  checked,
  disabled,
  onClick,
}: MenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2',
        disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Check indicator for toggle items */}
      <span className="w-4 flex-shrink-0">
        {checked !== undefined && checked && (
          <Check className="w-4 h-4" />
        )}
      </span>

      <span className="flex-1">{label}</span>

      {shortcut && (
        <span className="text-xs text-gray-400 ml-4">{shortcut}</span>
      )}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="border-t border-gray-200 my-1" />;
}
