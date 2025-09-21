import React, { useState } from 'react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => void;
}

function CreateFolderModal({ isOpen, onClose, onCreate }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreate(folderName.trim());
      setFolderName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Folder name"
          className="w-full px-3 py-2 border rounded-lg mb-4"
        />
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-primary-600 text-white">Create</button>
        </div>
      </div>
    </div>
  );
}

export default CreateFolderModal;
