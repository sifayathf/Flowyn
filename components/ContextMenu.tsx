
import React, { useEffect, useRef, useState } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: 'star' | 'read' | 'archive' | 'delete' | 'unread') => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: y, left: x });

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleGlobalClick);
    
    // Adjust position if menu goes off-screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      
      let newLeft = x;
      let newTop = y;
      
      if (x + rect.width > winW) newLeft = x - rect.width;
      if (y + rect.height > winH) newTop = y - rect.height;
      
      setPosition({ top: newTop, left: newLeft });
    }

    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, [onClose, x, y]);

  const MenuItem = ({ label, action, color = 'text-zinc-600 dark:text-zinc-300' }: { label: string, action: any, color?: string }) => (
    <button 
      onClick={(e) => { e.stopPropagation(); onAction(action); }}
      className={`w-full text-left px-4 py-2.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-bold uppercase tracking-wider ${color}`}
    >
      {label}
    </button>
  );

  return (
    <div 
      ref={menuRef}
      className="fixed z-[300] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 w-48 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.top, left: position.left }}
    >
      <MenuItem label="Mark as Read" action="read" />
      <MenuItem label="Mark as Unread" action="unread" />
      <MenuItem label="Star Message" action="star" />
      <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1" />
      <MenuItem label="Archive" action="archive" />
      <MenuItem label="Delete Forever" action="delete" color="text-red-500" />
    </div>
  );
};
