import React, { useState, useEffect } from 'react';

interface TextEditorModalProps {
  file: any;
  onClose: () => void;
  onSave: (content: string) => void;
}

const TextEditorModal = ({ file, onClose, onSave }: TextEditorModalProps) => {
  const [content, setContent] = useState(file.content || '');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave(content);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, onSave, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-3/4 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{file.name} - Text Editor</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-grow w-full p-4 bg-transparent resize-none focus:outline-none font-mono"
          placeholder="Start typing..."
        />
        <div className="p-4 border-t dark:border-gray-700 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button onClick={() => onSave(content)} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
            Save (Ctrl+S)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditorModal;
