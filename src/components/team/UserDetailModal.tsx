import React from 'react';
import { X } from 'lucide-react';

interface UserDetailModalProps {
  user: any;
  projects: any[];
  onClose: () => void;
}

function UserDetailModal({ user, projects, onClose }: UserDetailModalProps) {
  // Assuming the user object has a 'projects' array of project IDs.
  // If not, you might need to filter projects based on the 'assignedUsers' array in each project.
  const userProjects = projects.filter(p => 
    (p.assignedUsers && p.assignedUsers.includes(user.id)) || p.teamLead === user.id
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-primary-700/30 rounded-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200 dark:border-primary-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black dark:text-dark-50">{user.name}</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-dark-400 hover:text-black dark:hover:text-dark-100 transition-colors duration-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-2xl text-white font-bold">
              {user.avatar}
            </div>
            <div>
              <h3 className="text-black dark:text-dark-50 font-semibold text-lg">{user.name}</h3>
              <p className="text-gray-600 dark:text-dark-400">{user.role}</p>
              <p className="text-gray-500 dark:text-dark-500 text-sm">{user.email}</p>
            </div>
          </div>

          <div>
            <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-gray-200 dark:bg-dark-800/50 text-gray-700 dark:text-dark-300 rounded-md">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Active Projects</h3>
            <div className="space-y-2">
              {userProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-dark-800/30 rounded-lg">
                  <div>
                    <p className="text-black dark:text-dark-50 font-medium">{project.name}</p>
                    <p className="text-gray-600 dark:text-dark-400 text-sm">{project.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-black dark:text-dark-50 text-sm">{project.progress}%</p>
                    <div className="w-16 bg-gray-200 dark:bg-dark-700 rounded-full h-1 mt-1">
                      <div 
                        className="bg-primary-500 h-1 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default UserDetailModal;
