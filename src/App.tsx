// src/App.tsx

import React, { useState, useEffect, useRef } from 'react';
import { auth } from './firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { db, collection, getDocs, query, where, onSnapshot, writeBatch, doc, updateDoc } from './firebase/firestore';
import { rtdb } from './firebase/firebase';
import { ref, onValue, set, onDisconnect } from "firebase/database";
import ProjectsView from './components/projects/ProjectsView';
import ReportsView from './components/reports/ReportsView';
import TeamView from './components/team/TeamView';
import FilesView from './components/files/FilesView';
import CollaborationView from './components/collaboration/CollaborationView';
import SettingsView from './components/settings/SettingsView';
import { LoginPage } from './components/auth/LoginPage';
import {
  Users,
  Calendar,
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  MessageSquare,
  Zap,
  Home,
  FolderOpen,
  Archive,
  Database,
} from 'lucide-react';
import MyCalendar from './components/calender/Calendar';
import DashboardView from './components/dashboard/DashboardView';
import TaskDatabaseView from './components/tasks/TaskDatabaseView';
import Admin from './components/admin/Admin';
import NotificationDropdown from './components/layout/NotificationDropdown';
import ProfileDropdown from './components/layout/ProfileDropdown';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LandingPage from './components/auth/LandingPage';
import RegistrationPage from './components/auth/RegistrationPage';

interface Notification {
  id: string;
  title: string;
  body: string;
}

// Define Superuser interface based on your Admin.tsx
interface Superuser {
  id: string;
  email: string;
  organization: string;
}

// --- Menu Structures ---
const superuserMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'collaboration', label: 'Collaboration', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: Archive },
  { id: 'task-database', label: 'Task Database', icon: Database },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
];

const regularUserMenuItems = [
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'collaboration', label: 'Collaboration', icon: MessageSquare },
];


function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('landing');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [superuserInfo, setSuperuserInfo] = useState<Superuser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('currentView');
    return savedView || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [organization, setOrganization] = useState<string | null>(null);
  const [superusers, setSuperusers] = useState<Superuser[]>([]);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const currentUser = users.find(u => u.email === user?.email) || null;

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  // Effect for Auth and one-time setups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setUser(user);

        const superusersCollection = collection(db, 'superusers');
        const superusersSnapshot = await getDocs(superusersCollection);
        const superusersList = superusersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Superuser[];
        setSuperusers(superusersList);
        const superuserRecord = superusersList.find(su => su.email === user.email);

        let org: string | null = null;
        const savedView = localStorage.getItem('currentView');

        if (superuserRecord) {
          setIsSuperuser(true);
          setSuperuserInfo(superuserRecord);
          org = superuserRecord.organization;
          if (!savedView || !superuserMenuItems.some(item => item.id === savedView)) {
            setCurrentView('dashboard');
          }
        } else {
          setIsSuperuser(false);
          setSuperuserInfo(null);
          const usersQuery = query(collection(db, 'users'), where("email", "==", user.email));
          const userSnapshot = await getDocs(usersQuery);
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            org = userData.organization;
          }
          if (!savedView || !regularUserMenuItems.some(item => item.id === savedView)) {
            setCurrentView('projects');
          }
        }

        setOrganization(org);

        if (org) {
          await fetchData(org);
        }
      } else {
        setUser(null);
        setIsSuperuser(false);
        setSuperuserInfo(null);
        setOrganization(null);
        setProjects([]);
        setUsers([]);
        setReports([]);
        setSuperusers([]);
      }
      setIsLoading(false);
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      unsubscribeAuth();
    };
  }, []);

  // Effect for user-specific data and listeners
  useEffect(() => {
    if (!currentUser) return;

    // --- Realtime Presence ---
    const userStatusDatabaseRef = ref(rtdb, '/status/' + currentUser.id);
    const userStatusFirestoreRef = doc(db, '/users/' + currentUser.id);

    const isOfflineForDatabase = {
      state: 'offline',
      last_changed: Date.now(),
    };

    const isOnlineForDatabase = {
      state: 'online',
      last_changed: Date.now(),
    };

    onValue(ref(rtdb, '.info/connected'), (snapshot) => {
      if (snapshot.val() === false) {
        updateDoc(userStatusFirestoreRef, { status: 'offline' });
        return;
      }

      onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
        set(userStatusDatabaseRef, isOnlineForDatabase);
        updateDoc(userStatusFirestoreRef, { status: 'online' });
      });
    });
  }, [currentUser?.id]);


  const fetchData = async (org: string) => {
    if (!org) return;
    try {
      const projectsQuery = query(collection(db, 'projects'), where("organization", "==", org));
      const projectsSnapshot = await getDocs(projectsQuery);
      setProjects(projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const usersQuery = query(collection(db, 'users'), where("organization", "==", org));
      const usersSnapshot = await getDocs(usersQuery);
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const reportsQuery = query(collection(db, 'reports'), where("organization", "==", org));
      const reportsSnapshot = await getDocs(reportsQuery);
      setReports(reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const refetchData = () => {
    if (organization) {
      fetchData(organization);
    }
  };

  const menuItems = isSuperuser ? superuserMenuItems : regularUserMenuItems;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    if (view === 'login') {
      return <LoginPage setView={setView} />;
    }
    if (view === 'register') {
      return <RegistrationPage setView={setView} />;
    }
    if (view === 'admin') {
      return <Admin />;
    }
    return <LandingPage setView={setView} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-950 text-gray-800 dark:text-dark-100">
      {showProfileDropdown && (
        <div ref={profileDropdownRef} className="absolute top-0 right-6 z-[100]">
          <ProfileDropdown currentUser={currentUser} />
        </div>
      )}

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        menuItems={menuItems}
      />

      <div className="lg:ml-64">
        <Header currentView={currentView} setSidebarOpen={setSidebarOpen} showProfileDropdown={showProfileDropdown} setShowProfileDropdown={setShowProfileDropdown} />

        <main className="p-6">
          {currentView === 'dashboard' && isSuperuser && <DashboardView projects={projects} users={users} reports={reports} setCurrentView={setCurrentView} superusers={superusers} />}
          {currentView === 'projects' && (
            <ProjectsView
              currentUser={currentUser}
              projects={projects}
              users={users}
              reports={reports}
              onProjectAdded={refetchData}
              isSuperuser={isSuperuser}
              superuserInfo={superuserInfo}
            />
          )}
          {currentView === 'reports' && (
            <ReportsView
              currentUser={currentUser}
              reports={reports}
              projects={projects}
              users={users}
              onReportAdded={refetchData}
              isSuperuser={isSuperuser}
              superuserInfo={superuserInfo}
            />
          )}
          {currentView === 'team' && isSuperuser && <TeamView currentUser={currentUser} users={users} projects={projects} onUserAdded={refetchData} isSuperuser={isSuperuser} superuserInfo={superuserInfo} />}
          {currentView === 'collaboration' && currentUser && <CollaborationView currentUser={currentUser} isSuperuser={isSuperuser} superuserInfo={superuserInfo} />}
          {currentView === 'files' && isSuperuser && <FilesView projects={projects} users={users} currentUser={currentUser} />}
          {currentView === 'task-database' && isSuperuser && <TaskDatabaseView />}
          {currentView === 'calendar' && isSuperuser && <MyCalendar />}
          {currentView === 'admin' && isSuperuser && <Admin />}
          {currentView === 'settings' && isSuperuser && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default App;
