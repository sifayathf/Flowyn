
import React, { useEffect } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: 'star' | 'read' | 'archive' | 'delete') => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAction }) => {
  useEffect(() => {
    const handleGlobalClick = () => onClose();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [onClose]);

  return (
    <div 
      className="fixed z-[200] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl py-1 w-44 animate-in fade-in zoom-in-95 duration-100"
      style={{ top: y, left: x }}
    >
      <button onClick={() => onAction('read')} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300">Mark as Read</button>
      <button onClick={() => onAction('star')} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300">Toggle Star</button>
      <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1" />
      <button onClick={() => onAction('archive')} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300">Archive</button>
      <button onClick={() => onAction('delete')} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-red-500">Delete Message</button>
    </div>
  );
};
