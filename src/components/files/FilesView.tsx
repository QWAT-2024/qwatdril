import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Trash2, Search, MoreHorizontal, ChevronDown, AlignLeft, Calendar, User, ChevronsUpDown,
  CheckCircle, ArrowUpDown, Filter, FileText, Type, Hash, List, CheckSquare, Link as LinkIcon, Paperclip,
  Phone, Mail, ArrowRightLeft, FunctionSquare, MousePointerClick, KeyRound, Clock, UserCircle, ShieldCheck, Star, Edit, Link2, Copy, ArrowRight
} from 'lucide-react';
// --- Firebase Imports ---
// Ensure you have a firebase config file at this path that exports the 'db' instance.
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
} from '../../firebase/firestore'; // MODIFIED: Added Firebase imports

// --- Dropdown component (No changes) ---
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
        left: rect.right + window.scrollX - 380,
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

// --- Row Context Menu Component (No changes) ---
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
    { label: 'Edit icon', icon: <Edit size={16} /> },
    { label: 'Edit property', icon: <List size={16} />, hasMore: true },
    { label: 'Open in', icon: <Link2 size={16} />, hasMore: true },
    { label: 'Copy link', icon: <Copy size={16} /> },
    { label: 'Duplicate', icon: <Copy size={16} />, shortcut: 'Ctrl+D' },
    { label: 'Move to', icon: <ArrowRight size={16} />, shortcut: 'Ctrl+Shift+P' },
    { label: 'Delete', icon: <Trash2 size={16} />, shortcut: 'Del', action: () => onDelete(rowId) },
    { label: 'Comment', icon: <FileText size={16} />, shortcut: 'Ctrl+Shift+M' },
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
        <div className="px-3 py-1">
          <div className="text-xs text-gray-500 font-medium">Page</div>
        </div>
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
            <div className="flex items-center">
              {item.shortcut && <span className="text-xs text-gray-400 mr-2">{item.shortcut}</span>}
              {item.hasMore && <ChevronDown size={16} className="text-gray-400 transform -rotate-90" />}
            </div>
          </button>
        ))}
        <div className="border-t border-gray-100 mt-2 pt-2 px-3">
          <div className="text-xs text-gray-500">Last edited by Muthukumar</div>
          <div className="text-xs text-gray-500">Today at 7:47 PM</div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- Editable cell (No changes) ---
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

// --- Add Property Menu (No changes) ---
const AddPropertyMenu = ({ onAddColumn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const allProperties = {
    suggested: [
      { name: 'Priority Level', icon: <ShieldCheck size={18} />, type: 'select' },
      { name: 'Estimated Time', icon: <Hash size={18} />, type: 'number' },
      { name: 'Attachments', icon: <Paperclip size={18} />, type: 'file' },
      { name: 'Tags', icon: <List size={18} />, type: 'multi-select' },
    ],
    types: [
      { name: 'Text', icon: <Type size={18} />, type: 'text' },
      { name: 'Number', icon: <Hash size={18} />, type: 'number' },
      { name: 'Select', icon: <ChevronDown size={18} />, type: 'select' },
      { name: 'Multi-select', icon: <List size={18} />, type: 'multi-select' },
      { name: 'Status', icon: <ChevronsUpDown size={18} />, type: 'status' },
      { name: 'Date', icon: <Calendar size={18} />, type: 'date' },
      { name: 'Person', icon: <User size={18} />, type: 'person' },
      { name: 'Files & media', icon: <Paperclip size={18} />, type: 'file' },
      { name: 'Checkbox', icon: <CheckSquare size={18} />, type: 'checkbox' },
      { name: 'URL', icon: <LinkIcon size={18} />, type: 'url' },
      { name: 'Phone', icon: <Phone size={18} />, type: 'phone' },
      { name: 'Email', icon: <Mail size={18} />, type: 'email' },
      { divider: true },
      { name: 'Relation', icon: <ArrowRightLeft size={18} />, type: 'relation' },
      { name: 'Rollup', icon: <Search size={18} />, type: 'rollup' },
      { name: 'Formula', icon: <FunctionSquare size={18} />, type: 'formula' },
      { name: 'Button', icon: <MousePointerClick size={18} />, type: 'button' },
      { name: 'ID', icon: <KeyRound size={18} />, type: 'id' },
      { divider: true },
      { name: 'Created time', icon: <Clock size={18} />, type: 'created-time' },
      { name: 'Last edited time', icon: <Clock size={18} />, type: 'last-edited-time' },
      { name: 'Created by', icon: <UserCircle size={18} />, type: 'created-by' },
      { name: 'Last edited by', icon: <UserCircle size={18} />, type: 'last-edited-by' },
    ]
  };
  const filterProperties = (props) => props.filter(p => !p.divider && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredSuggested = filterProperties(allProperties.suggested);
  return (
    <>
      <style>{`.custom-scrollbar::-webkit-scrollbar{width:8px;}.custom-scrollbar::-webkit-scrollbar-track{background:rgba(37,99,235,0.2);border-radius:10px;}.custom-scrollbar::-webkit-scrollbar-thumb{background:#222;border-radius:10px;}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#333;}`}</style>
      <div className="font-sans w-[380px] flex flex-col">
        <div className="p-2 sticky top-0 bg-white z-10 border-b border-gray-100">
          <input
            type="text"
            placeholder="Type property name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded text-sm bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        <div className="p-1 custom-scrollbar overflow-y-auto h-[450px]">
          {filteredSuggested.length > 0 && (
            <div className="px-1">
              <h3 className="text-xs text-gray-500 font-semibold px-2 my-2">Suggested</h3>
              <div className="grid grid-cols-2 gap-1">
                {filteredSuggested.map(p => (
                  <button
                    key={p.name}
                    onClick={() => onAddColumn(p.type, p.name)}
                    className="flex items-center w-full px-2 py-2 text-left text-sm hover:bg-gray-100 rounded"
                  >
                    {p.icon}
                    <span className="ml-2 font-medium">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <hr className="my-2" />
          <div className="px-1">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xs text-gray-500 font-semibold">Select type</h3>
              <Search size={14} className="text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {allProperties.types.map((p, i) =>
                p.divider ? (
                  <hr key={`d-${i}`} className="col-span-2 my-1" />
                ) : (
                  filterProperties([p]).length > 0 && (
                    <button
                      key={p.name}
                      onClick={() => onAddColumn(p.type, p.name)}
                      className="flex items-center w-full px-2 py-2 text-left text-sm hover:bg-gray-100 rounded"
                    >
                      {p.icon}
                      <span className="ml-2 font-medium">{p.name}</span>
                    </button>
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


// --- Main TaskDatabaseView component ---
function TaskDatabaseView() {
  // MODIFIED: State now initialized as empty and populated by Firebase. localStorage removed.
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [rowHover, setRowHover] = useState(null);
  const [rowActionHover, setRowActionHover] = useState(null);
  // MODIFIED: Added client-side state for managing row selection to avoid unnecessary DB writes.
  const [selectedRows, setSelectedRows] = useState(new Set());

  const propertyIcons = {
    text: <FileText size={16} className="text-gray-500" />,
    date: <Calendar size={16} className="text-gray-500" />,
    person: <User size={16} className="text-gray-500" />,
    status: <ChevronsUpDown size={16} className="text-gray-500" />,
    select: <ChevronDown size={16} className="text-gray-500" />,
    number: <Hash size={16} className="text-gray-500" />,
    'created-time': <Clock size={16} className="text-gray-500" />,
    'created-by': <UserCircle size={16} className="text-gray-500" />,
    file: <Paperclip size={16} className="text-gray-500" />
  };

  // MODIFIED: Use useEffect to listen for real-time updates from Firestore
  useEffect(() => {
    // Listener for columns, ordered by creation time
    const columnsQuery = query(collection(db, 'taskColumns'), orderBy('createdAt', 'asc'));
    const unsubscribeColumns = onSnapshot(columnsQuery, (snapshot) => {
      const fetchedColumns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setColumns(fetchedColumns);
    });

    // Listener for rows, ordered by creation time
    const rowsQuery = query(collection(db, 'taskRows'), orderBy('createdAt', 'asc'));
    const unsubscribeRows = onSnapshot(rowsQuery, (snapshot) => {
      const fetchedRows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRows(fetchedRows);
    });

    // Detach listeners on component unmount
    return () => {
      unsubscribeColumns();
      unsubscribeRows();
    };
  }, []);


  // MODIFIED: All data mutation functions are now async and interact with Firestore
  const handleCellChange = async (rowId, colId, value) => {
    const rowDocRef = doc(db, 'taskRows', rowId);
    await updateDoc(rowDocRef, { [colId]: value });
  };

  const handleHeaderChange = async (colId, newTitle) => {
    const colDocRef = doc(db, 'taskColumns', colId);
    await updateDoc(colDocRef, { title: newTitle });
  };

  const addColumn = async (type, title) => {
    const newColumnData = {
      title: title || 'New Property',
      type,
      createdAt: new Date(),
    };
    if (['status', 'select', 'multi-select'].includes(type)) {
      newColumnData.options = ['Option 1', 'Option 2'];
    }
    await addDoc(collection(db, 'taskColumns'), newColumnData);
  };

  const deleteColumn = async (colId) => {
    // This deletes the column definition. The corresponding data in each row
    // will remain but will no longer be displayed.
    const colDocRef = doc(db, 'taskColumns', colId);
    await deleteDoc(colDocRef);
  };

  const addRow = async () => {
    const newRow = { createdAt: new Date() };
    columns.forEach(col => {
      if (col.type === 'created-time') newRow[col.id] = new Date().toISOString();
      else if (col.type === 'created-by') newRow[col.id] = 'Admin'; // Replace with actual user if available
      else newRow[col.id] = '';
    });
    await addDoc(collection(db, 'taskRows'), newRow);
  };

  const deleteRow = async (rowId) => {
    const rowDocRef = doc(db, 'taskRows', rowId);
    await deleteDoc(rowDocRef);
    setContextMenu(null);
  };

  // MODIFIED: Selection handlers now manage the client-side 'selectedRows' state
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(rows.map(r => r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(rowId)) {
        newSelection.delete(rowId);
      } else {
        newSelection.add(rowId);
      }
      return newSelection;
    });
  };

  const handleContextMenu = (e, rowId) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      rowId,
      position: {
        x: rect.left - 320,
        y: rect.bottom + 5
      },
    });
  };

  const renderCellDisplay = (row, col) => {
    const value = row[col.id];
    if (col.type === 'status' && value) {
      const config = { 'Done': 'green', 'In progress': 'blue' }[value] || 'gray';
      return (
        <div className={`inline-flex items-center space-x-2 px-2.5 py-1 rounded-full text-sm font-medium bg-${config}-100 text-${config}-800`}>
          <div className={`w-2 h-2 rounded-full bg-${config}-500`}></div>
          <span>{value}</span>
        </div>
      );
    }
    if ((col.type === 'date' || col.type === 'created-time') && value) {
      const date = new Date(value);
      const correctedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
      return correctedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (col.type === 'created-by' && value) {
      return (
        <div className="flex items-center space-x-1">
          <UserCircle size={16} className="text-gray-400" />
          <span>{value}</span>
        </div>
      );
    }
    return value || <span className="text-gray-400">Empty</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold flex items-center text-gray-800">
            <CheckCircle size={24} className="text-green-500 mr-3" />
            Task Database
          </h1>
          <div className="flex items-center space-x-2 text-gray-500">
            <button className="p-1.5 hover:bg-gray-200 rounded-md"><ArrowUpDown size={16} /></button>
            <button className="p-1.5 hover:bg-gray-200 rounded-md"><Filter size={16} /></button>
            <button className="p-1.5 hover:bg-gray-200 rounded-md"><Search size={16} /></button>
            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-md font-semibold flex items-center text-sm hover:bg-blue-700">New<ChevronDown size={16} className="ml-1" /></button>
          </div>
        </header>
        <div className="mb-4">
          <button className="bg-gray-200 px-3 py-1.5 text-sm font-semibold rounded-md flex items-center text-gray-700 hover:bg-gray-300">
            <AlignLeft size={16} className="mr-2" />
            All Task
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th style={{ width: "48px" }}></th>
                  <th className="p-3 w-12 text-center border-b border-gray-200">
                    <input type="checkbox" onChange={handleSelectAll} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  {columns.map(col => (
                    <th key={col.id} className="p-3 border-b border-gray-200 font-semibold text-gray-600 min-w-[200px] group">
                      <div className="flex items-center justify-between">
                        <Editable
                          onSave={(newTitle) => handleHeaderChange(col.id, newTitle)}
                          value={col.title}>
                          <div className="flex items-center space-x-2 py-1">
                            {propertyIcons[col.type] || <FileText size={16} className="text-gray-500" />}
                            <span>{col.title}</span>
                          </div>
                        </Editable>
                        <Dropdown
                          trigger={
                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
                              <MoreHorizontal size={16} />
                            </button>
                          }>
                          <div className="p-1">
                            <button
                              onClick={() => deleteColumn(col.id)}
                              className="w-full text-left text-sm px-2 py-1.5 text-red-600 hover:bg-gray-100 rounded">Delete property</button>
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
                  <tr
                    key={row.id}
                    className="group hover:bg-gray-50"
                    onMouseEnter={() => setRowHover(row.id)}
                    onMouseLeave={() => setRowHover(null)}
                  >
                    <td
                      style={{ width: "48px", minWidth: "48px" }}
                      className="relative px-2"
                      onMouseEnter={() => setRowActionHover(row.id)}
                      onMouseLeave={() => setRowActionHover(null)}
                    >
                      {rowActionHover === row.id && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                          <button title="Add row" tabIndex={-1}><Plus size={16} className="text-gray-400 hover:text-blue-600" /></button>
                          <button title="Reorder" style={{ cursor: "grab" }} tabIndex={-1}>
                            <svg width={16} height={16} className="text-gray-400 hover:text-blue-600">
                              <circle cx={8} cy={8} r={2} fill="currentColor" />
                              <circle cx={3} cy={3} r={2} fill="currentColor" />
                              <circle cx={13} cy={3} r={2} fill="currentColor" />
                              <circle cx={3} cy={13} r={2} fill="currentColor" />
                              <circle cx={13} cy={13} r={2} fill="currentColor" />
                            </svg>
                          </button>
                          <button title="Select" tabIndex={-1}><CheckSquare size={16} className="text-gray-400 hover:text-blue-600" /></button>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center border-b border-gray-200 relative">
                      {/* MODIFIED: Checkbox state is now derived from the 'selectedRows' Set */}
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    {columns.map(col => (
                      <td key={col.id} className="p-3 border-b border-gray-200 text-gray-800">
                        <Editable
                          onSave={(newValue) => handleCellChange(row.id, col.id, newValue)}
                          value={row[col.id]}
                          type={col.type}
                          options={col.options}
                        >{renderCellDisplay(row, col)}</Editable>
                      </td>
                    ))}
                    <td className="p-3 border-b border-gray-200 text-center relative">
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
            <span>New page</span>
          </button>
        </div>
      </div>
      {contextMenu && (
        <RowContextMenu {...contextMenu} onDelete={deleteRow} onClose={() => setContextMenu(null)} />
      )}
    </div>
  );
}

export default TaskDatabaseView;