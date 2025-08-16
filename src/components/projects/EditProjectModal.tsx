// src/components/projects/EditProjectModal.tsx
import React, { useState } from 'react';
import { db, doc, updateDoc } from '../../firebase/firestore';
import { X } from 'lucide-react';

interface EditProjectModalProps {
  project: any;
  users: any[];
  reports: any[];
  onClose: () => void;
  onProjectUpdated: () => void;
  isSuperuser: boolean;
  currentUser: any;
}

function EditProjectModal({ project, users, reports, onClose, onProjectUpdated, isSuperuser }: EditProjectModalProps) {
  const [formData, setFormData] = useState(project);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData((prev: any) => ({ ...prev, assignedUsers: selectedOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, formData);
      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const inputStyles = "w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-black dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-primary-700/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-primary-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black dark:text-dark-50">Edit Project</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-dark-400 hover:text-black dark:hover:text-dark-100 transition-colors duration-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Project Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputStyles} />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className={`${inputStyles} h-24`}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Git Repository</label>
                <input type="url" name="gitRepository" value={formData.gitRepository} onChange={handleInputChange} className={inputStyles} />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Live URL</label>
                <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleInputChange} className={inputStyles} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange} className={inputStyles}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className={inputStyles} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className={inputStyles}>
                  <option>planning</option>
                  <option>in-progress</option>
                  <option>completed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Progress</label>
                <input type="number" name="progress" value={formData.progress} onChange={handleInputChange} className={inputStyles} />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Team Members</label>
              <select multiple name="assignedUsers" value={formData.assignedUsers} onChange={handleMultiSelectChange} className={`${inputStyles} h-32`} size={4}>
                {users.map((user: any) => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
              <p className="text-gray-500 dark:text-dark-400 text-xs mt-1">Hold Ctrl/Cmd to select multiple members</p>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Team Lead</label>
              <select 
                name="teamLead" 
                value={formData.teamLead} 
                onChange={handleInputChange} 
                disabled={!isSuperuser}
                className={`${inputStyles} disabled:bg-gray-200 dark:disabled:bg-dark-800/50 disabled:cursor-not-allowed`}
              >
                <option value="">Select Team Lead</option>
                {users.map((user: any) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              {!isSuperuser && (
                 <p className="text-gray-500 dark:text-dark-400 text-xs mt-1">Only a superuser can change the project's Team Lead.</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Technologies (comma-separated)</label>
              <input type="text" name="technologies" value={Array.isArray(formData.technologies) ? formData.technologies.join(', ') : ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, technologies: e.target.value.split(',').map(tech => tech.trim()) }))} className={inputStyles} />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-dark-300 text-sm font-medium mb-2">Reports</label>
              <select multiple name="reports" value={formData.reports.map((r: any) => r.id)} onChange={(e) => {
                const selectedReportIds = Array.from(e.target.selectedOptions, option => option.value);
                const selectedReports = reports.filter((r: any) => selectedReportIds.includes(r.id));
                setFormData((prev: any) => ({ ...prev, reports: selectedReports }));
              }} className={`${inputStyles} h-32`} size={4}>
                {reports.map((report: any) => (
                  <option key={report.id} value={report.id}>{report.title}</option>
                ))}
              </select>
              <p className="text-gray-500 dark:text-dark-400 text-xs mt-1">Hold Ctrl/Cmd to select multiple reports</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-black dark:text-dark-100 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors duration-200">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Update Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProjectModal;
