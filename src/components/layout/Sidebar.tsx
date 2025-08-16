import React from 'react';
import { auth } from '../../firebase/auth';
import { Home, FolderOpen, FileText, Users, MessageSquare, Archive, Calendar, Settings, Zap, X, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  menuItems: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, sidebarOpen, setSidebarOpen, menuItems }) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-100 dark:bg-dark-950/80 backdrop-blur-xl border-r border-gray-300 dark:border-primary-900/40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-primary-900/50">
        <div className="flex items-center space-x-3">
          <img src="https://firebasestorage.googleapis.com/v0/b/qwat-9aaab.appspot.com/o/Qwat%20innovations%2FLogo-dark.svg?alt=media&token=3c95d22b-8feb-473c-917f-deda4ed417ef" alt="Qwatdril Logo" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold text-black dark:text-dark-50">
              <span className="text-black text-2xl dark:text-dark-50 font-serif-custom">Qwat</span>
              <span className="text-primary-500 text-2xl font-serif-custom">dril</span>
            </h1>
            <p className="text-xs text-gray-600 dark:text-dark-400">Project Management</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-600 dark:text-dark-400 hover:text-black dark:hover:text-white transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.id} className="relative">
            <button
              onClick={() => {
                setCurrentView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-primary-100 dark:bg-primary-600/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-600/30'
                  : 'text-gray-700 dark:text-dark-300 hover:text-white dark:hover:text-white hover:bg-primary-600 dark:hover:bg-dark-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
            {currentView === item.id && (
              <>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-primary-500" />
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-primary-500" />
              </>
            )}
          </div>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-dark-300 hover:text-white dark:hover:text-white hover:bg-primary-600 dark:hover:bg-dark-800/50 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
