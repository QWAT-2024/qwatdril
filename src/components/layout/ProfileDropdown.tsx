import React from 'react';
import { User, LogOut } from 'lucide-react';
import { auth } from '../../firebase/auth';

interface ProfileDropdownProps {
  currentUser: any;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ currentUser }) => {
  return (
    <div className="absolute top-14 right-0 w-64 bg-white dark:bg-dark-900/80 backdrop-blur-xl border border-gray-200 dark:border-primary-900/40 rounded-xl shadow-lg z-[100]">
      <div className="p-4 border-b border-gray-200 dark:border-primary-900/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-dark-900 ${
              currentUser.status === 'online' ? 'bg-green-400' : 'bg-gray-400 dark:bg-dark-400'
            }`}></div>
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-black dark:text-dark-50 truncate">{currentUser.name}</p>
            <p className="text-gray-600 dark:text-dark-300 text-sm truncate">{currentUser.email}</p>
            <p className="text-gray-500 dark:text-dark-400 text-xs capitalize">{currentUser.role} - {currentUser.status}</p>
          </div>
        </div>
      </div>
      <div className="p-2">
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-dark-300 hover:text-white dark:hover:text-white hover:bg-primary-600 dark:hover:bg-dark-800/50 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
