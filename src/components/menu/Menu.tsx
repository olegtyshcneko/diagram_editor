import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MenuProps {
  label: string;
  children: React.ReactNode;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function Menu({ label, children, isOpen, onOpen, onClose }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Small delay to avoid closing on same click that opened
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={cn(
          'px-3 py-1 text-sm rounded transition-colors',
          isOpen
            ? 'bg-gray-200 text-gray-900'
            : 'text-gray-700 hover:bg-gray-100'
        )}
        onClick={() => (isOpen ? onClose() : onOpen())}
        onMouseEnter={() => {
          // If another menu is open, open this one on hover
          // This is handled at the MenuBar level
        }}
      >
        {label}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] z-50"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}
