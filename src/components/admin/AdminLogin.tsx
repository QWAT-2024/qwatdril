import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase/auth';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  db, 
  collection, 
  getDocs, 
  query,
  where
} from '../../firebase/firestore';
import { Mail, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ThemeToggleButton from '../layout/ThemeToggleButton';

export function AdminLoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (user.email) {
        const superusersRef = collection(db, "superusers");
        const q = query(superusersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const superuserData = querySnapshot.docs[0].data();
          if (superuserData.hasfullaccess) {
            toast.success("Admin login successful!");
            onLoginSuccess();
          } else {
            await auth.signOut();
            toast.error("You do not have admin privileges.");
          }
        } else {
          await auth.signOut();
          toast.error("You are not authorized to access this page.");
        }
      }
    } catch (error: any) {
      toast.error(getFriendlyErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, formData.email);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      toast.error(getFriendlyErrorMessage(error.code));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-950 flex items-center justify-center relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggleButton />
      </div>
        <Toaster
            position="top-center"
            reverseOrder={false}
        />
      <div className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-dark-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Admin Login</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to the admin dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input id="email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} placeholder="Enter your password" className="w-full pl-10 pr-12 py-3 bg-gray-100 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-400 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button type="button" onClick={handleForgotPassword} className="text-sm text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</button>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-gradient text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group">
              {isLoading ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>) : (<>Sign In <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
