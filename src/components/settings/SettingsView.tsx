import React from 'react';
import { User, FolderOpen, Users, GitBranch, Bell, Shield } from 'lucide-react';

function SettingsView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Profile Settings', icon: User, description: 'Update your personal information and preferences' },
          { title: 'Project Settings', icon: FolderOpen, description: 'Configure default project settings and templates' },
          { title: 'Team Management', icon: Users, description: 'Manage team permissions and access levels' },
          { title: 'Git Integration', icon: GitBranch, description: 'Connect and configure Git repositories' },
          { title: 'Notifications', icon: Bell, description: 'Customize notification preferences' },
          { title: 'Security', icon: Shield, description: 'Manage security settings and authentication' }
        ].map((setting, index) => (
          <div key={index} className="bg-dark-900/50 backdrop-blur-xl border border-dark-700 rounded-xl p-6 hover:border-primary-500/30 transition-all duration-300">
            {/* Icon updated to primary blue */}
            <setting.icon className="w-12 h-12 text-primary-400 mb-4" />
            {/* Text colors updated to the dark theme palette */}
            <h3 className="text-lg font-semibold text-dark-50 mb-2">{setting.title}</h3>
            <p className="text-dark-400 text-sm mb-4">{setting.description}</p>
            {/* Button color updated to primary blue */}
            <button className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors duration-200">
              Configure →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SettingsView;