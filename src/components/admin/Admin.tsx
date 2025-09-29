import React, { useState, useEffect } from 'react';
import { AdminLoginPage } from './AdminLogin';
import ThemeToggleButton from '../layout/ThemeToggleButton';

// Import Firestore and Functions services
import { db } from '../../firebase/firestore'; // Assuming this is your firestore export
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// --- Interfaces ---
interface Superuser {
  id: string;
  name: string;
  email: string;
  organization: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  avatar?: string;
  role: string;
  password?: string;
  document?: string;
}

// --- Component ---
const Admin = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  // --- STATE MANAGEMENT ---
  const [superusers, setSuperusers] = useState<Superuser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);

  // State for the new admin creation form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- DATA FETCHING ---
  const fetchSuperusers = async () => {
    const snapshot = await getDocs(collection(db, 'superusers'));
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Superuser, 'id'>)
    }));
    setSuperusers(list);
  };

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<User, 'id'>)
    }));
    setUsers(list);
  };

  const fetchRequests = async () => {
    const snapshot = await getDocs(collection(db, 'requests'));
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<User, 'id'>)
    }));
    setRequests(list);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSuperusers();
    fetchUsers();
    fetchRequests();
  }, []);

  // --- HANDLER FUNCTIONS ---
  const handleCreateAdmin = async () => {
    setError(null);
    setSuccess(null);

    // 1. Client-side validation
    if (!name || !email || !password || !confirmPassword || !organization) {
      setError("Please fill out all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // 2. Call the Cloud Function
      const functions = getFunctions();
      const createNewUser = httpsCallable(functions, 'createNewUser');

      await createNewUser({
        name: name,
        email: email,
        password: password,
        organization: organization,
        role: 'admin',
      });

      // 3. Add to 'superusers' collection
      await addDoc(collection(db, 'superusers'), {
        name: name,
        email: email,
        organization: organization,
      });

      setSuccess(`Admin user ${email} created successfully!`);

      // 4. Clear form and refresh list
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setOrganization('');
      await fetchSuperusers();

    } catch (err: any) {
      console.error("Error during admin creation:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this superuser? This will not delete their main account.")) {
      await deleteDoc(doc(db, 'superusers', id));
      await fetchSuperusers();
    }
  };

  const deleteFileFromStorage = async (fileUrl: string) => {
    if (!fileUrl) return;
    try {
      const functions = getFunctions();
      const deleteFile = httpsCallable(functions, 'deleteFileFromStorage');
      await deleteFile({ fileUrl });
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      // Optionally, set an error state to inform the user
    }
  };

  const handleApprove = async (request: User) => {
    if (!request.password) {
      setError("Cannot approve request without a password.");
      return;
    }
    setLoading(true);
    try {
      // 1. Call the Cloud Function to create the user
      const functions = getFunctions();
      const createNewUser = httpsCallable(functions, 'createNewUser');
      await createNewUser({
        name: request.name,
        email: request.email,
        password: request.password,
        organization: request.organization,
        role: 'admin',
      });

      // 2. Add to 'superusers' collection
      await addDoc(collection(db, 'superusers'), {
        name: request.name,
        email: request.email,
        organization: request.organization,
      });

      // 3. Delete the request document
      await deleteDoc(doc(db, 'requests', request.id));

      // 4. Delete the file from storage if it exists
      if (request.document) {
        await deleteFileFromStorage(request.document);
      }

      // 5. Send approval email
      const sendApprovalEmail = httpsCallable(getFunctions(), 'sendApprovalEmail');
      await sendApprovalEmail({ email: request.email, name: request.name });

      setSuccess(`Admin user ${request.email} approved and created successfully!`);
      await fetchSuperusers();
      await fetchRequests();
    } catch (err: any) {
      console.error("Error during request approval:", err);
      setError(err.message || "An unexpected error occurred during approval.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (request: User) => {
    if (window.confirm(`Are you sure you want to decline the request for ${request.name}?`)) {
      setLoading(true);
      try {
        // 1. Delete the request document
        await deleteDoc(doc(db, 'requests', request.id));

        // 2. Delete the file from storage if it exists
        if (request.document) {
          await deleteFileFromStorage(request.document);
        }

        // 3. Send rejection email
        const sendRejectionEmail = httpsCallable(getFunctions(), 'sendRejectionEmail');
        await sendRejectionEmail({ email: request.email, name: request.name });

        setSuccess(`Request for ${request.name} has been declined.`);
        await fetchRequests();
      } catch (err: any) {
        console.error("Error during request decline:", err);
        setError(err.message || "An unexpected error occurred during decline.");
      } finally {
        setLoading(false);
      }
    }
  };


  const inputStyles = "w-full px-4 py-2 bg-gray-100 dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-800 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  // --- JSX RENDER ---
  if (!isAdminLoggedIn) {
    return <AdminLoginPage onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-950 text-gray-800 dark:text-dark-100 p-8 relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggleButton />
      </div>
      <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Create New Admin Card */}
          <div className="bg-white dark:bg-dark-900 shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Create New Admin</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} />
              <input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyles} />
              <input type="text" placeholder="Organization" value={organization} onChange={(e) => setOrganization(e.target.value)} className={inputStyles} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyles} />
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputStyles} />
            </div>
            <button
              onClick={handleCreateAdmin}
              disabled={loading}
              className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition duration-300 disabled:bg-primary-400"
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {success && <p className="text-green-500 mt-4">{success}</p>}
          </div>

          {/* Existing Superusers Card */}
          <div className="bg-white dark:bg-dark-900 shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Existing Superusers</h2>
            <div className="space-y-4">
              {superusers.map(su => (
                <div key={su.id} className="flex justify-between items-center bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{su.name}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-300">{su.email}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-300">{su.organization}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(su.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Registration Requests Card */}
          <div className="bg-white dark:bg-dark-900 shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Registration Requests</h2>
            <div className="space-y-4">
              {requests.map(request => (
                <div key={request.id} className="bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
                  <p className="font-semibold text-gray-800 dark:text-white">{request.name}</p>
                  <p className="text-sm text-gray-600 dark:text-dark-300">{request.email}</p>
                  <p className="text-sm text-gray-600 dark:text-dark-300">{request.organization}</p>
                  {request.document && (
                    <a href={request.document} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">
                      View Document
                    </a>
                  )}
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={() => handleApprove(request)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecline(request)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-300"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registered Users Card */}
          <div className="bg-white dark:bg-dark-900 shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Registered Users</h2>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex justify-between items-center bg-gray-50 dark:bg-dark-800 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-300">{user.email}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-300">{user.organization}</p>
                  </div>
                  <span className="text-sm font-medium text-primary-500">{user.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
