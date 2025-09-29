import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { db, collection, addDoc } from '../../firebase/firestore';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Zap, Users, Mail, Lock, Upload, ArrowRight, Shield, BarChart3, ArrowLeft } from 'lucide-react';
import ThemeToggleButton from '../layout/ThemeToggleButton';

const RegistrationPage = ({ setView }: { setView: (view: string) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    password: '',
    confirmPassword: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;

    if (selectedFile) {
      const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
      if (selectedFile.size > maxSize) {
        setError('File size must be less than 10 MB.');
        setFile(null);
        e.target.value = ''; // Clear the file input
        return;
      }
      setError(''); // Clear previous errors
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    let fileURL = '';
    if (file) {
      const storageRef = ref(storage, `documents/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      await uploadTask;
      fileURL = await getDownloadURL(uploadTask.snapshot.ref);
    }

    try {
      await addDoc(collection(db, 'requests'), {
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
        password: formData.password, // Note: Storing passwords in plaintext is not secure.
        document: fileURL,
        role: 'user',
      });

      const functions = getFunctions();
      const sendNewUserRequestEmail = httpsCallable(functions, 'sendNewUserRequestEmail');
      await sendNewUserRequestEmail({
        name: formData.name,
        email: formData.email,
        organization: formData.organization,
      });

      toast.success('You request has been submitted , You get an email soon');
      setView('login');
    } catch (err) {
      setError('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
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
      {/* Background elements */}
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
        {/* Left Content Panel - MODIFIED HERE */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-start pt-10 px-12 xl:px-16">
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

        {/* Right Form Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md animate-slide-up">
            <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-dark-700 relative">
              <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                <ArrowLeft size={24} />
              </button>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Create an Admin Account</h2>
                <p className="text-gray-600 dark:text-gray-400">Get started with Qwatdril</p>
              </div>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="text" name="name" placeholder="Name" onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-200 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl" required />
                <input type="email" name="email" placeholder="Email" onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-200 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl" required />
                <input type="text" name="organization" placeholder="Organization" onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-200 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl" required />
                <input type="password" name="password" placeholder="Password" onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-200 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl" required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-200 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl" required />
                
                <div>
                  <div title="Upload documents for verification.">
                    <label
                      htmlFor="file-upload"
                      className="w-full px-4 py-3 bg-gray-200 dark:bg-dark-700/50 border border-gray-300 dark:border-dark-600 rounded-xl flex items-center justify-between cursor-pointer"
                    >
                      <span className={`truncate pr-2 ${file ? "text-gray-800 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                        {file ? file.name : "Organization Document"}
                      </span>
                      <Upload size={20} className="text-gray-600 dark:text-gray-300 flex-shrink-0" />
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf"
                    />
                  </div>
                  <p className="mt-2 ml-2 text-xs text-gray-500 dark:text-gray-400">
                    Use Incorporation Certificate, PAN, TAN, or GST. <br />
                    Supports: PNG, JPG, PDF (max 10MB).
                  </p>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Register'
                  )}
                </button>
              </form>
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button onClick={() => setView('login')} className="text-primary-500 hover:underline">
                    Sign In
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

export default RegistrationPage;
