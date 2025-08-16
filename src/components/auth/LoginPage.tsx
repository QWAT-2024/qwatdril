import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase/auth';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  db, 
  collection, 
  getDocs, 
  addDoc,
  query,
  where
} from '../../firebase/firestore';
import { Zap, Users, Mail, Lock, EyeOff, Eye, ArrowRight, Shield, BarChart3, ArrowLeft } from 'lucide-react';
import ThemeToggleButton from '../layout/ThemeToggleButton';

// Import react-hot-toast
import toast, { Toaster } from 'react-hot-toast';

export function LoginPage({ setView }: { setView: (view: string) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  // The old 'error' state is no longer needed
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    organization: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // We ensure the user exists in our DB before calling onLogin
        const checkUser = async () => {
            if (user.email) {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", user.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  setView('app');
                }
            }
        };
        checkUser();
      }
    });

    const fetchOrganizations = async () => {
      try {
        const superusersCollection = collection(db, 'superusers');
        const superusersSnapshot = await getDocs(superusersCollection);
        const orgs = superusersSnapshot.docs.map(doc => doc.data().organization);
        setOrganizations([...new Set(orgs)]);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        toast.error("Could not load organizations.");
      }
    };

    fetchOrganizations();

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      unsubscribe();
    };
  }, [setView]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const googleProvider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        if (user) {
          await deleteUser(user);
        }
        // *** USE TOAST FOR ERROR FEEDBACK ***
        toast.error("No account found. Please sign up first.");
        setIsLoading(false);
      }
      // Successful login is handled by onAuthStateChanged
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
          toast.error("An error occurred during Google sign-in.");
      }
      setIsLoading(false);
    }
  };

  const getFriendlyErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSigningUp) {
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await addDoc(collection(db, 'users'), {
          email: formData.email,
          organization: formData.organization,
          name: formData.email.split('@')[0],
          avatar: formData.email.substring(0, 2).toUpperCase(),
          skills: [], status: 'offline', projects: []
        });
        toast.success("Account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
    } catch (error: any) {
      // *** USE TOAST FOR ERROR FEEDBACK ***
      toast.error(getFriendlyErrorMessage(error.code));
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

  const features = [
    { icon: Shield, title: 'Enterprise Security', desc: 'Bank-level encryption' },
    { icon: Zap, title: 'Lightning Fast', desc: 'Optimized performance' },
    { icon: Users, title: 'Team Collaboration', desc: 'Real-time sync' },
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Data-driven insights' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-950 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggleButton />
      </div>
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                className: 'dark:bg-dark-800 dark:text-white dark:border-dark-600',
                style: {
                    background: '#fff',
                    color: '#333',
                    border: '1px solid #ddd'
                },
                error: {
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                    },
                },
                success: {
                    iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                    },
                },
            }}
        />

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-primary-100 dark:from-dark-950 dark:via-dark-900 dark:to-primary-950"></div>
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-primary-500 rounded-full opacity-30 animate-float" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 6}s`, animationDuration: `${4 + Math.random() * 4}s`, }}></div>
          ))}
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 border border-primary-500 rounded-full" style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`, left: '10%', top: '20%' }}></div>
          <div className="absolute w-64 h-64 border border-primary-600 rounded-full" style={{ transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`, right: '15%', bottom: '25%' }}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/90 via-transparent to-gray-100/90 dark:from-dark-950/90 dark:via-transparent dark:to-dark-950/90"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <div className="animate-fade-in">
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <img src="https://firebasestorage.googleapis.com/v0/b/qwat-9aaab.appspot.com/o/Qwat%20innovations%2FLogo-dark.svg?alt=media&token=3c95d22b-8feb-473c-917f-deda4ed417ef" alt="Qwatdril Logo" className="w-12 h-12 mr-4" />
                <h1 className="text-5xl font-bold text-gray-800 dark:text-white font-serif-custom">Qwat</h1>
                <h1 className="text-5xl font-bold text-primary-500 font-serif-custom">dril</h1>
              </div>
              <h2 className="text-3xl xl:text-4xl font-bold text-gray-800 dark:text-white mb-4 leading-tight">
                Project Management <span className="block text-primary-400">Redefined</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Experience the future of team collaboration with our cutting-edge platform.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center p-4 bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-dark-700 hover:border-primary-500 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-600/20 rounded-lg flex items-center justify-center mr-4"><Icon className="w-6 h-6 text-primary-500 dark:text-primary-400" /></div>
                    <div>
                      <h3 className="text-gray-800 dark:text-white font-semibold">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md animate-slide-up">
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-dark-700 relative">
              <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{isSigningUp ? 'Create an Account' : 'Welcome Back'}</h2>
                <p className="text-gray-600 dark:text-gray-400">{isSigningUp ? 'Get started with Qwatdril' : 'Sign in to your account'}</p>
              </div>

              {!isSigningUp && (
                <>
                  <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white bg-white/50 dark:bg-dark-700/50 hover:bg-gray-100 dark:hover:bg-dark-600/50 transition-all duration-300 mb-6 group">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    <span className="group-hover:text-primary-400 transition-colors">Continue with Google</span>
                  </button>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-dark-600"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-400">Or continue with email</span></div>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSigningUp && (
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organization</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <select id="organization" name="organization" value={formData.organization} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300" required><option value="">Select Organization</option>{organizations.map(org => (<option key={org} value={org}>{org}</option>))}</select>
                    </div>
                  </div>
                )}
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center"><input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange} className="rounded border-gray-300 dark:border-dark-600 text-primary-600 focus:ring-primary-500 bg-gray-100 dark:bg-dark-700" /><span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Remember me</span></label>
                  <button type="button" onClick={handleForgotPassword} className="text-sm text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</button>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-gradient text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group">
                  {isLoading ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>) : (<>{isSigningUp ? 'Create Account' : 'Sign In'} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>)}
                </button>
              </form>
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button onClick={() => setView('register')} className="text-primary-500 hover:underline">
                    Sign up for free
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
