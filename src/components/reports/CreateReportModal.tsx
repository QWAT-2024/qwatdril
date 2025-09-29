import React, { useState } from 'react';
import { db, collection, addDoc } from '../../firebase/firestore';
import { storage } from '../../firebase/firebase'; // Assuming you have a firebase.ts for storage config
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { X } from 'lucide-react';

interface CreateReportModalProps {
  currentUser: any;
  projects: any[];
  users: any[]; // Added users to props
  onClose: () => void;
  onReportAdded: () => void;
}

function CreateReportModal({ currentUser, projects, users, onClose, onReportAdded }: CreateReportModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projects.length > 0 ? projects[0].id : '',
    type: 'Progress',
    content: '',
    attachments: [] as { name: string; url: string }[], // Typed attachments
    author: currentUser?.id || '', // Set current user as default author
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    try {
      const attachments = await Promise.all(
        selectedFiles.map(async (file) => {
          const storageRef = ref(storage, `reports/${Date.now()}-${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return { name: file.name, url };
        })
      );

      await addDoc(collection(db, 'reports'), {
        ...formData,
        organization: currentUser.organization,
        status,
        date: new Date().toISOString().split('T')[0],
        attachments,
        gitCommits: 0,
        linesOfCode: 0,
        testsAdded: 0,
        bugsFixed: 0
      });
      onReportAdded();
      onClose();
    } catch (error) {     console.error("Error adding document: ", error);
    }
  };

  const inputClasses = "w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-800 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500";
  const labelClasses = "block text-sm font-medium mb-2 text-gray-800 dark:text-dark-100";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-dark-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create New Report</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors duration-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <form className="space-y-4">
            <div>
              <label className={labelClasses}>Report Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className={`${inputClasses} h-24`}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Project</label>
                <select name="projectId" value={formData.projectId} onChange={handleInputChange} className={inputClasses}>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Report Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className={inputClasses}>
                  <option>Progress</option>
                  <option>Security</option>
                  <option>Performance</option>
                  <option>Bug</option>
                  <option>Technical</option>
                  <option>Completion</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClasses}>Content</label>
              <textarea name="content" value={formData.content} onChange={handleInputChange} className={`${inputClasses} h-32`}></textarea>
            </div>
            <div>
              <label className={labelClasses}>Upload Attachment</label>
              <input type="file" multiple onChange={handleFileChange} className="w-full text-gray-500 dark:text-dark-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700 transition-colors duration-200"/>
              {selectedFiles.length > 0 && (
                <div className="text-gray-500 dark:text-dark-400 text-xs mt-1">
                  Selected files: {selectedFiles.map(file => file.name).join(', ')}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={(e) => handleSubmit(e, 'draft')} className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-dark-100 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors duration-200">
                Save as Draft
              </button>
              <button type="button" onClick={(e) => handleSubmit(e, 'published')} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Publish Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateReportModal;
