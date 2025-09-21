import React from 'react';
import { FolderOpen, Plus, Users, FileText, UserPlus } from 'lucide-react';
import ProjectStatusChart from './ProjectStatusChart';

// Define an interface for the component's props for type safety
interface DashboardViewProps {
  projects: any[];
  users: any[];
  reports: any[];
  setCurrentView: (view: string) => void;
  superusers: { id: string; email: string; organization: string; }[];
}

function DashboardView({ projects, users, reports, setCurrentView, superusers }: DashboardViewProps) {
  const superuserEmails = superusers.map(su => su.email);
  const teamMembers = users.filter(u => !superuserEmails.includes(u.email));

  const stats = [
    {
      label: 'Active Projects',
      value: projects.filter(p => p.status === 'in-progress').length,
      icon: FolderOpen,
      color: 'text-primary-400', // Changed to primary blue
      bg: 'bg-primary-400/20',     // Changed to primary blue
    },
    {
      label: 'Team Members',
      value: teamMembers.length,
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-400/20',
    },
    {
      label: 'Reports Published',
      value: reports.filter(r => r.status === 'published').length,
      icon: FileText,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/20',
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-300 dark:border-dark-700 rounded-xl p-6 hover:border-primary-500/30 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-dark-400 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-black dark:text-dark-50 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Overview & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-300 dark:border-dark-700 rounded-xl p-6 hover:border-primary-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black dark:text-dark-50">Active Projects</h3>
            <button onClick={() => setCurrentView('projects')} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200">View All</button>
          </div>
          <div className="space-y-4">
            {projects.filter(p => p.status === 'in-progress').map((project) => (
              <div key={project.id} className="p-4 bg-gray-100 dark:bg-dark-800/30 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-800/50 transition-all duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-black dark:text-dark-50 font-medium">{project.name}</h4>
                  <span className="text-gray-600 dark:text-dark-400 text-sm">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {(project.assignedUsers || []).slice(0, 3).map((userId: string, idx: number) => {
                      const user = users.find(u => u.id === userId);
                      return (
                        <div key={idx} className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xs text-white border-2 border-white dark:border-dark-900">
                          {user?.avatar}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-gray-600 dark:text-dark-400 text-sm">Due: {project.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-300 dark:border-dark-700 rounded-xl p-6 hover:border-primary-500/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black dark:text-dark-50">Recent Reports</h3>
            <button onClick={() => setCurrentView('reports')} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200">View All</button>
          </div>
          <div className="space-y-3">
            {reports.slice(0, 3).map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-dark-800/30 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-800/50 transition-all duration-200">
                <div className="flex-1">
                  <p className="text-black dark:text-dark-50 font-medium">{report.title}</p>
                  <p className="text-gray-600 dark:text-dark-400 text-sm">by {users.find(u => u.id === report.author)?.name}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.type === 'progress' ? 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-400/20' :
                    report.type === 'security' ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-400/20' :
                    report.type === 'performance' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-400/20' :
                    'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/20'
                  }`}>
                    {report.type}
                  </span>
                  <p className="text-gray-600 dark:text-dark-400 text-xs mt-1">{report.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Status */}
        <div className="bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-300 dark:border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black dark:text-dark-50">Team Status</h3>
            <button onClick={() => setCurrentView('team')} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors duration-200">View All</button>
          </div>
          <div className="space-y-3">
            {teamMembers.slice(0, 4).map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-sm text-white">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-black dark:text-dark-50 text-sm font-medium">{user.name}</p>
                  <p className="text-gray-600 dark:text-dark-400 text-xs">{user.role}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  user.status === 'online' ? 'bg-green-400' :
                  user.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400 dark:bg-dark-500'
                }`}></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-300 dark:border-dark-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-black dark:text-dark-50 mb-4">Project Status</h3>
          <ProjectStatusChart projects={projects} />
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
