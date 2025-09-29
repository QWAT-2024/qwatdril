import React, { useState } from 'react';
import { db, doc, updateDoc } from '../../firebase/firestore';
import { X } from 'lucide-react';

interface EditReportModalProps {
  report: any;
  projects: any[];
  users: any[];
  onClose: () => void;
  onReportUpdated: () => void;
}

function EditReportModal({ report, projects, users, onClose, onReportUpdated }: EditReportModalProps) {
  const [formData, setFormData] = useState(report);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reportRef = doc(db, 'reports', report.id);
      await updateDoc(reportRef, formData);
      onReportUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const inputStyles = "w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-black dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500";
  const labelStyles = "block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-primary-700/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-primary-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black dark:text-dark-50">Edit Report</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-dark-400 hover:text-black dark:hover:text-dark-100 transition-colors duration-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelStyles}>Report Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputStyles} />
            </div>
            <div>
              <label className={labelStyles}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className={`${inputStyles} h-24`}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelStyles}>Project</label>
                <select name="projectId" value={formData.projectId} onChange={handleInputChange} className={inputStyles}>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyles}>Author</label>
                <select name="author" value={formData.author} onChange={handleInputChange} className={inputStyles}>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelStyles}>Report Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className={inputStyles}>
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
              <label className={labelStyles}>Content</label>
              <textarea name="content" value={formData.content} onChange={handleInputChange} className={`${inputStyles} h-32`}></textarea>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-black dark:text-dark-100 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors duration-200">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Update Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditReportModal;
