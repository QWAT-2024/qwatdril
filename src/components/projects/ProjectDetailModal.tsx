import React from 'react';
import { X, GitBranch, Globe, Monitor, ExternalLink, Paperclip, Download } from 'lucide-react';

interface ProjectDetailModalProps {
  project: any;
  users: any[];
  reports: any[];
  onClose: () => void;
}

function ProjectDetailModal({ project, users, reports, onClose }: ProjectDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-primary-700/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-primary-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black dark:text-dark-50">{project.name}</h2>
            <button onClick={onClose} className="text-gray-500 dark:text-dark-400 hover:text-black dark:hover:text-dark-100 transition-colors duration-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Project Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Status:</span>
                  <span className="text-black dark:text-dark-50">{project.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Priority:</span>
                  <span className="text-black dark:text-dark-50">{project.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Progress:</span>
                  <span className="text-black dark:text-dark-50">{project.progress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Start Date:</span>
                  <span className="text-black dark:text-dark-50">{project.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-400">Due Date:</span>
                  <span className="text-black dark:text-dark-50">{project.dueDate}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Links</h3>
              <div className="space-y-2">
                <a href={project.gitRepository} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  <GitBranch className="w-4 h-4" />
                  <span>Git Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                    <Globe className="w-4 h-4" />
                    <span>Live Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {project.stagingUrl && (
                  <a href={project.stagingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                    <Monitor className="w-4 h-4" />
                    <span>Staging</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Team */}
          <div>
            <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Team Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.assignedUsers.length > 0 ? (
                project.assignedUsers.map((userId: string) => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <div key={userId} className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-dark-800/30 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-medium">
                        {user?.avatar}
                      </div>
                      <div>
                        <p className="text-black dark:text-dark-50 font-medium">{user?.name}</p>
                        <p className="text-gray-600 dark:text-dark-400 text-sm">{user?.role}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600 dark:text-dark-400 text-sm">No team members assigned.</p>
              )}
            </div>
          </div>

          {/* Team Lead */}
          {project.teamLead && (
            <div>
              <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Team Lead</h3>
              <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-dark-800/30 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-medium">
                  {users.find(u => u.id === project.teamLead)?.avatar}
                </div>
                <div>
                  <p className="text-black dark:text-dark-50 font-medium">{users.find(u => u.id === project.teamLead)?.name}</p>
                  <p className="text-gray-600 dark:text-dark-400 text-sm">{users.find(u => u.id === project.teamLead)?.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Technologies */}
          <div>
            <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Technologies</h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-gray-200 dark:bg-dark-800/50 text-gray-700 dark:text-dark-300 rounded-md">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          {reports && reports.length > 0 && (
            <div>
              <h3 className="text-black dark:text-dark-50 font-semibold mb-3">Recent Reports</h3>
              <div className="space-y-2">
                {reports.map((report: any) => (
                  <div key={report.id} className="p-3 bg-gray-100 dark:bg-dark-800/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-black dark:text-dark-50 font-medium">{report.title}</p>
                        <p className="text-gray-600 dark:text-dark-400 text-sm">{report.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.type === 'progress' ? 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-400/20' :
                        report.type === 'bug' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-400/20' :
                        'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-400/20'
                      }`}>
                        {report.type}
                      </span>
                    </div>
                    {report.attachments && report.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {report.attachments.map((attachment: { name: string, url: string }, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-200 dark:bg-dark-700/50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Paperclip className="w-4 h-4 text-gray-500 dark:text-dark-400" />
                              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-black dark:text-dark-50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                {attachment.name}
                              </a>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200">
                                View
                              </a>
                              <a href={attachment.url} download={attachment.name} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200">
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailModal;
