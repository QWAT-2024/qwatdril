// src/components/projects/ProjectsView.tsx
import React, { useState } from 'react';
import { db, doc, deleteDoc } from '../../firebase/firestore';
import { Plus, GitBranch, Globe, Monitor, Eye, Edit, Trash2, ExternalLink, ListChecks } from 'lucide-react';
import ProjectDetailModal from './ProjectDetailModal';
import AddProjectModal from './AddProjectModel';
import EditProjectModal from './EditProjectModal';
import TaskModal from './TaskModal';

// --- Define Props Interface ---
interface ProjectsViewProps {
  currentUser: any;
  projects: any[];
  users: any[];
  reports: any[];
  onProjectAdded: () => void;
  isSuperuser: boolean;
  superuserInfo: { organization: string } | null;
}

function ProjectsView({ currentUser, projects, users, reports, onProjectAdded, isSuperuser, superuserInfo }: ProjectsViewProps) {
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // --- Filter Projects Based on User Role ---
  const projectsToDisplay = Array.isArray(projects) ? (isSuperuser
    // Superusers see all projects from their organization
    ? projects.filter(p => p.organization === superuserInfo?.organization)
    // Regular users see only projects they are assigned to
    : currentUser
      ? projects.filter(p =>
          (p.assignedUsers && p.assignedUsers.includes(currentUser.id)) ||
          p.teamLead === currentUser.id
        )
      : []) : [];

  // --- Open Modals ---
  const handleViewProject = (project: any) => {
    setSelectedProject(project);
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setShowEditProject(true);
  };

  const handleShowTasks = (project: any) => {
    setSelectedProject(project);
    setShowTaskModal(true);
  };

  // --- Close Modals ---
  const handleCloseAllModals = () => {
    setSelectedProject(null);
    setShowAddProject(false);
    setShowEditProject(false);
    setShowTaskModal(false);
  };


  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Show "New Project" button only to superusers */}
          {isSuperuser && (
            <button
              onClick={() => setShowAddProject(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projectsToDisplay.length > 0 ? (
          projectsToDisplay.map((project) => (
            <div key={project.id} className="bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-200 dark:border-dark-700 rounded-xl p-6 hover:border-primary-500/30 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-gray-800 dark:text-dark-50 font-semibold mb-2">{project.name}</h3>
                  <p className="text-gray-500 dark:text-dark-400 text-sm mb-3">{project.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'completed' ? 'text-green-500 bg-green-100 dark:text-green-400 dark:bg-green-400/20' :
                  project.status === 'in-progress' ? 'text-blue-500 bg-blue-100 dark:text-blue-400 dark:bg-blue-400/20' :
                  project.status === 'planning' ? 'text-yellow-500 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/20' :
                  'text-blue-500 bg-blue-100 dark:text-blue-400 dark:bg-blue-400/20'
                }`}>
                  {project.status}
                </span>
              </div>

              {/* Project Links */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-gray-400 dark:text-dark-400" />
                  <a href={project.gitRepository} target="_blank" rel="noopener noreferrer" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm transition-colors duration-200 flex items-center space-x-1">
                    <span>Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {project.liveUrl && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400 dark:text-dark-400" />
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm transition-colors duration-200 flex items-center space-x-1">
                      <span>Live Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {project.stagingUrl && (
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-gray-400 dark:text-dark-400" />
                    <a href={project.stagingUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm transition-colors duration-200 flex items-center space-x-1">
                      <span>Staging</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 dark:text-dark-400 text-sm">Progress</span>
                  <span className="text-gray-800 dark:text-dark-50 text-sm font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Team Members */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-dark-400 text-sm">Team:</span>
                  <div className="flex -space-x-2">
                    {project.assignedUsers.slice(0, 3).map((userId: string, idx: number) => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <div key={idx} className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xs text-white border-2 border-white dark:border-dark-900">
                          {user?.avatar}
                        </div>
                      );
                    })}
                    {project.assignedUsers.length > 3 && (
                      <div className="w-6 h-6 bg-gray-300 dark:bg-dark-700 rounded-full flex items-center justify-center text-xs text-white border-2 border-white dark:border-dark-900">
                        +{project.assignedUsers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.priority === 'high' ? 'text-blue-500 bg-blue-100 dark:text-blue-400 dark:bg-blue-400/20' :
                  project.priority === 'medium' ? 'text-yellow-500 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/20' :
                  'text-blue-500 bg-blue-100 dark:text-blue-400 dark:bg-blue-400/20'
                }`}>
                  {project.priority}
                </span>
              </div>

              {/* Technologies */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 3).map((tech: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-gray-200 dark:bg-dark-800/50 text-gray-600 dark:text-dark-300 text-xs rounded-md">
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 bg-gray-200 dark:bg-dark-800/50 text-gray-600 dark:text-dark-300 text-xs rounded-md">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-700">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShowTasks(project)}
                    className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 text-sm font-medium flex items-center space-x-1"
                  >
                    <ListChecks className="w-4 h-4" />
                    <span>Tasks</span>
                  </button>
                  <button
                    onClick={() => handleViewProject(project)}
                    className="p-2 text-gray-500 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-50 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {(isSuperuser || project.teamLead === currentUser?.id) && (
                    <button onClick={() => handleEditProject(project)} className="p-2 text-gray-500 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-50 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {isSuperuser && (
                    <button onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this project?')) {
                        await deleteDoc(doc(db, 'projects', project.id));
                        onProjectAdded();
                      }
                    }} className="p-2 text-gray-500 dark:text-dark-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                </div>
                <span className="text-gray-500 dark:text-dark-400 text-sm">Due: {project.dueDate}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-dark-500">
            {isSuperuser ? 'No projects found for this organization.' : 'No projects are assigned to you.'}
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      {selectedProject && !showEditProject && !showTaskModal && (
        <ProjectDetailModal
          project={selectedProject}
          users={users}
          reports={reports.filter(r => r.projectId === selectedProject.id)}
          onClose={handleCloseAllModals}
        />
      )}

      {showAddProject && (
        <AddProjectModal
          currentUser={currentUser}
          users={users}
          reports={reports}
          onClose={() => setShowAddProject(false)}
          onProjectAdded={onProjectAdded}
        />
      )}

      {showEditProject && selectedProject && (
        <EditProjectModal
          project={selectedProject}
          users={users}
          reports={reports}
          onClose={handleCloseAllModals}
          onProjectUpdated={onProjectAdded}
          isSuperuser={isSuperuser}
          currentUser={currentUser}
        />
      )}

      {showTaskModal && selectedProject && (
        <TaskModal
          project={selectedProject}
          onClose={handleCloseAllModals}
          isSuperuser={isSuperuser}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}

export default ProjectsView;
