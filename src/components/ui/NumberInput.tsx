import * as React from 'react';
import { cn } from '@/lib/utils';

export interface NumberInputProps {
  value: number | 'mixed';
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  disabled?: boolean;
}

export function NumberInput({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  suffix,
  className,
  disabled = false,
}: NumberInputProps) {
  const [localValue, setLocalValue] = React.useState<string>('');
  const [isEditing, setIsEditing] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync local value with prop when not editing
  React.useEffect(() => {
    if (!isEditing) {
      setLocalValue(value === 'mixed' ? '' : String(value));
    }
  }, [value, isEditing]);

  const clamp = (n: number): number => {
    return Math.max(min, Math.min(max, n));
  };

  const parseAndClamp = (str: string): number | null => {
    const parsed = parseFloat(str);
    if (isNaN(parsed)) return null;
    return clamp(parsed);
  };

  const handleFocus = () => {
    setIsEditing(true);
    // Select all text on focus for easy replacement
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseAndClamp(localValue);
    if (parsed !== null) {
      onChange(parsed);
      setLocalValue(String(parsed));
    } else {
      // Reset to current value if invalid
      setLocalValue(value === 'mixed' ? '' : String(value));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      return;
    }

    if (e.key === 'Escape') {
      setLocalValue(value === 'mixed' ? '' : String(value));
      e.currentTarget.blur();
      return;
    }

    // Arrow key increment/decrement
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentValue = value === 'mixed' ? 0 : value;
      const multiplier = e.shiftKey ? 10 : 1;
      const delta = e.key === 'ArrowUp' ? step * multiplier : -step * multiplier;
      const newValue = clamp(currentValue + delta);
      onChange(newValue);
      setLocalValue(String(newValue));
    }
  };

  const displayValue = isEditing ? localValue : (value === 'mixed' ? '' : String(value));
  const placeholder = value === 'mixed' ? 'Mixed' : undefined;

  return (
    <div className={cn('relative flex items-center', className)}>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={displayValue}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm transition-colors',
          'placeholder:text-muted-foreground placeholder:italic',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          suffix && 'pr-8'
        )}
      />
      {suffix && (
        <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}
