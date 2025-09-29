import React from 'react';
import { Bell } from 'lucide-react';

interface Notification {
  title: string;
  body: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications }) => {
  return (
    <div className="absolute top-12 right-0 w-80 bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-xl shadow-lg z-[100]">
      <div className="p-4 border-b border-gray-800">
        <h4 className="font-semibold text-white">Notifications</h4>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div key={index} className="p-4 border-b border-gray-800/50 hover:bg-gray-800/50">
              <p className="font-bold text-white">{notif.title}</p>
              <p className="text-gray-400 text-sm">{notif.body}</p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2" />
            No new notifications
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
