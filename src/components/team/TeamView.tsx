import React, { useState } from 'react';
import { UserPlus, Eye, Mail, Trash2 } from 'lucide-react';
import UserDetailModal from './UserDetailModal';
import InviteUserModal from './InviteUserModal';
import { db, doc, deleteDoc } from '../../firebase/firestore';

// --- Define Props Interface ---
interface TeamViewProps {
  currentUser: any;
  users: any[];
  projects: any[];
  onUserAdded: () => void;
  isSuperuser: boolean;
  superuserInfo: { organization: string } | null;
}

function TeamView({ currentUser, users, projects, onUserAdded, isSuperuser, superuserInfo }: TeamViewProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showInviteUser, setShowInviteUser] = useState(false);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        onUserAdded(); // This will trigger a refetch of the users
      } catch (error) {
        console.error('Error removing user:', error);
      }
    }
  };

  const loggedInUserOrganization = isSuperuser
    ? superuserInfo?.organization
    : currentUser?.organization;

  const usersToDisplay = users.filter(user => {
    const isInOrganization = user.organization === loggedInUserOrganization;
    if (!isInOrganization) return false;
    if (isSuperuser && user.id === currentUser.id) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowInviteUser(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersToDisplay.length > 0 ? (
          usersToDisplay.map((user) => {
            const userProjects = projects.filter(p =>
              (p.assignedUsers && p.assignedUsers.includes(user.id)) || p.teamLead === user.id
            );

            return (
              <div key={user.id} className="bg-white dark:bg-dark-900/50 backdrop-blur-xl border border-gray-200 dark:border-dark-700 rounded-xl p-6 hover:border-primary-500/30 transition-all duration-300 group">
                {/* ... (User info, avatar, etc. - no changes here) ... */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-xl text-white font-bold">
                      {user.avatar}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-dark-900 ${
                      user.status === 'online' ? 'bg-green-400' :
                      user.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400 dark:bg-dark-400'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-800 dark:text-dark-50 font-semibold">{user.name}</h3>
                    <p className="text-gray-500 dark:text-dark-400 text-sm">{user.role}</p>
                    <p className="text-gray-400 dark:text-dark-500 text-xs">{user.email}</p>
                  </div>
                </div>

                {/* ... (Active Projects section - no changes here) ... */}
                <div className="mb-4">
                  <h4 className="text-gray-800 dark:text-dark-50 text-sm font-medium mb-2">Active Projects</h4>
                  <div className="space-y-1">
                    {userProjects.length > 0 ? (
                      <>
                        {userProjects.slice(0, 3).map((project: any) => (
                          <div key={project.id} className="text-gray-500 dark:text-dark-400 text-xs">
                            • {project.name}
                          </div>
                        ))}
                        {userProjects.length > 3 && (
                          <div className="text-gray-400 dark:text-dark-500 text-xs">
                            +{userProjects.length - 3} more projects
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 dark:text-dark-500 text-xs">No active projects.</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-700">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 text-gray-500 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-50 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {/* --- MODIFIED SECTION --- */}
                    {/* Only render the mail link if the user has an email */}
                    {user.email && (
                      <a 
                        href={`mailto:${user.email}`} 
                        className="p-2 text-gray-500 dark:text-dark-400 hover:text-gray-800 dark:hover:text-dark-50 hover:bg-gray-200 dark:hover:bg-dark-800 rounded-lg transition-all duration-200"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {isSuperuser && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-400/20 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'online' ? 'text-green-500 bg-green-100 dark:text-green-400 dark:bg-green-400/20' :
                    user.status === 'away' ? 'text-yellow-500 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/20' :
                    'text-gray-500 bg-gray-100 dark:text-dark-400 dark:bg-dark-400/20'
                  }`}>
                    {user.status}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 dark:text-dark-500">
            No other team members found in your organization.
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          projects={projects}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {showInviteUser && (
        <InviteUserModal
          currentUser={currentUser}
          onClose={() => setShowInviteUser(false)}
          onUserAdded={onUserAdded}
        />
      )}
    </div>
  );
}

export default TeamView;
