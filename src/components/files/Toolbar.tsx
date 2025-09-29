import React, { useState } from 'react';
import { FilePlus, FolderPlus, Scissors, Copy, ClipboardPaste, Trash2, Edit3 } from 'lucide-react';

interface ToolbarProps {
  onNewItem: (type: 'folder' | 'file') => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onRename: () => void;
  canCopy: boolean;
  canCut: boolean;
  canPaste: boolean;
  canDelete: boolean;
  canRename: boolean;
}

const ToolbarButton = ({ children, onClick, disabled, label }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className="flex flex-col items-center px-3 py-1 text-xs text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-transparent"
  >
    {children}
    <span className="mt-1">{label}</span>
  </button>
);


const Toolbar = ({ onNewItem, onCopy, onCut, onPaste, onDelete, onRename, canCopy, canCut, canPaste, canDelete, canRename }: ToolbarProps) => {
    const [showNewDropdown, setShowNewDropdown] = useState(false);

    return (
        <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="relative">
                 <button
                    onClick={() => setShowNewDropdown(!showNewDropdown)}
                    onBlur={() => setTimeout(() => setShowNewDropdown(false), 150)}
                    className="flex items-center px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    <FilePlus className="w-5 h-5 mr-2" />
                    New
                </button>
                {showNewDropdown && (
                     <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-lg z-10">
                        <a href="#" onClick={() => onNewItem('folder')} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"><FolderPlus className="w-4 h-4 mr-2" />New Folder</a>
                        <a href="#" onClick={() => onNewItem('file')} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"><FilePlus className="w-4 h-4 mr-2" />Text Document</a>
                    </div>
                )}
            </div>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

            <ToolbarButton onClick={onCut} disabled={!canCut} label="Cut">
                <Scissors className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={onCopy} disabled={!canCopy} label="Copy">
                <Copy className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={onPaste} disabled={!canPaste} label="Paste">
                <ClipboardPaste className="w-5 h-5" />
            </ToolbarButton>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
            
            <ToolbarButton onClick={onRename} disabled={!canRename} label="Rename">
                <Edit3 className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton onClick={onDelete} disabled={!canDelete} label="Delete">
                <Trash2 className="w-5 h-5 text-red-500" />
            </ToolbarButton>
        </div>
    );
}

export default Toolbar;
