import React, { useState, useEffect, useRef } from 'react';
import { Folder, FileText } from 'lucide-react';

interface FileItemProps {
  item: any;
  isSelected: boolean;
  isRenaming: boolean;
  isCreating?: boolean;
  onClick?: (e: React.MouseEvent, id: string) => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent, item: any) => void;
  onRenameSubmit: (newName: string) => void;
  onRenameCancel: () => void;
}

const FileItem = ({ item, isSelected, isRenaming, isCreating, onClick, onDoubleClick, onContextMenu, onRenameSubmit, onRenameCancel }: FileItemProps) => {
  const [name, setName] = useState(item.name || (item.isFolder ? 'New folder' : 'New Text Document.txt'));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRenameSubmit(name);
    } else if (e.key === 'Escape') {
      onRenameCancel();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && !isRenaming) {
        onClick(e, item.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={(e) => onContextMenu && onContextMenu(e, item)}
      className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer w-32 h-32 text-center
        ${isSelected ? 'bg-blue-200 dark:bg-blue-800 border-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'} border`}
    >
      <div className="text-gray-600 dark:text-gray-300">
        {item.isFolder ? <Folder size={48} /> : <FileText size={48} />}
      </div>
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onRenameSubmit(name)}
          onKeyDown={handleKeyDown}
          onClick={e => e.stopPropagation()}
          className="w-full text-center bg-white dark:bg-gray-800 border border-blue-500 rounded-sm mt-2 p-0.5 text-sm"
        />
      ) : (
        <p className="text-xs mt-2 break-words w-full">
          {item.name}
        </p>
      )}
    </div>
  );
};

export default FileItem;
