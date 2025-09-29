import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Search, MoreHorizontal, ChevronDown, AlignLeft, Calendar, User, ChevronsUpDown,
  CheckCircle, ArrowUpDown, Filter, FileText, Type, Hash, List, CheckSquare, Link2, Paperclip,
  Phone, Mail, ArrowRightLeft, FunctionSquare, MousePointerClick, KeyRound, Clock, UserCircle, ShieldCheck, 
  Star, Edit, Copy, ArrowRight, X, Check, Settings, Eye, EyeOff, GripVertical
} from 'lucide-react';

// Dropdown component (without portal)
const Dropdown = ({ trigger, children, menuClassName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div ref={menuRef} onClick={(e) => e.stopPropagation()} 
             className={`absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${menuClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

// Multi-select dropdown for Select/Multi-select properties
const MultiSelectDropdown = ({ value = [], options = [], onChange, isMulti = false, onAddOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newOption, setNewOption] = useState('');
  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  const toggleOption = (option) => {
    if (isMulti) {
      const newValues = selectedValues.includes(option)
        ? selectedValues.filter(v => v !== option)
        : [...selectedValues, option];
      onChange(newValues);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      onAddOption(newOption.trim());
      setNewOption('');
    }
  };

  const getColorClass = (option, type = 'bg') => {
    const colorPairs = [
      { bg: 'bg-blue-100', text: 'text-blue-800' },
      { bg: 'bg-green-100', text: 'text-green-800' },
      { bg: 'bg-purple-100', text: 'text-purple-800' },
      { bg: 'bg-red-100', text: 'text-red-800' },
      { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    ];
    const index = options.indexOf(option) % colorPairs.length;
    return type === 'bg' ? colorPairs[index].bg : colorPairs[index].text;
  };

  return (
    <div className="relative w-full">
      <div onClick={() => setIsOpen(!isOpen)} 
           className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded cursor-pointer hover:border-gray-400 min-h-[36px]">
        {selectedValues.length > 0 ? (
          selectedValues.map(val => (
            <span key={val} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColorClass(val, 'bg')} ${getColorClass(val, 'text')}`}>
              {val}
              {isMulti && (
                <X size={12} className="ml-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleOption(val); }} />
              )}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-sm">Select...</span>
        )}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search or create..."
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="py-1">
            {options.map(option => {
              const isSelected = selectedValues.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColorClass(option, 'bg')} ${getColorClass(option, 'text')}`}>
                    {option}
                  </span>
                  {isSelected && <Check size={16} className="text-blue-600" />}
                </div>
              );
            })}
            {newOption.trim() && !options.includes(newOption.trim()) && (
              <div
                onClick={handleAddOption}
                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-blue-600"
              >
                <Plus size={16} className="mr-2" />
                Create "{newOption}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Column Settings Menu
const ColumnSettingsMenu = ({ column, onUpdate, onDelete, onClose }) => {
  const [editingTitle, setEditingTitle] = useState(column.title);
  const [editingOptions, setEditingOptions] = useState(column.options || []);

  const handleUpdateOptions = () => {
    onUpdate({ ...column, options: editingOptions });
  };

  return (
    <div className="w-80 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Edit property</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Property name</label>
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={() => onUpdate({ ...column, title: editingTitle })}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(column.type === 'select' || column.type === 'status' || column.type === 'multiselect') && (
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Options</label>
            <div className="space-y-2">
              {editingOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...editingOptions];
                      newOpts[idx] = e.target.value;
                      setEditingOptions(newOpts);
                    }}
                    onBlur={handleUpdateOptions}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => {
                      const newOpts = editingOptions.filter((_, i) => i !== idx);
                      setEditingOptions(newOpts);
                      onUpdate({ ...column, options: newOpts });
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setEditingOptions([...editingOptions, `Option ${editingOptions.length + 1}`])}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus size={14} className="mr-1" />
                Add option
              </button>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={() => { onDelete(column.id); onClose(); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
            Delete property
          </button>
        </div>
      </div>
    </div>
  );
};

// Row Context Menu
const RowContextMenu = ({ rowId, onClose, onDelete, onDuplicate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const menuItems = [
    { label: 'Open', icon: <ArrowRight size={16} />, action: onClose },
    { label: 'Open in new tab', icon: <Link2 size={16} />, action: onClose },
    { label: 'Copy link', icon: <Copy size={16} />, action: onClose },
    { label: 'Duplicate', icon: <Copy size={16} />, shortcut: 'Ctrl+D', action: () => { onDuplicate(rowId); onClose(); } },
    { label: 'Delete', icon: <Trash2 size={16} />, shortcut: 'Del', action: () => onDelete(rowId), danger: true },
  ];

  const filteredItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 font-sans">
      <div className="p-2 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search actions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
        />
      </div>
      <div className="py-1">
        {filteredItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className={`w-full flex justify-between items-center px-3 py-2 text-left hover:bg-gray-100 text-sm ${
              item.danger ? 'text-red-600' : 'text-gray-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-500">{item.icon}</div>
              <span>{item.label}</span>
            </div>
            {item.shortcut && <span className="text-xs text-gray-400">{item.shortcut}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

// Enhanced Editable Cell
const EditableCell = ({ value, onSave, column }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && column.type !== 'text') handleSave();
    else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const getColorClass = (val, type = 'bg') => {
    const colorPairs = [
      { bg: 'bg-blue-100', text: 'text-blue-800' },
      { bg: 'bg-green-100', text: 'text-green-800' },
      { bg: 'bg-purple-100', text: 'text-purple-800' },
      { bg: 'bg-red-100', text: 'text-red-800' },
      { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    ];
    const options = column.options || [];
    const index = options.indexOf(val) % colorPairs.length;
    return type === 'bg' ? colorPairs[index].bg : colorPairs[index].text;
  };

  const renderDisplay = () => {
    if (!value && column.type !== 'checkbox') {
      return <span className="text-gray-400">Empty</span>;
    }

    switch (column.type) {
      case 'status':
      case 'select':
      case 'multiselect': {
        const values = Array.isArray(value) ? value : (value ? [value] : []);
        return (
          <div className="flex flex-wrap gap-1">
            {values.map((val, idx) => (
              <span key={idx} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColorClass(val, 'bg')} ${getColorClass(val, 'text')}`}>
                {val}
              </span>
            ))}
          </div>
        );
      }
      case 'date':
        if (value) {
          const date = new Date(value);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        return null;
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => {
              e.stopPropagation();
              onSave(e.target.checked);
            }}
            className="mx-auto block rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        );
      case 'url':
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
            <Link2 size={14} />
            {value}
          </a>
        ) : null;
      case 'person':
        return value ? (
          <div className="flex items-center gap-2">
            <UserCircle size={20} className="text-gray-400" />
            <span>{value}</span>
          </div>
        ) : null;
      default:
        return <span>{value}</span>;
    }
  };

  const renderEditor = () => {
    const commonProps = {
      ref: inputRef,
      onKeyDown: handleKeyDown,
      className: "w-full p-2 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    };

    switch (column.type) {
      case 'date':
        return (
          <input
            type="date"
            {...commonProps}
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
          />
        );
      case 'status':
      case 'select':
      case 'multiselect':
        return (
          <MultiSelectDropdown
            value={currentValue}
            options={column.options || []}
            onChange={(val) => {
              setCurrentValue(val);
              onSave(val);
              setIsEditing(false);
            }}
            isMulti={column.type === 'multiselect'}
            onAddOption={(newOpt) => {
              console.log('Add option:', newOpt);
            }}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            {...commonProps}
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
          />
        );
      case 'url':
        return (
          <input
            type="url"
            {...commonProps}
            placeholder="https://..."
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
          />
        );
      case 'email':
        return (
          <input
            type="email"
            {...commonProps}
            placeholder="email@example.com"
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
          />
        );
      case 'phone':
        return (
          <input
            type="tel"
            {...commonProps}
            placeholder="+1 234 567 8900"
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
          />
        );
      default:
        return (
          <input
            type="text"
            {...commonProps}
            value={currentValue || ''}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
          />
        );
    }
  };

  if (column.type === 'checkbox') {
    return renderDisplay();
  }

  if (isEditing) {
    return <div className="w-full">{renderEditor()}</div>;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className="w-full h-full cursor-pointer p-2 hover:bg-gray-50 rounded"
    >
      {renderDisplay()}
    </div>
  );
};

// Add Property Menu
const AddPropertyMenu = ({ onAddColumn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const propertyTypes = [
    { name: 'Text', icon: <Type size={18} />, type: 'text', desc: 'Plain text' },
    { name: 'Number', icon: <Hash size={18} />, type: 'number', desc: 'A number' },
    { name: 'Select', icon: <List size={18} />, type: 'select', desc: 'Select from list' },
    { name: 'Multi-select', icon: <List size={18} />, type: 'multiselect', desc: 'Select multiple' },
    { name: 'Status', icon: <ChevronsUpDown size={18} />, type: 'status', desc: 'Custom status' },
    { name: 'Date', icon: <Calendar size={18} />, type: 'date', desc: 'A date' },
    { name: 'Person', icon: <User size={18} />, type: 'person', desc: 'A person' },
    { name: 'Files & media', icon: <Paperclip size={18} />, type: 'file', desc: 'Upload files' },
    { name: 'Checkbox', icon: <CheckSquare size={18} />, type: 'checkbox', desc: 'True or false' },
    { name: 'URL', icon: <Link2 size={18} />, type: 'url', desc: 'A link' },
    { name: 'Email', icon: <Mail size={18} />, type: 'email', desc: 'An email address' },
    { name: 'Phone', icon: <Phone size={18} />, type: 'phone', desc: 'A phone number' },
  ];

  const filteredProperties = propertyTypes.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans w-[380px]">
      <div className="p-3 sticky top-0 bg-white z-10 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search for a property type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded text-sm bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
        />
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        <div className="p-2">
          <h3 className="text-xs text-gray-500 font-semibold px-2 py-2">PROPERTY TYPES</h3>
          {filteredProperties.map(p => (
            <button
              key={p.name}
              onClick={() => { onAddColumn(p.type, p.name); }}
              className="flex items-start w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded group"
            >
              <div className="mt-0.5 mr-3 text-gray-500">{p.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{p.name}</div>
                <div className="text-xs text-gray-500">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Component
function TaskDatabaseView() {
  const [columns, setColumns] = useState([
    { id: 'col1', title: 'Name', type: 'text', createdAt: Date.now() },
    { id: 'col2', title: 'Status', type: 'status', options: ['To Do', 'In Progress', 'Done'], createdAt: Date.now() + 1 },
    { id: 'col3', title: 'Due Date', type: 'date', createdAt: Date.now() + 2 },
    { id: 'col4', title: 'Assignee', type: 'person', createdAt: Date.now() + 3 },
  ]);
  
  const [rows, setRows] = useState([
    { id: 'row1', col1: 'Design new landing page', col2: 'In Progress', col3: '2025-10-15', col4: 'John Doe', createdAt: Date.now() },
    { id: 'row2', col1: 'Review pull requests', col2: 'To Do', col3: '2025-10-10', col4: 'Jane Smith', createdAt: Date.now() + 1 },
    { id: 'row3', col1: 'Update documentation', col2: 'Done', col3: '2025-10-05', col4: 'Mike Johnson', createdAt: Date.now() + 2 },
  ]);
  
  const [contextMenu, setContextMenu] = useState(null);
  const [rowHover, setRowHover] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [editingColumn, setEditingColumn] = useState(null);

  const propertyIcons = {
    text: <FileText size={16} />,
    date: <Calendar size={16} />,
    person: <User size={16} />,
    status: <ChevronsUpDown size={16} />,
    select: <ChevronDown size={16} />,
    multiselect: <List size={16} />,
    number: <Hash size={16} />,
    file: <Paperclip size={16} />,
    checkbox: <CheckSquare size={16} />,
    url: <Link2 size={16} />,
    email: <Mail size={16} />,
    phone: <Phone size={16} />,
  };

  const handleCellChange = (rowId, colId, value) => {
    setRows(prev => prev.map(row =>
      row.id === rowId ? { ...row, [colId]: value } : row
    ));
  };

  const addColumn = (type, title) => {
    const newColumn = {
      id: `col${Date.now()}`,
      title: title || 'New Property',
      type,
      createdAt: Date.now(),
    };
    if (type === 'status' || type === 'select' || type === 'multiselect') {
      newColumn.options = ['Option 1', 'Option 2', 'Option 3'];
    }
    setColumns(prev => [...prev, newColumn]);
    setRows(prev => prev.map(row => ({ ...row, [newColumn.id]: '' })));
  };

  const updateColumn = (updatedColumn) => {
    setColumns(prev => prev.map(col =>
      col.id === updatedColumn.id ? updatedColumn : col
    ));
    setEditingColumn(null);
  };

  const deleteColumn = (colId) => {
    setColumns(prev => prev.filter(col => col.id !== colId));
    setRows(prev => prev.map(row => {
      const { [colId]: _, ...rest } = row;
      return rest;
    }));
    setEditingColumn(null);
  };

  const addRow = () => {
    const newRow = { id: `row${Date.now()}`, createdAt: Date.now() };
    columns.forEach(col => {
      newRow[col.id] = '';
    });
    setRows(prev => [...prev, newRow]);
  };

  const deleteRow = (rowId) => {
    setRows(prev => prev.filter(row => row.id !== rowId));
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(rowId);
      return newSet;
    });
    setContextMenu(null);
  };

  const duplicateRow = (rowId) => {
    const rowToDuplicate = rows.find(r => r.id === rowId);
    if (rowToDuplicate) {
      const newRow = { ...rowToDuplicate, id: `row${Date.now()}`, createdAt: Date.now() };
      setRows(prev => [...prev, newRow]);
    }
  };

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
              <CheckSquare size={20} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Task Database</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded flex items-center gap-1">
              <Filter size={16} />
              Filter
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded flex items-center gap-1">
              <ArrowUpDown size={16} />
              Sort
            </button>
            <button 
              onClick={addRow}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-md font-medium flex items-center text-sm hover:bg-blue-700 shadow-sm"
            >
              <Plus size={16} className="mr-1" />
              New
            </button>
          </div>
        </header>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 w-12 text-center sticky left-0 bg-gray-50 z-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === rows.length && rows.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {columns.map(col => (
                    <th key={col.id} className="p-3 font-semibold text-gray-700 min-w-[200px] group text-left relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{propertyIcons[col.type]}</span>
                          <span>{col.title}</span>
                        </div>
                        <Dropdown
                          trigger={
                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity">
                              <MoreHorizontal size={16} />
                            </button>
                          }
                        >
                          <ColumnSettingsMenu
                            column={col}
                            onUpdate={updateColumn}
                            onDelete={deleteColumn}
                            onClose={() => setEditingColumn(null)}
                          />
                        </Dropdown>
                      </div>
                    </th>
                  ))}
                  <th className="p-3 border-b border-gray-200 w-16 text-center">
                    <Dropdown
                      trigger={
                        <button className="p-1.5 rounded-md hover:bg-gray-200" title="Add property">
                          <Plus size={16} />
                        </button>
                      }
                    >
                      <AddPropertyMenu onAddColumn={addColumn} />
                    </Dropdown>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="group hover:bg-gray-50 border-b border-gray-100" 
                    onMouseEnter={() => setRowHover(row.id)} 
                    onMouseLeave={() => setRowHover(null)}
                  >
                    <td className="p-3 text-center sticky left-0 bg-white group-hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    {columns.map(col => (
                      <td key={col.id} className="p-0 text-gray-800 align-top">
                        <EditableCell
                          value={row[col.id]}
                          onSave={(newValue) => handleCellChange(row.id, col.id, newValue)}
                          column={col}
                        />
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      {rowHover === row.id && (
                        <Dropdown
                          trigger={
                            <button
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                              title="More options"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          }
                        >
                          <RowContextMenu
                            rowId={row.id}
                            onDelete={deleteRow}
                            onDuplicate={duplicateRow}
                            onClose={() => setContextMenu(null)}
                          />
                        </Dropdown>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={addRow}
            className="mt-2 mb-2 ml-3 text-gray-500 flex items-center space-x-2 hover:bg-gray-100 p-2 rounded w-fit text-left font-medium"
          >
            <Plus size={16} />
            <span>New</span>
          </button>
        </div>

        {selectedRows.size > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
            <span className="font-medium">{selectedRows.size} selected</span>
            <button
              onClick={() => {
                selectedRows.forEach(rowId => deleteRow(rowId));
              }}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded flex items-center gap-1"
            >
              <Trash2 size={14} />
              Delete
            </button>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDatabaseView;