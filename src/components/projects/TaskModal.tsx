import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, CheckSquare, Calendar, Type, Link as LinkIcon, Paperclip, ChevronDown } from 'lucide-react';
import { db, doc, setDoc, getDoc } from '../../firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface TaskModalProps {
  project: any;
  onClose: () => void;
  isSuperuser: boolean;
  currentUser: any;
}

interface Column {
  id: string;
  title: string;
  type: 'text' | 'date' | 'checkbox' | 'status' | 'file' | 'url';
  options?: string[]; // For status type
}

interface Row {
  [key: string]: any;
}

const TaskModal: React.FC<TaskModalProps> = ({ project, onClose, isSuperuser, currentUser }) => {
  const [columns, setColumns] = useState<Column[]>([{ id: 'taskName', title: 'Task Name', type: 'text' }]);
  const [rows, setRows] = useState<Row[]>([]);
  const [showAddColumnMenu, setShowAddColumnMenu] = useState(false);
  const addColumnMenuRef = useRef<HTMLDivElement>(null);
  const canEdit = isSuperuser || project.teamLead === currentUser?.id || currentUser?.role === 'Project Manager';

  useEffect(() => {
    const fetchTasks = async () => {
      const taskDocRef = doc(db, 'projects', project.id, 'tasks', 'data');
      const taskDoc = await getDoc(taskDocRef);
      if (taskDoc.exists()) {
        const data = taskDoc.data();
        setColumns(data.columns);
        setRows(data.rows);
      }
    };
    fetchTasks();
  }, [project.id, canEdit]); // Added canEdit dependency

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addColumnMenuRef.current && !addColumnMenuRef.current.contains(event.target as Node)) {
        setShowAddColumnMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [addColumnMenuRef]);

  const handleColumnChange = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index].title = value;
    setColumns(newColumns);
  };

  const handleCellChange = (rowIndex: number, columnId: string, value: any) => {
    const newRows = [...rows];
    newRows[rowIndex][columnId] = value;
    setRows(newRows);
  };

  const handleFileChange = async (rowIndex: number, columnId: string, file: File) => {
    if (!file) return;
    const storage = getStorage();
    const storageRef = ref(storage, `projects/${project.id}/${columnId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    handleCellChange(rowIndex, columnId, { name: file.name, url: downloadURL });
  };

  const renderCell = (col: Column, row: Row, rowIndex: number) => {
    const value = row[col.id];
    switch (col.type) {
      case 'date':
        return <input type="date" value={value || ''} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)} className="bg-transparent w-full" disabled={!canEdit} />;
      case 'checkbox':
        return <input type="checkbox" checked={!!value} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.checked)} className="mx-auto block" disabled={!canEdit} />;
      case 'status':
        return (
          <select value={value || ''} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)} className="bg-transparent w-full" disabled={!canEdit}>
            {col.options?.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        );
      case 'file':
        return (
          <div>
            {value ? (
              <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{value.name}</a>
            ) : (
              <input type="file" onChange={(e) => e.target.files && handleFileChange(rowIndex, col.id, e.target.files[0])} className="w-full" disabled={!canEdit} />
            )}
          </div>
        );
      case 'url':
        return <input type="url" value={value || ''} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)} className="bg-transparent w-full" disabled={!canEdit} />;
      default:
        return <input type="text" value={value || ''} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)} className="bg-transparent w-full" disabled={!canEdit} />;
    }
  };

  const addColumn = (type: Column['type']) => {
    if (!canEdit) return;
    let newColumn: Column = { id: `col-${Date.now()}`, title: 'New Column', type };
    if (type === 'status') {
      newColumn.options = ['To Do', 'In Progress', 'Done'];
    }
    setColumns([...columns, newColumn]);
    setShowAddColumnMenu(false);
  };

  const deleteColumn = (index: number) => {
    if (!canEdit) return;
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };

  const addRow = () => {
    if (!canEdit) return;
    setRows([...rows, {}]);
  };

  const deleteRow = (index: number) => {
    if (!canEdit) return;
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const saveTasks = async () => {
    const taskDocRef = doc(db, 'projects', project.id, 'tasks', 'data');
    await setDoc(taskDocRef, { columns, rows });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-primary-700/30 rounded-xl max-w-4xl w-full h-5/6 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-primary-900/50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black dark:text-dark-50">Tasks for {project.name}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-dark-400 hover:text-black dark:hover:text-dark-100">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 p-6">
          <table className="w-full text-black dark:text-dark-100">
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={col.id} className="p-2 border border-gray-300 dark:border-dark-700 relative group">
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => handleColumnChange(index, e.target.value)}
                      className="bg-transparent w-full text-center font-semibold disabled:cursor-not-allowed"
                      disabled={!canEdit}
                    />
                    {canEdit && (
                      <button onClick={() => deleteColumn(index)} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </th>
                ))}
                {canEdit && (
                  <th className="p-2 border border-gray-300 dark:border-dark-700 relative">
                    <button onClick={() => setShowAddColumnMenu(!showAddColumnMenu)} className="text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300">
                      <Plus />
                    </button>
                    {showAddColumnMenu && (
                      <div ref={addColumnMenuRef} className="absolute top-full right-0 mt-2 bg-white dark:bg-dark-800 border dark:border-dark-700 rounded-md shadow-lg z-10">
                        <button onClick={() => addColumn('text')} className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-700"><Type className="mr-2" size={16} /> Text</button>
                        <button onClick={() => addColumn('date')} className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-700"><Calendar className="mr-2" size={16} /> Date</button>
                        <button onClick={() => addColumn('checkbox')} className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-700"><CheckSquare className="mr-2" size={16} /> Checkbox</button>
                        <button onClick={() => addColumn('status')} className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-700"><ChevronDown className="mr-2" size={16} /> Status</button>
                        <button onClick={() => addColumn('file')} className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-700"><Paperclip className="mr-2" size={16} /> File</button>
                        <button onClick={() => addColumn('url')} className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-700"><LinkIcon className="mr-2" size={16} /> URL</button>
                      </div>
                    )}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group">
                  {columns.map(col => (
                    <td key={col.id} className="p-2 border border-gray-300 dark:border-dark-700">
                      {renderCell(col, row, rowIndex)}
                    </td>
                  ))}
                  {canEdit && (
                    <td className="p-2 border border-gray-300 dark:border-dark-700 text-center">
                      <button onClick={() => deleteRow(rowIndex)} className="text-red-500 opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {canEdit && (
            <button onClick={addRow} className="mt-4 text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 flex items-center space-x-2">
              <Plus />
              <span>Add Row</span>
            </button>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-primary-900/50 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-black dark:text-dark-100 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors duration-200">
            Cancel
          </button>
          {canEdit && (
            <button onClick={saveTasks} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
              Save and Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
