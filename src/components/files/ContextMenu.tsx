import React, { useEffect, useRef } from 'react';
import { Scissors, Copy, ClipboardPaste, Trash2, Edit3 } from 'lucide-react';

const ContextMenuItem = ({ children, onClick, disabled }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
    >
        {children}
    </button>
);

const ContextMenu = ({ x, y, onClose, actions, canPaste }: any) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            style={{ top: y, left: x }}
            className="absolute w-48 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-lg z-50"
        >
            <ContextMenuItem onClick={actions.onCut}><Scissors className="w-4 h-4 mr-2" />Cut</ContextMenuItem>
            <ContextMenuItem onClick={actions.onCopy}><Copy className="w-4 h-4 mr-2" />Copy</ContextMenuItem>
            <ContextMenuItem onClick={actions.onPaste} disabled={!canPaste}><ClipboardPaste className="w-4 h-4 mr-2" />Paste</ContextMenuItem>
            <div className="h-px w-full bg-gray-200 dark:bg-gray-600 my-1"></div>
            <ContextMenuItem onClick={actions.onRename}><Edit3 className="w-4 h-4 mr-2" />Rename</ContextMenuItem>
            <ContextMenuItem onClick={actions.onDelete}><Trash2 className="w-4 h-4 mr-2 text-red-500" />Delete</ContextMenuItem>
        </div>
    );
}

export default ContextMenu;
