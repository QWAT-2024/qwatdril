import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, CheckSquare, Calendar, Type, Link as LinkIcon, Paperclip, ChevronDown } from 'lucide-react';
import { db, doc, setDoc, getDoc } from '../../firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Column {
  id: string;
  title: string;
  type: 'text' | 'date' | 'checkbox' | 'status' | 'file' | 'url';
  options?: string[]; // For status type
}

interface Row {
  [key: string]: any;
}

function TaskDatabaseView() {
  const [columns, setColumns] = useState<Column[]>([{ id: 'taskName', title: 'Task Name', type: 'text' }]);
  const [rows, setRows] = useState<Row[]>([]);
  const [showAddColumnMenu, setShowAddColumnMenu] = useState(false);
  const addColumnMenuRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const taskDocRef = doc(db, 'taskDatabase', 'data');
      const taskDoc = await getDoc(taskDocRef);
      if (taskDoc.exists()) {
        const data = taskDoc.data();
        setColumns(data.columns);
        setRows(data.rows);
      }
    };
    fetchTasks();
  }, []);

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

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const handler = setTimeout(() => {
      saveTasks();
    }, 1000); // Debounce time of 1 second

    return () => {
      clearTimeout(handler);
    };
  }, [columns, rows]);

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
    const storageRef = ref(storage, `taskDatabase/${columnId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    handleCellChange(rowIndex, columnId, { name: file.name, url: downloadURL });
  };

  const renderCell = (col: Column, row: Row, rowIndex: number) => {
    const value = row[col.id];
    switch (col.type) {
      case 'date':
        return <input type="date" value={value || ''} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)} className="bg-transparent w-full" />;
      case 'checkbox':
        return <input type="checkbox" checked={!!value} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.checked)} className="mx-auto block" />;
      case 'status':
        return (
          <select value={value || ''} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)} className="bg-transparent w-full">
            {col.options?.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        );
      case 'file':
        return (
          <div>
            {value ? (
              <a href={value.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{value.name}</a>
            ) : (
              <input type="file" onChange={(e) => e.target.files && handleFileChange(rowIndex, col.id, e.target.files[0])} className="w-full" />
            )}
          </div>
        );
      case 'url':
        return <input type="url" value={value || ''} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)} className="bg-transparent w-full" />;
      default:
        return <input type="text" value={value || ''} onChange={(e) => handleCellChange(rowIndex, col.id, e.target.value)} className="bg-transparent w-full" />;
    }
  };

  const addColumn = (type: Column['type']) => {
    let newColumn: Column = { id: `col-${Date.now()}`, title: 'New Column', type };
    if (type === 'status') {
      newColumn.options = ['To Do', 'In Progress', 'Done'];
    }
    setColumns([...columns, newColumn]);
    setShowAddColumnMenu(false);
  };

  const deleteColumn = (index: number) => {
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };

  const addRow = () => {
    setRows([...rows, {}]);
  };

  const deleteRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const saveTasks = async () => {
    const taskDocRef = doc(db, 'taskDatabase', 'data');
    await setDoc(taskDocRef, { columns, rows });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Database</h1>
      </div>
      <div>
        <table className="w-full text-black dark:text-dark-100">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={col.id} className="p-2 border border-gray-300 dark:border-dark-700 relative group">
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => handleColumnChange(index, e.target.value)}
                    className="bg-transparent w-full text-center font-semibold"
                  />
                  <button onClick={() => deleteColumn(index)} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </th>
              ))}
              <th className="p-2 border border-gray-300 dark:border-dark-700 relative">
                <button onClick={() => setShowAddColumnMenu(!showAddColumnMenu)} className="text-green-500">
                  <Plus />
                </button>
                {showAddColumnMenu && (
                  <div ref={addColumnMenuRef} className="absolute top-full right-0 mt-2 bg-white dark:bg-dark-800 border dark:border-dark-700 rounded-md shadow-lg z-10">
                    <button onClick={() => addColumn('text')} className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"><Type className="mr-2" size={16} /> Text</button>
                    <button onClick={() => addColumn('date')} className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"><Calendar className="mr-2" size={16} /> Date</button>
                    <button onClick={() => addColumn('checkbox')} className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"><CheckSquare className="mr-2" size={16} /> Checkbox</button>
                    <button onClick={() => addColumn('status')} className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"><ChevronDown className="mr-2" size={16} /> Status</button>
                    <button onClick={() => addColumn('file')} className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"><Paperclip className="mr-2" size={16} /> File</button>
                    <button onClick={() => addColumn('url')} className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"><LinkIcon className="mr-2" size={16} /> URL</button>
                  </div>
                )}
              </th>
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
                <td className="p-2 border border-gray-300 dark:border-dark-700 text-center">
                  <button onClick={() => deleteRow(rowIndex)} className="text-red-500 opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow} className="mt-4 text-green-500 flex items-center space-x-2">
          <Plus />
          <span>Add Row</span>
        </button>
      </div>
    </div>
  );
}

export default TaskDatabaseView;
