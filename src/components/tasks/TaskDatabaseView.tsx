import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Trash2, Search, MoreHorizontal, ChevronDown, AlignLeft, Calendar, User, ChevronsUpDown,
  CheckCircle, ArrowUpDown, Filter, FileText, Type, Hash, List, CheckSquare, Link as LinkIcon, Paperclip,
  Phone, Mail, ArrowRightLeft, FunctionSquare, MousePointerClick, KeyRound, Clock, UserCircle, ShieldCheck, Star, Edit, Link2, Copy, ArrowRight
} from 'lucide-react';

// --- Firebase Imports (Corrected) ---
// CORRECTED: Timestamp is imported directly from the firebase/firestore SDK
import { Timestamp } from 'firebase/firestore'; 
// Your other firestore functions and db instance are imported from your local config file
import {
  db,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from '../../firebase/firestore';

// --- Dropdown component ---
// A reusable component for dropdown menus, using a portal to avoid z-index issues.
const Dropdown = ({ trigger, children, menuClassName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const handleOpen = (e) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.right + window.scrollX - 380, // Adjusted for menu width
      });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const MenuPortal = () => createPortal(
    <div ref={menuRef} style={position} onClick={(e) => e.stopPropagation()} className={`absolute bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${menuClassName}`}>
      {children}
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} onClick={handleOpen} className="cursor-pointer">
      {trigger}
      {isOpen && <MenuPortal />}
    </div>
  );
};

// --- Row Context Menu Component ---
// A portal-based menu that appears when a user wants more options for a row.
const RowContextMenu = ({ rowId, position, onClose, onDelete }) => {
  const menuRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { label: 'Add to Favorites', icon: <Star size={16} /> },
    { label: 'Edit property', icon: <List size={16} />, hasMore: true },
    { label: 'Copy link', icon: <Copy size={16} /> },
    { label: 'Duplicate', icon: <Copy size={16} />, shortcut: 'Ctrl+D' },
    { label: 'Delete', icon: <Trash2 size={16} />, shortcut: 'Del', action: () => onDelete(rowId) },
  ];
  const filteredItems = menuItems.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

  return createPortal(
    <div
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
      className="absolute bg-white border border-gray-200 rounded-lg shadow-xl z-50 w-80 font-sans"
    >
      <div className="p-3 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search actions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-blue-200 rounded text-sm bg-blue-50 focus:ring-1 focus:ring-blue-400 focus:outline-none focus:bg-white"
        />
      </div>
      <div className="py-2">
        {filteredItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action || onClose}
            className="w-full flex justify-between items-center px-3 py-2 text-left hover:bg-gray-100 text-sm"
          >
            <div className="flex items-center">
              <div className="text-gray-500 mr-3">{item.icon}</div>
              <span className="text-gray-800">{item.label}</span>
            </div>
            {item.shortcut && <span className="text-xs text-gray-400 mr-2">{item.shortcut}</span>}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
};

// --- Editable cell component ---
// Allows cells and headers to be clicked into for editing.
const Editable = ({ value, onSave, children, type = 'text', options = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  const handleSave = () => { onSave(currentValue); setIsEditing(false); };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') { setCurrentValue(value); setIsEditing(false); }
  };

  useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);

  const startEditing = (e) => {
    e.stopPropagation();
    setCurrentValue(value);
    setIsEditing(true);
  };

  if (isEditing) {
    const commonProps = {
      ref: inputRef, value: currentValue, onChange: (e) => setCurrentValue(e.target.value),
      onBlur: handleSave, onKeyDown: handleKeyDown,
      className: "w-full h-full p-0 m-0 border-0 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
    };
    switch (type) {
      case 'date': return <input type="date" {...commonProps} />;
      case 'status': return <select {...commonProps}>{options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>;
      default: return <input type="text" {...commonProps} />;
    }
  }
  return <div onClick={startEditing} onDoubleClick={startEditing} className="w-full h-full cursor-pointer">{children}</div>;
};

// --- Add Property Menu ---
// A rich menu for adding new columns of various types.
const AddPropertyMenu = ({ onAddColumn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const propertyTypes = [
      { name: 'Text', icon: <Type size={18} />, type: 'text' },
      { name: 'Number', icon: <Hash size={18} />, type: 'number' },
      { name: 'Select', icon: <ChevronDown size={18} />, type: 'select' },
      { name: 'Status', icon: <ChevronsUpDown size={18} />, type: 'status' },
      { name: 'Date', icon: <Calendar size={18} />, type: 'date' },
      { name: 'Person', icon: <User size={18} />, type: 'person' },
      { name: 'Files & media', icon: <Paperclip size={18} />, type: 'file' },
      { name: 'Checkbox', icon: <CheckSquare size={18} />, type: 'checkbox' },
      { name: 'URL', icon: <LinkIcon size={18} />, type: 'url' },
    ];

  const filteredProperties = propertyTypes.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="font-sans w-[380px] flex flex-col">
      <div className="p-2 sticky top-0 bg-white z-10 border-b border-gray-100">
        <input type="text" placeholder="Search for a property..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded text-sm bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
        />
      </div>
      <div className="p-1 overflow-y-auto h-[250px]">
        <div className="px-1">
          <h3 className="text-xs text-gray-500 font-semibold px-2 my-2">Property types</h3>
          {filteredProperties.map(p => (
            <button key={p.name} onClick={() => onAddColumn(p.type, p.name)}
              className="flex items-center w-full px-2 py-2 text-left text-sm hover:bg-gray-100 rounded"
            >
              {p.icon}
              <span className="ml-2 font-medium">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


// --- Main TaskDatabaseView component ---
function TaskDatabaseView() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [rowHover, setRowHover] = useState(null);
  // Client-side state for checkbox selections to prevent unnecessary DB writes.
  const [selectedRows, setSelectedRows] = useState(new Set());

  const propertyIcons = {
    text: <FileText size={16} className="text-gray-500" />,
    date: <Calendar size={16} className="text-gray-500" />,
    person: <User size={16} className="text-gray-500" />,
    status: <ChevronsUpDown size={16} className="text-gray-500" />,
    select: <ChevronDown size={16} className="text-gray-500" />,
    number: <Hash size={16} className="text-gray-500" />,
    file: <Paperclip size={16} className="text-gray-500" />,
    checkbox: <CheckSquare size={16} className="text-gray-500" />,
    url: <LinkIcon size={16} className="text-gray-500" />,
  };

  // NEW: Real-time listeners for columns and rows from Firestore.
  useEffect(() => {
    const columnsQuery = query(collection(db, 'taskColumns'), orderBy('createdAt', 'asc'));
    const unsubscribeColumns = onSnapshot(columnsQuery, (snapshot) => {
      setColumns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const rowsQuery = query(collection(db, 'taskRows'), orderBy('createdAt', 'asc'));
    const unsubscribeRows = onSnapshot(rowsQuery, (snapshot) => {
      setRows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeColumns();
      unsubscribeRows();
    };
  }, []);

  // --- Data Mutation Functions (interact with Firebase) ---

  const handleCellChange = async (rowId, colId, value) => {
    await updateDoc(doc(db, 'taskRows', rowId), { [colId]: value });
  };

  const handleHeaderChange = async (colId, newTitle) => {
    await updateDoc(doc(db, 'taskColumns', colId), { title: newTitle });
  };

  const addColumn = async (type, title) => {
    let newColumn = {
      title: title || 'New Property',
      type,
      createdAt: Timestamp.now(),
    };
    if (type === 'status' || type === 'select') {
      newColumn.options = ['Option 1', 'Option 2'];
    }
    await addDoc(collection(db, 'taskColumns'), newColumn);
  };

  const deleteColumn = async (colId) => {
    await deleteDoc(doc(db, 'taskColumns', colId));
    // Note: This only deletes the column definition. Data in rows remains.
  };

  const addRow = async () => {
    const newRowData = { createdAt: Timestamp.now() };
    columns.forEach(col => {
      newRowData[col.id] = ''; // Initialize all fields as empty
    });
    await addDoc(collection(db, 'taskRows'), newRowData);
  };

  const deleteRow = async (rowId) => {
    await deleteDoc(doc(db, 'taskRows', rowId));
    setContextMenu(null);
  };

  // --- UI Event Handlers ---

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? new Set(rows.map(r => r.id)) : new Set());
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(rowId)) newSelection.delete(rowId);
      else newSelection.add(rowId);
      return newSelection;
    });
  };

  const handleContextMenu = (e, rowId) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      rowId,
      position: { x: rect.left - 320, y: rect.bottom + 5 },
    });
  };

  const renderCellDisplay = (row, col) => {
    const value = row[col.id];
    if (col.type === 'status' && value) {
      const colors = { 'Done': 'green', 'In Progress': 'blue', 'To Do': 'gray' };
      const color = colors[value] || 'gray';
      return (
        <div className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800`}>
          <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
          <span>{value}</span>
        </div>
      );
    }
    if (col.type === 'date' && value) {
      // Assuming value is a string 'YYYY-MM-DD'
      const date = new Date(value);
      const correctedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
      return correctedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (col.type === 'checkbox') {
        return <input type="checkbox" readOnly checked={!!value} className="mx-auto block" />;
    }
    return value || <span className="text-gray-400">Empty</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Task Database</h1>
          <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md font-semibold flex items-center text-sm hover:bg-blue-700">New<ChevronDown size={16} className="ml-1" /></button>
        </header>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 w-12 text-center border-b border-gray-200">
                    <input type="checkbox" onChange={handleSelectAll} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  {columns.map(col => (
                    <th key={col.id} className="p-3 border-b border-gray-200 font-semibold text-gray-600 min-w-[200px] group">
                      <div className="flex items-center justify-between">
                        <Editable onSave={(newTitle) => handleHeaderChange(col.id, newTitle)} value={col.title}>
                          <div className="flex items-center space-x-2 py-1">
                            {propertyIcons[col.type] || <FileText size={16} className="text-gray-500" />}
                            <span>{col.title}</span>
                          </div>
                        </Editable>
                        <Dropdown trigger={<button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"><MoreHorizontal size={16} /></button>}>
                          <div className="p-1">
                            <button onClick={() => deleteColumn(col.id)} className="w-full text-left text-sm px-2 py-1.5 text-red-600 hover:bg-gray-100 rounded">Delete property</button>
                          </div>
                        </Dropdown>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 border-b border-gray-200 w-16 text-center">
                    <Dropdown trigger={<button className="p-1.5 rounded-md hover:bg-gray-200" title="Add property"><Plus size={16} /></button>} menuClassName="w-auto">
                      <AddPropertyMenu onAddColumn={addColumn} />
                    </Dropdown>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="group hover:bg-gray-50" onMouseEnter={() => setRowHover(row.id)} onMouseLeave={() => setRowHover(null)}>
                    <td className="p-3 text-center border-b border-gray-200">
                      <input type="checkbox" checked={selectedRows.has(row.id)} onChange={() => handleSelectRow(row.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    </td>
                    {columns.map(col => (
                      <td key={col.id} className="p-3 border-b border-gray-200 text-gray-800">
                        <Editable
                          onSave={(newValue) => handleCellChange(row.id, col.id, newValue)}
                          value={row[col.id]}
                          type={col.type}
                          options={col.options}
                        >
                          {renderCellDisplay(row, col)}
                        </Editable>
                      </td>
                    ))}
                    <td className="p-3 border-b border-gray-200 text-center">
                      <button onClick={(e) => handleContextMenu(e, row.id)}
                        className={`p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-opacity duration-150 ${rowHover === row.id ? 'opacity-100' : 'opacity-0'}`}
                        title="More options">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addRow} className="mt-1 mb-1 ml-3 text-gray-500 flex items-center space-x-2 hover:bg-gray-100 p-2 rounded w-fit text-left font-medium">
            <Plus size={16} />
            <span>New</span>
          </button>
        </div>
      </div>
      {contextMenu && <RowContextMenu {...contextMenu} onDelete={deleteRow} onClose={() => setContextMenu(null)} />}
    </div>
  );
}

export default TaskDatabaseView;