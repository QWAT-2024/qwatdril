import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import ThemeToggleButton from './ThemeToggleButton';

interface HeaderProps {
  currentView: string;
  setSidebarOpen: (isOpen: boolean) => void;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setSidebarOpen, showProfileDropdown, setShowProfileDropdown }) => {
  return (
    <header className="bg-gray-100 dark:bg-dark-950/80 backdrop-blur-xl border-b border-gray-300 dark:border-primary-900/40 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-800 dark:text-dark-300 hover:text-black dark:hover:text-white transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold capitalize text-black dark:text-dark-50">{currentView}</h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-dark-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects, reports, team..."
              className="pl-10 pr-4 py-2 w-80 bg-gray-200 dark:bg-dark-800/50 border border-gray-300 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 placeholder-gray-500 dark:placeholder-dark-400 transition-all duration-200 text-black dark:text-dark-50"
            />
          </div> */}
          {/* <button className="relative p-2 text-gray-800 dark:text-dark-300 hover:text-white dark:hover:text-white hover:bg-primary-600 dark:hover:bg-dark-800/50 rounded-lg transition-all duration-200">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></span>
          </button> */}
          <ThemeToggleButton />
          <button onClick={() => setShowProfileDropdown(!showProfileDropdown)} className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
