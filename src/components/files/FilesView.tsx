import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, BookOpen, Layers, File, Eye, Download, Share2, Trash2, Folder } from 'lucide-react';
import { storage } from '../../firebase/firebase';
import CreateFolderModal from './CreateFolderModal';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, doc, setDoc, collection, addDoc, query, where, onSnapshot, deleteDoc, getDocs } from '../../firebase/firestore';

interface FilesViewProps {
  projects: any[];
  users: any[];
  currentUser: any;
}

function FilesView({ projects, users, currentUser }: FilesViewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (!currentUser?.organization) return;

    const filesQuery = query(collection(db, "files"), where("organization", "==", currentUser.organization), where("path", "==", currentPath));
    const filesUnsubscribe = onSnapshot(filesQuery, (querySnapshot) => {
      const orgFiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isFolder: false }));
      setFiles(orgFiles);
    });

    const foldersQuery = query(collection(db, "folders"), where("organization", "==", currentUser.organization), where("path", "==", currentPath));
    const foldersUnsubscribe = onSnapshot(foldersQuery, (querySnapshot) => {
      const orgFolders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isFolder: true }));
      setFolders(orgFolders);
    });

    return () => {
      filesUnsubscribe();
      foldersUnsubscribe();
    };
  }, [currentUser?.organization, currentPath]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !currentUser?.organization) {
      console.error("File or user organization not found.");
      return;
    }

    const storageRef = ref(storage, `${currentUser.organization}${currentPath}/${Date.now()}-${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await addDoc(collection(db, "files"), {
            name: selectedFile.name,
            url: downloadURL,
            uploadedBy: currentUser.id,
            organization: currentUser.organization,
            size: selectedFile.size,
            type: selectedFile.type,
            createdAt: new Date(),
            path: currentPath,
          });
          setSelectedFile(null);
          setUploadProgress(0);
        });
      }
    );
  };

  const handleView = (url: string) => {
    window.open(url, '_blank');
  };

  const handleCreateFolder = async (folderName: string) => {
    if (!currentUser?.organization) {
      console.error("User organization not found.");
      return;
    }
    try {
      await addDoc(collection(db, "folders"), {
        name: folderName,
        organization: currentUser.organization,
        path: currentPath,
        createdAt: new Date(),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDelete = async (item: any) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      if (item.isFolder) {
        await deleteFolder(item);
      } else {
        const fileRef = ref(storage, item.url);
        await deleteObject(fileRef);
        await deleteDoc(doc(db, "files", item.id));
      }
    }
  };

  const deleteFolder = async (folder: any) => {
    const folderPath = `${folder.path}/${folder.name}`;
    
    // Delete subfolders
    const subfoldersQuery = query(collection(db, "folders"), where("organization", "==", currentUser.organization), where("path", "==", folderPath));
    const subfoldersSnapshot = await getDocs(subfoldersQuery);
    subfoldersSnapshot.forEach(async (subfolderDoc) => {
      await deleteFolder({ id: subfolderDoc.id, ...subfolderDoc.data() });
    });

    // Delete files in folder
    const filesQuery = query(collection(db, "files"), where("organization", "==", currentUser.organization), where("path", "==", folderPath));
    const filesSnapshot = await getDocs(filesQuery);
    filesSnapshot.forEach(async (fileDoc) => {
      const file = { id: fileDoc.id, ...fileDoc.data() };
      const fileRef = ref(storage, (file as any).url);
      await deleteObject(fileRef);
      await deleteDoc(doc(db, "files", file.id));
    });

    // Delete the folder itself
    await deleteDoc(doc(db, "folders", folder.id));
  };

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-dark-400">
        <span onClick={() => setCurrentPath('')} className="cursor-pointer hover:text-primary-500">Root</span>
        {breadcrumbs.map((crumb, index) => {
          const path = `/${breadcrumbs.slice(0, index + 1).join('/')}`;
          return (
            <React.Fragment key={index}>
              <span>/</span>
              <span onClick={() => setCurrentPath(path)} className="cursor-pointer hover:text-primary-500">{crumb}</span>
            </React.Fragment>
          );
        })}
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsModalOpen(true)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 cursor-pointer">
            <Folder className="w-5 h-5" />
            <span>Create Folder</span>
          </button>
          <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>Choose File</span>
          </label>
          {selectedFile && (
            <div className="flex items-center space-x-2">
              <span className="text-dark-100">{selectedFile.name}</span>
              <button onClick={handleUpload} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                Upload
              </button>
            </div>
          )}
        </div>
      </div>
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 dark:bg-dark-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {/* Files Grid */}
      {folders.length > 0 || files.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {[...folders, ...files].map((item) => {
            if (item.isFolder) {
              return (
                <div key={item.id} className="relative text-center group">
                  <div onClick={() => setCurrentPath(`${currentPath}/${item.name}`)} className="p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 cursor-pointer">
                    <Folder className="w-16 h-16 text-primary-500 dark:text-primary-400 mx-auto" />
                    <h3 className="text-gray-800 dark:text-dark-50 font-medium mt-2">{item.name}</h3>
                  </div>
                  <button onClick={() => handleDelete(item)} className="absolute top-0 right-0 p-1 bg-white dark:bg-dark-800 rounded-full text-gray-500 dark:text-dark-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            const uploader = users.find(u => u.id === item.uploadedBy);
            const fileExtension = item.name.split('.').pop()?.toLowerCase();
            
            return (
              <div key={item.id} className="bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-200 dark:border-dark-700 rounded-xl p-6 hover:border-primary-500/30 transition-all duration-300 group" style={{ flexBasis: '300px' }}>
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-dark-800/50 rounded-lg flex items-center justify-center">
                    {fileExtension === 'pdf' && <FileText className="w-6 h-6 text-primary-500 dark:text-primary-400" />}
                    {fileExtension === 'fig' && <Image className="w-6 h-6 text-purple-500 dark:text-purple-400" />}
                    {fileExtension === 'md' && <BookOpen className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
                    {fileExtension === 'sketch' && <Layers className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />}
                    {!['pdf', 'fig', 'md', 'sketch'].includes(fileExtension || '') && <File className="w-6 h-6 text-gray-500 dark:text-dark-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-800 dark:text-dark-50 font-medium mb-1">{item.name}</h3>
                    <p className="text-gray-500 dark:text-dark-400 text-sm">{(item.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-dark-400 text-sm">Uploaded by:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xs text-white">
                        {uploader?.avatar}
                      </div>
                      <span className="text-gray-800 dark:text-dark-50 text-sm">{uploader?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-dark-400 text-sm">Date:</span>
                    <span className="text-gray-800 dark:text-dark-50 text-sm">{new Date(item.createdAt.seconds * 1000).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-700">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleView(item.url)} className="p-2 text-gray-500 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-50 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item)} className="p-2 text-gray-500 dark:text-dark-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-dark-400">
          <p>This folder is empty.</p>
        </div>
      )}
      <CreateFolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateFolder}
      />
    </div>
  );
}

export default FilesView;
