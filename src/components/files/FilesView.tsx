import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  db,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
} from '../../firebase/firestore';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// ADDED: jszip and file-saver for download functionality
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
// ADDED: Download icon
import {
  Folder,
  FileText,
  FilePlus,
  FolderPlus,
  Scissors,
  Copy as CopyIcon,
  ClipboardPaste,
  Trash2,
  Edit3,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  LayoutGrid,
  List,
  Upload,
  MoreHorizontal,
  CheckSquare,
  Square,
  Combine,
  Search,
  Copy as CopyPathIcon,
  X,
  Download,
} from 'lucide-react';
import { renameItem, deleteItem, moveItem, copyItem } from './fileOperations';

// --- UI Components ---

const Dropdown = ({
  title,
  show,
  setShow,
  options,
  current,
  onSelect,
  icon,
  disabled,
}: {
  title?: string;
  show: boolean;
  setShow: (s: boolean) => void;
  options: Record<string, React.ReactNode>;
  current?: string;
  onSelect: (k: string) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) => (
  <div className="relative">
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onClick={() => !disabled && setShow(!show)}
      onBlur={() => setTimeout(() => setShow(false), 200)}
      className="flex items-center px-3 py-1.5 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:text-gray-400 disabled:hover:bg-transparent"
      disabled={disabled}
    >
      {icon}
      {title}
      {title && <span className="text-xs ml-1">▼</span>}
    </button>
    {show && !disabled && (
      <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-md shadow-lg z-20">
        {Object.entries(options).map(([key, value]) => {
          if (key.startsWith('separator')) {
            return (
              <div
                key={key}
                className="border-t border-gray-200 dark:border-gray-600 my-1"
              ></div>
            );
          }
          return (
            <a
              href="#"
              key={key}
              onMouseDown={() => {
                onSelect(key);
                setShow(false);
              }}
              className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              {value} {current === key && <Check className="w-4 h-4" />}
            </a>
          );
        })}
      </div>
    )}
  </div>
);

// MODIFIED: Toolbar now receives a `canDownload` prop to conditionally show the download option.
const Toolbar = ({
  onNewItem,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onRename,
  canCopy,
  canCut,
  canPaste,
  canDelete,
  canRename,
  sortConfig,
  setSortConfig,
  viewMode,
  setViewMode,
  onMoreOptions,
  canSelect,
  canDownload,
}: any) => {
  const [showNew, setShowNew] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const sortOptions = {
    name: 'Name',
    createdAt: 'Date modified',
    type: 'Type',
  };
  const viewOptions = { grid: 'Large icons', list: 'List' };

  // MODIFIED: moreOptions is now dynamically generated
  const moreOptions = useMemo(() => {
    const options: Record<string, React.ReactNode> = {
      selectAll: (
        <>
          <CheckSquare className="w-4 h-4 mr-2" />
          Select all
        </>
      ),
      selectNone: (
        <>
          <Square className="w-4 h-4 mr-2" />
          Select none
        </>
      ),
      invertSelection: (
        <>
          <Combine className="w-4 h-4 mr-2" />
          Invert selection
        </>
      ),
    };

    if (canDownload) {
      options['separator-1'] = <hr />;
      options['download'] = (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download
        </>
      );
    }
    return options;
  }, [canDownload]);

  return (
    <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
      <Dropdown
        title="New"
        show={showNew}
        setShow={setShowNew}
        options={{
          folder: (
            <>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </>
          ),
          file: (
            <>
              <FilePlus className="w-4 h-4 mr-2" />
              Text Document
            </>
          ),
          upload: (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </>
          ),
        }}
        onSelect={onNewItem}
        icon={<FilePlus className="w-5 h-5 mr-2" />}
      />
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
      <button
        onClick={onCut}
        disabled={!canCut}
        title="Cut (Ctrl+X)"
        className="p-2 rounded-md disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:hover:bg-transparent"
      >
        <Scissors className="w-5 h-5" />
      </button>
      <button
        onClick={onCopy}
        disabled={!canCopy}
        title="Copy (Ctrl+C)"
        className="p-2 rounded-md disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:hover:bg-transparent"
      >
        <CopyIcon className="w-5 h-5" />
      </button>
      <button
        onClick={onPaste}
        disabled={!canPaste}
        title="Paste (Ctrl+V)"
        className="p-2 rounded-md disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:hover:bg-transparent"
      >
        <ClipboardPaste className="w-5 h-5" />
      </button>
      <button
        onClick={onRename}
        disabled={!canRename}
        title="Rename (F2)"
        className="p-2 rounded-md disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:hover:bg-transparent"
      >
        <Edit3 className="w-5 h-5" />
      </button>
      <button
        onClick={onDelete}
        disabled={!canDelete}
        title="Delete (Del)"
        className="p-2 rounded-md disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:hover:bg-transparent"
      >
        <Trash2 className="w-5 h-5" />
      </button>
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
      <Dropdown
        title="Sort"
        show={showSort}
        setShow={setShowSort}
        options={sortOptions}
        current={sortConfig.key}
        onSelect={(key: any) => setSortConfig({ ...sortConfig, key })}
      />
      <Dropdown
        title="View"
        show={showView}
        setShow={setShowView}
        options={viewOptions}
        current={viewMode}
        onSelect={setViewMode}
      />
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
      <Dropdown
        show={showMore}
        setShow={setShowMore}
        options={moreOptions}
        onSelect={onMoreOptions}
        icon={<MoreHorizontal className="w-5 h-5" />}
        disabled={!canSelect && !canDownload}
      />
    </div>
  );
};

const FileItem = ({
  item,
  isSelected,
  isRenaming,
  onClick,
  onDoubleClick,
  onRenameSubmit,
  onRenameCancel,
  viewMode,
  showPath,
}: any) => {
  const [name, setName] = useState(item.name);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      const initialName = item.name;
      setName(initialName);

      const timer = setTimeout(() => {
        const inputElement = inputRef.current;
        if (inputElement) {
          inputElement.focus();

          const extensionIndex = initialName.lastIndexOf('.');
          const selectionEnd =
            extensionIndex > 0 && !item.isFolder
              ? extensionIndex
              : initialName.length;

          inputElement.setSelectionRange(0, selectionEnd);
          setIsInputFocused(true);
        }
      }, 50);

      return () => clearTimeout(timer);
    } else {
      setIsInputFocused(false);
    }
  }, [isRenaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onRenameCancel();
    }
  };

  const handleInputBlur = () => {
    if (isInputFocused && isRenaming) {
      onRenameSubmit(name);
    }
    setIsInputFocused(false);
  };

  const handleInputMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const commonProps = {
    onMouseDown: (e: any) => {
      if (!isRenaming) {
        onClick && onClick(e, item.id);
      } else {
        e.stopPropagation();
      }
    },
    onDoubleClick: onDoubleClick,
  };
  const baseClasses = `cursor-pointer rounded-md ${
    isSelected
      ? 'bg-blue-200 dark:bg-blue-800 border-blue-400'
      : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'
  } border`;

  if (viewMode === 'list' || showPath) {
    return (
      <div
        {...commonProps}
        className={`flex items-center p-2 w-full ${baseClasses}`}
      >
        <div className="text-gray-600 dark:text-gray-300 mr-3">
          {item.isFolder ? <Folder size={20} /> : <FileText size={20} />}
        </div>
        <div className="flex-grow">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleInputBlur}
              onFocus={() => setIsInputFocused(true)}
              onKeyDown={handleKeyDown}
              onMouseDown={handleInputMouseDown}
              className="bg-white dark:bg-gray-800 border border-blue-500 rounded-sm p-0.5 text-sm w-full"
            />
          ) : (
            <p className="text-sm truncate select-none">{item.name}</p>
          )}
          {showPath && (
            <p className="text-xs text-gray-500 truncate select-none">
              In: {item.path || 'Root'}
            </p>
          )}
        </div>
        <span className="text-xs text-gray-500 ml-auto pl-4 select-none">
          {item.createdAt
            ? new Date(item.createdAt.seconds * 1000).toLocaleDateString()
            : ''}
        </span>
        <span className="text-xs text-gray-500 w-24 text-right select-none">
          {item.isFolder ? 'Folder' : 'File'}
        </span>
      </div>
    );
  }

  return (
    <div
      {...commonProps}
      className={`flex flex-col items-center justify-center p-2 w-32 h-32 text-center ${baseClasses}`}
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
          onBlur={handleInputBlur}
          onFocus={() => setIsInputFocused(true)}
          onKeyDown={handleKeyDown}
          onMouseDown={handleInputMouseDown}
          className="w-full text-center bg-white dark:bg-gray-800 border border-blue-500 rounded-sm mt-2 p-0.5 text-sm"
        />
      ) : (
        <p className="text-xs mt-2 break-words w-full select-none">
          {item.name}
        </p>
      )}
    </div>
  );
};

const TextEditorModal = ({ file, onClose, onSave }: any) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (file?.url) {
      fetch(file.url)
        .then((response) => response.text())
        .then((text) => {
          setContent(text);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching file content:', error);
          setIsLoading(false);
        });
    }
  }, [file]);

  const handleSave = async () => {
    if (!file?.organization || file.path == null) return;
    try {
      const filePath = file.path ? `${file.path}/${file.name}` : file.name;
      const storageRef = ref(storage, `${file.organization}/${filePath}`);
      const blob = new Blob([content], { type: file.fileType || 'text/plain' });
      await uploadBytes(storageRef, blob);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file. See console for details.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{file.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            &times;
          </button>
        </div>
        <div className="flex-grow p-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-md p-2 resize-none"
            />
          )}
        </div>
        <div className="p-4 border-t dark:border-gray-700 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main View Component ---

const FilesView = ({ users, currentUser }: any) => {
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [pathHistory, setPathHistory] = useState({
    paths: [''],
    currentIndex: 0,
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lastSelectedItem, setLastSelectedItem] = useState<string | null>(null);
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [creatingItem, setCreatingItem] = useState<{
    type: 'folder' | 'file';
    tempId: string;
    name: string;
  } | null>(null);
  const [editingFile, setEditingFile] = useState<any | null>(null);
  const [clipboard, setClipboard] = useState<{
    action: 'copy' | 'cut';
    items: any[];
  } | null>(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending',
  });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [pathInputValue, setPathInputValue] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const currentPath = pathHistory.paths[pathHistory.currentIndex];
  const fileAreaRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const pathInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingPath) {
      pathInputRef.current?.focus();
    }
  }, [isEditingPath]);

  useEffect(() => {
    if (!currentUser?.organization || searchQuery) return;
    const filesUnsub = onSnapshot(
      query(
        collection(db, 'files'),
        where('organization', '==', currentUser.organization),
        where('path', '==', currentPath)
      ),
      (s) =>
        setFiles(
          s.docs.map((d) => ({ ...d.data(), id: d.id, isFolder: false }))
        )
    );
    const foldersUnsub = onSnapshot(
      query(
        collection(db, 'folders'),
        where('organization', '==', currentUser.organization),
        where('path', '==', currentPath)
      ),
      (s) =>
        setFolders(
          s.docs.map((d) => ({ ...d.data(), id: d.id, isFolder: true }))
        )
    );
    return () => {
      filesUnsub();
      foldersUnsub();
    };
  }, [currentUser?.organization, currentPath, searchQuery]);

  const performSearch = useCallback(
    async (queryText: string) => {
      if (!currentUser?.organization || !queryText) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);

      try {
        const filesQuery = query(
          collection(db, 'files'),
          where('organization', '==', currentUser.organization),
          where('path', '>=', currentPath),
          where('path', '<', currentPath + '\uf8ff')
        );
        const foldersQuery = query(
          collection(db, 'folders'),
          where('organization', '==', currentUser.organization),
          where('path', '>=', currentPath),
          where('path', '<', currentPath + '\uf8ff')
        );

        const [filesSnapshot, foldersSnapshot] = await Promise.all([
          getDocs(filesQuery),
          getDocs(foldersQuery),
        ]);

        const allItems = [
          ...filesSnapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
            isFolder: false,
          })),
          ...foldersSnapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
            isFolder: true,
          })),
        ];

        const results = allItems.filter((item) =>
          item.name.toLowerCase().includes(queryText.toLowerCase())
        );
        setSearchResults(results);
      } catch (error) {
        console.error(
          'Error performing search (check if you have the required Firestore index):',
          error
        );
        alert(
          'Search failed. This may be due to a missing database index. Check the console for details.'
        );
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [currentUser?.organization, currentPath]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery, performSearch]);

  const sortedItems = useMemo(() => {
    const allItems = [...folders, ...files];
    if (creatingItem) {
      allItems.push({
        id: creatingItem.tempId,
        name: creatingItem.name,
        isFolder: creatingItem.type === 'folder',
        createdAt: { seconds: Date.now() / 1000 },
        path: currentPath,
        organization: currentUser?.organization,
      });
    }

    return allItems.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      const valA =
        sortConfig.key === 'createdAt'
          ? a.createdAt?.seconds || 0
          : a[sortConfig.key]?.toLowerCase();
      const valB =
        sortConfig.key === 'createdAt'
          ? b.createdAt?.seconds || 0
          : b[sortConfig.key]?.toLowerCase();
      if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [
    folders,
    files,
    sortConfig,
    creatingItem,
    currentPath,
    currentUser?.organization,
  ]);

  const navigate = (newPath: string) => {
    const cleanedPath = newPath
      .replace(/\\/g, '/')
      .replace(/^Root\/?/, '')
      .replace(/\/$/, '')
      .replace(/^\//, '');
    const newPaths = pathHistory.paths.slice(0, pathHistory.currentIndex + 1);
    if (newPaths[newPaths.length - 1] !== cleanedPath) {
      newPaths.push(cleanedPath);
      setPathHistory({ paths: newPaths, currentIndex: newPaths.length - 1 });
    } else {
      setPathHistory((p) => ({ ...p, currentIndex: p.paths.length - 1 }));
    }
    setSearchQuery('');
    setIsEditingPath(false);
  };

  const handlePathEditCommit = () => {
    navigate(pathInputValue);
  };

  const handleDoubleClick = (item: any) => {
    if (creatingItem && item.id === creatingItem.tempId) return;
    if (item.isFolder) {
      const newPath = item.path ? `${item.path}/${item.name}` : item.name;
      navigate(newPath);
    } else {
      const fileType = item.fileType || '';
      if (
        fileType.startsWith('image/') ||
        fileType === 'application/pdf' ||
        fileType.startsWith('video/') ||
        fileType.startsWith('audio/')
      ) {
        window.open(item.url, '_blank');
      } else if (isTextFile(item)) {
        setEditingFile(item);
      } else {
        window.open(item.url, '_blank');
      }
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.organization) return;

    try {
      const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
      const storageRef = ref(
        storage,
        `${currentUser.organization}/${filePath}`
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'files'), {
        name: file.name,
        path: currentPath,
        createdAt: new Date(),
        organization: currentUser.organization,
        size: file.size,
        fileType: file.type,
        url: downloadURL,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. See console for details.');
    }

    if (e.target) e.target.value = '';
  };

  const goBack = () =>
    pathHistory.currentIndex > 0 &&
    setPathHistory((p) => ({ ...p, currentIndex: p.currentIndex - 1 }));
  const goForward = () =>
    pathHistory.currentIndex < pathHistory.paths.length - 1 &&
    setPathHistory((p) => ({ ...p, currentIndex: p.currentIndex + 1 }));
  const goUp = () => {
    if (currentPath !== '')
      navigate(currentPath.substring(0, currentPath.lastIndexOf('/')));
  };

  const isTextFile = (item: any) => {
    const fileType = item.fileType || '';
    if (fileType.startsWith('text/')) return true;
    if (
      [
        'application/json',
        'application/xml',
        'application/javascript',
      ].includes(fileType)
    )
      return true;
    const textExtensions = [
      'txt',
      'md',
      'json',
      'xml',
      'html',
      'css',
      'js',
      'ts',
      'jsx',
      'tsx',
      'log',
      'yaml',
      'yml',
      'ini',
      'cfg',
      'csv',
      'svg',
    ];
    const name = item.name || '';
    const extension = name.split('.').pop()?.toLowerCase();
    return !!extension && textExtensions.includes(extension);
  };

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (creatingItem && creatingItem.tempId === id) return;
    if (creatingItem && creatingItem.tempId !== id) {
      setCreatingItem(null);
      setSelectedItems([]);
      setLastSelectedItem(null);
      setRenamingItemId(null);
      return;
    }
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isShiftPressed = e.shiftKey;
    if (isShiftPressed && lastSelectedItem) {
      const lastIndex = sortedItems.findIndex(
        (item) => item.id === lastSelectedItem
      );
      const currentIndex = sortedItems.findIndex((item) => item.id === id);
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const newSelection = sortedItems
        .slice(start, end + 1)
        .map((item) => item.id);
      setSelectedItems(newSelection);
    } else if (isCtrlPressed) {
      setSelectedItems((prev) =>
        prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
      );
      setLastSelectedItem(id);
    } else {
      setSelectedItems([id]);
      setLastSelectedItem(id);
    }
  };

  const handleRename = async (newName: string) => {
    const item = [...sortedItems, ...searchResults].find(
      (i) => i.id === renamingItemId
    );
    if (item && newName.trim() && currentUser?.organization) {
      await renameItem(item, newName.trim(), currentUser.organization);
    }
    setRenamingItemId(null);
  };

  const handleCreateAndRename = async (
    name: string,
    type: 'folder' | 'file'
  ) => {
    if (!name.trim() || !currentUser?.organization) {
      setCreatingItem(null);
      setSelectedItems([]);
      setRenamingItemId(null);
      return;
    }
    const trimmedName = name.trim();
    if (type === 'folder') {
      await addDoc(collection(db, 'folders'), {
        name: trimmedName,
        path: currentPath,
        createdAt: new Date(),
        organization: currentUser.organization,
      });
    } else {
      try {
        const filePath = currentPath
          ? `${currentPath}/${trimmedName}`
          : trimmedName;
        const storageRef = ref(
          storage,
          `${currentUser.organization}/${filePath}`
        );
        const blob = new Blob([''], { type: 'text/plain' });
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        await addDoc(collection(db, 'files'), {
          name: trimmedName,
          path: currentPath,
          createdAt: new Date(),
          organization: currentUser.organization,
          size: 0,
          fileType: 'text/plain',
          url: downloadURL,
        });
      } catch (error) {
        console.error('Error creating new file:', error);
        alert('Error creating file. See console for details.');
      }
    }
    setCreatingItem(null);
    setSelectedItems([]);
    setRenamingItemId(null);
  };

  const onCopy = useCallback(
    () =>
      setClipboard({
        action: 'copy',
        items: sortedItems.filter((i) => selectedItems.includes(i.id)),
      }),
    [selectedItems, sortedItems]
  );
  const onCut = useCallback(
    () =>
      setClipboard({
        action: 'cut',
        items: sortedItems.filter((i) => selectedItems.includes(i.id)),
      }),
    [selectedItems, sortedItems]
  );

  const onPaste = useCallback(async () => {
    if (!clipboard || !currentUser?.organization) return;
    for (const item of clipboard.items) {
      if (clipboard.action === 'copy') {
        await copyItem(item, currentPath, currentUser.organization);
      } else if (clipboard.action === 'cut') {
        await moveItem(item, currentPath, currentUser.organization);
      }
    }
    if (clipboard.action === 'cut') setClipboard(null);
  }, [clipboard, currentPath, currentUser?.organization]);

  const onDelete = useCallback(async () => {
    if (
      selectedItems.length === 0 ||
      !window.confirm(`Delete ${selectedItems.length} item(s)?`) ||
      !currentUser?.organization
    )
      return;
    const allItems = [...sortedItems, ...searchResults];
    for (const itemId of selectedItems) {
      const item = allItems.find((i) => i.id === itemId);
      if (item && item.id !== creatingItem?.tempId) {
        await deleteItem(item, currentUser.organization);
      }
    }
    setSelectedItems([]);
  }, [
    selectedItems,
    sortedItems,
    searchResults,
    currentUser?.organization,
    creatingItem?.tempId,
  ]);

  const handleSelectAll = useCallback(() => {
    const itemsToSelect = searchQuery ? searchResults : sortedItems;
    const allItemIds = itemsToSelect
      .map((item) => item.id)
      .filter((id) => !creatingItem || id !== creatingItem.tempId);
    setSelectedItems(allItemIds);
  }, [sortedItems, searchResults, searchQuery, creatingItem]);

  const handleSelectNone = useCallback(() => {
    setSelectedItems([]);
    setLastSelectedItem(null);
  }, []);

  const handleInvertSelection = useCallback(() => {
    const itemsToSelect = searchQuery ? searchResults : sortedItems;
    const allItemIds = itemsToSelect
      .map((item) => item.id)
      .filter((id) => !creatingItem || id !== creatingItem.tempId);
    const currentSelection = new Set(selectedItems);
    const invertedSelection = allItemIds.filter(
      (id) => !currentSelection.has(id)
    );
    setSelectedItems(invertedSelection);
    setLastSelectedItem(null);
  }, [sortedItems, searchResults, selectedItems, searchQuery, creatingItem]);

  // NEW: Download handler function
  const handleDownload = useCallback(async () => {
    if (selectedItems.length === 0 || !currentUser?.organization) return;

    const allCurrentItems = [...folders, ...files, ...searchResults];
    const itemsToDownload = allCurrentItems.filter((item) =>
      selectedItems.includes(item.id)
    );

    // Case 1: Single file download
    if (itemsToDownload.length === 1 && !itemsToDownload[0].isFolder) {
      const item = itemsToDownload[0];
      try {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error('Network response was not ok.');
        const blob = await response.blob();
        saveAs(blob, item.name);
      } catch (error) {
        console.error('Error downloading single file:', error);
        alert(
          'Failed to download the file. Please check the console for details.'
        );
      }
      return;
    }

    // Case 2: Multiple items or folder(s) download as ZIP
    alert('Zipping and downloading... This may take a moment.');
    const zip = new JSZip();

    const fetchFolderContents = async (folderPath: string) => {
      const filesQuery = query(
        collection(db, 'files'),
        where('organization', '==', currentUser.organization),
        where('path', '==', folderPath)
      );
      const foldersQuery = query(
        collection(db, 'folders'),
        where('organization', '==', currentUser.organization),
        where('path', '==', folderPath)
      );

      const [filesSnapshot, foldersSnapshot] = await Promise.all([
        getDocs(filesQuery),
        getDocs(foldersQuery),
      ]);

      const files = filesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        isFolder: false,
      }));
      const folders = foldersSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        isFolder: true,
      }));

      return { files, folders };
    };

    const addItemsToZip = async (items: any[], parentZip: JSZip) => {
      for (const item of items) {
        if (item.isFolder) {
          const folderZip = parentZip.folder(item.name);
          if (folderZip) {
            const newPath = item.path ? `${item.path}/${item.name}` : item.name;
            const { files, folders } = await fetchFolderContents(newPath);
            await addItemsToZip([...files, ...folders], folderZip);
          }
        } else {
          try {
            const response = await fetch(item.url);
            if (!response.ok) {
              console.warn(`Could not fetch ${item.name}, skipping.`);
              continue;
            }
            const blob = await response.blob();
            parentZip.file(item.name, blob);
          } catch (error) {
            console.warn(`Error fetching ${item.name}:`, error);
          }
        }
      }
    };

    await addItemsToZip(itemsToDownload, zip);

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `download-${Date.now()}.zip`);
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('Failed to create zip file. Check the console for details.');
    }
  }, [selectedItems, folders, files, searchResults, currentUser?.organization]);

  const handleMoreOptions = useCallback(
    (key: string) => {
      switch (key) {
        case 'selectAll':
          handleSelectAll();
          break;
        case 'selectNone':
          handleSelectNone();
          break;
        case 'invertSelection':
          handleInvertSelection();
          break;
        case 'download':
          handleDownload();
          break;
        default:
          break;
      }
    },
    [handleSelectAll, handleSelectNone, handleInvertSelection, handleDownload]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA')
        return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        onCopy();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        onCut();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        onPaste();
      }
      if (e.key === 'Delete') {
        e.preventDefault();
        onDelete();
      }
      if (e.key === 'F2' && selectedItems.length === 1) {
        e.preventDefault();
        setRenamingItemId(selectedItems[0]);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleSelectAll();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedItems([]);
        setCreatingItem(null);
        setRenamingItemId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onCopy,
    onCut,
    onPaste,
    onDelete,
    selectedItems,
    renamingItemId,
    creatingItem,
    handleSelectAll,
  ]);

  const itemsToDisplay = searchQuery ? searchResults : sortedItems;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans">
      <input
        type="file"
        ref={uploadInputRef}
        onChange={handleFileSelected}
        className="hidden"
      />
      <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 gap-2">
        <button
          onClick={goBack}
          disabled={pathHistory.currentIndex === 0}
          className="p-2 rounded-md disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={goForward}
          disabled={pathHistory.currentIndex >= pathHistory.paths.length - 1}
          className="p-2 rounded-md disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowRight size={18} />
        </button>
        <button
          onClick={goUp}
          disabled={currentPath === ''}
          className="p-2 rounded-md disabled:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowUp size={18} />
        </button>

        <div className="flex-grow flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
          <div
            className="flex-grow p-1.5 bg-gray-100 dark:bg-gray-900 rounded-l-md text-sm"
            onClick={() => {
              setIsEditingPath(true);
              setPathInputValue(currentPath ? `Root/${currentPath}/` : 'Root/');
            }}
          >
            {isEditingPath ? (
              <input
                ref={pathInputRef}
                type="text"
                value={pathInputValue}
                onChange={(e) => setPathInputValue(e.target.value)}
                onBlur={() => setIsEditingPath(false)}
                onKeyDown={(e) => e.key === 'Enter' && handlePathEditCommit()}
                className="w-full bg-transparent outline-none"
              />
            ) : (
              <>
                <span
                  className="cursor-pointer hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('');
                  }}
                >
                  Root
                </span>
                {currentPath
                  .split('/')
                  .filter(Boolean)
                  .map((p, i, arr) => (
                    <span key={i}>
                      {' > '}
                      <span
                        className="cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`${arr.slice(0, i + 1).join('/')}`);
                        }}
                      >
                        {p}
                      </span>
                    </span>
                  ))}
              </>
            )}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(currentPath)}
            title="Copy path"
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r-md border-l border-gray-300 dark:border-gray-600"
          >
            <CopyPathIcon size={16} />
          </button>
        </div>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search in ${currentPath.split('/').pop() || 'Root'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9 pr-8 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Clear search"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <Toolbar
          {...{
            onNewItem: (type: 'folder' | 'file' | 'upload') => {
              if (searchQuery) return;
              if (type === 'upload') {
                uploadInputRef.current?.click();
              } else {
                const allNames = new Set(
                  [...folders, ...files].map((i) => i.name)
                );
                const baseName =
                  type === 'folder' ? 'New folder' : 'New Text Document.txt';

                let uniqueName = baseName;
                let counter = 2;

                const isFile = type === 'file';
                let namePart = baseName;
                let extension = '';
                if (isFile) {
                  const dotIndex = baseName.lastIndexOf('.');
                  if (dotIndex !== -1) {
                    namePart = baseName.substring(0, dotIndex);
                    extension = baseName.substring(dotIndex);
                  }
                }

                while (allNames.has(uniqueName)) {
                  if (isFile) {
                    uniqueName = `${namePart} (${counter})${extension}`;
                  } else {
                    uniqueName = `${baseName} (${counter})`;
                  }
                  counter++;
                }

                const tempId = `new-item-${Date.now()}`;
                setSelectedItems([tempId]);
                setLastSelectedItem(tempId);
                setCreatingItem({ type, tempId, name: uniqueName });
                setRenamingItemId(tempId);
              }
            },
            onCopy,
            onCut,
            onPaste,
            onDelete,
            onRename: () =>
              selectedItems.length === 1 && setRenamingItemId(selectedItems[0]),
            canCopy: selectedItems.length > 0,
            canCut: selectedItems.length > 0,
            canPaste: !!clipboard,
            canDelete: selectedItems.length > 0,
            canRename: selectedItems.length === 1 && !creatingItem,
            sortConfig,
            setSortConfig,
            viewMode,
            setViewMode,
            onMoreOptions: handleMoreOptions,
            canSelect: itemsToDisplay.length > 0,
            canDownload: selectedItems.length > 0,
          }}
        />
      </div>
      <div
        ref={fileAreaRef}
        className="flex-grow p-4 overflow-y-auto"
        onMouseDown={() => {
          if (!creatingItem && !renamingItemId) {
            setSelectedItems([]);
            setLastSelectedItem(null);
          } else if (creatingItem) {
            setCreatingItem(null);
            setSelectedItems([]);
            setLastSelectedItem(null);
            setRenamingItemId(null);
          }
        }}
      >
        <div
          className={
            viewMode === 'grid' && !searchQuery
              ? 'flex flex-wrap gap-4'
              : 'flex flex-col space-y-1'
          }
        >
          {isSearching && (
            <div className="w-full text-center text-gray-500">Searching...</div>
          )}
          {!isSearching &&
            itemsToDisplay.map((item) => {
              const actualItemId =
                creatingItem && item.id === creatingItem.tempId
                  ? creatingItem.tempId
                  : item.id;
              return (
                <FileItem
                  key={actualItemId}
                  {...{
                    item: item,
                    isSelected: selectedItems.includes(actualItemId),
                    isRenaming: renamingItemId === actualItemId,
                    onClick: handleItemClick,
                    onDoubleClick: () => handleDoubleClick(item),
                    onRenameSubmit: (name: string) => {
                      if (creatingItem?.tempId === actualItemId) {
                        handleCreateAndRename(name, creatingItem.type);
                      } else {
                        handleRename(name);
                      }
                    },
                    onRenameCancel: () => {
                      if (creatingItem?.tempId === actualItemId) {
                        setCreatingItem(null);
                        setSelectedItems([]);
                      }
                      setRenamingItemId(null);
                    },
                    viewMode: searchQuery ? 'list' : viewMode,
                    showPath: !!searchQuery,
                  }}
                />
              );
            })}
          {!isSearching && itemsToDisplay.length === 0 && (
            <div className="w-full text-center text-gray-500 mt-8">
              {searchQuery
                ? `No items match "${searchQuery}" in this folder or its subfolders.`
                : 'This folder is empty.'}
            </div>
          )}
        </div>
      </div>
      {editingFile && (
        <TextEditorModal
          file={editingFile}
          onClose={() => setEditingFile(null)}
          onSave={() => {
            alert('File saved successfully!');
          }}
        />
      )}
    </div>
  );
};

export default FilesView;
