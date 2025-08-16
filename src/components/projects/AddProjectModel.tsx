import React, { useState } from 'react';
import { db, collection, addDoc } from '../../firebase/firestore';
import { X } from 'lucide-react';

interface AddProjectModalProps {
  currentUser: any;
  users: any[];
  reports: any[];
  onClose: () => void;
  onProjectAdded: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ currentUser, users, reports, onClose, onProjectAdded }) => {
   const [formData, setFormData] = useState({
     name: '',
     description: '',
     gitRepository: '',
     liveUrl: '',
     priority: 'Medium',
     dueDate: '',
     status: 'planning',
     progress: 0,
     assignedUsers: [] as string[],
     teamLead: '',
     technologies: [] as string[],
     reports: [] as any[]
   });
 
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     setFormData((prev: any) => ({ ...prev, [name]: value }));
   };
 
   const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
     const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
     setFormData((prev: any) => ({ ...prev, assignedUsers: selectedOptions }));
   };
 
 // In your AddProjectModal component
 
 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
 
   // FIX: Add a guard clause to validate the organization field.
   if (!currentUser || !currentUser.organization) {
     console.error("Cannot create project: The current user's organization is not defined.");
     // In a production app, you would want to show an error message to the user in the UI.
     return;
   }
 
   try {
     await addDoc(collection(db, 'projects'), {
       ...formData,
       // Now we are certain that currentUser.organization has a valid value.
       organization: currentUser.organization,
       collaborators: [],
       startDate: new Date().toISOString().split('T')[0],
       technologies: formData.technologies,
       reports: formData.reports,
       files: []
     });
     onProjectAdded();
     onClose();
   } catch (error) {
     console.error("Error adding document: ", error);
   }
 };
 
  const inputClasses = "w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-800 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500";
  const labelClasses = "block text-sm font-medium mb-2 text-gray-800 dark:text-dark-100";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-dark-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create New Project</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors duration-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClasses}>Project Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className={`${inputClasses} h-24`}></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Git Repository</label>
                <input type="url" name="gitRepository" value={formData.gitRepository} onChange={handleInputChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Live URL</label>
                <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleInputChange} className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleInputChange} className={inputClasses}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className={inputClasses}>
                  <option>planning</option>
                  <option>in-progress</option>
                  <option>completed</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Progress (%)</label>
                <input type="number" name="progress" value={formData.progress} onChange={handleInputChange} min="0" max="100" className={inputClasses} />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Team Members</label>
              <select multiple name="assignedUsers" onChange={handleMultiSelectChange} className={`${inputClasses} h-32`} size={4}>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Hold Ctrl/Cmd to select multiple members</p>
            </div>
            <div>
              <label className={labelClasses}>Team Lead</label>
              <select name="teamLead" value={formData.teamLead} onChange={handleInputChange} className={inputClasses}>
                <option value="">Select Team Lead</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Technologies (comma-separated)</label>
              <input type="text" name="technologies" value={formData.technologies.join(', ')} onChange={(e) => setFormData((prev: any) => ({ ...prev, technologies: e.target.value.split(',').map(tech => tech.trim()) }))} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Reports</label>
              <select multiple name="reports" onChange={(e) => {
                const selectedReportIds = Array.from(e.target.selectedOptions, option => option.value);
                const selectedReports = reports.filter((r: any) => selectedReportIds.includes(r.id));
                setFormData((prev: any) => ({ ...prev, reports: selectedReports }));
              }} className={`${inputClasses} h-32`} size={4}>
                {reports.map((report: any) => (
                  <option key={report.id} value={report.id}>{report.title}</option>
                ))}
              </select>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Hold Ctrl/Cmd to select multiple reports</p>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-dark-800 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-dark-700 transition-colors duration-200">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProjectModal;
