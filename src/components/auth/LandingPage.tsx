import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggleButton from '../layout/ThemeToggleButton';

const Header = () => {
  return (
    <header className="pl-6 bg-gray-100 dark:bg-dark-950 text-gray-800 dark:text-white shadow-md mb-3">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/qwat-9aaab.appspot.com/o/Qwat%20innovations%2FLogo-dark.svg?alt=media&token=3c95d22b-8feb-473c-917f-deda4ed417ef"
            alt="Qwat Innovation Logo"
            className="h-10 w-auto"
          />
          <span className="ml-3 text-xl font-serif">Qwat Innovation</span>
        </div>
        <ThemeToggleButton />
      </div>
    </header>
  );
};

const LandingPage = ({ setView }: { setView: (view: string) => void }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [imageLoading, setImageLoading] = useState(true);

  // Preload images
  useEffect(() => {
    const imageUrls = [
      'https://firebasestorage.googleapis.com/v0/b/qwadril.firebasestorage.app/o/Webcontent%2FHero.png?alt=media&token=f901d29e-fb82-421a-8fcc-d26d26772e3e',
      'https://firebasestorage.googleapis.com/v0/b/qwat-9aaab.appspot.com/o/Qwat%20innovations%2FLogo-dark.svg?alt=media&token=3c95d22b-8feb-473c-917f-deda4ed417ef'
    ];
    let loadedImages = 0;

    const handleImageLoad = () => {
      loadedImages++;
      if (loadedImages === imageUrls.length) {
        setImageLoading(false);
      }
    };

    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      img.onload = handleImageLoad;
    });
  }, []);

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // This will make the children animate one after another
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  if (imageLoading) {
    return (
      <div className="h-screen flex justify-center items-center bg-gray-100 dark:bg-dark-950">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-dark-950 text-gray-800 dark:text-white">
      <Header />
      <main className="flex-grow overflow-y-auto">
        <div className="container mx-auto px-6 pt-12 pb-12">
          <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-8">
            <motion.div
              className="pl-6 md:w-2/5 lg:w-2/5 max-w-xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Added whitespace-nowrap here */}
              <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold mb-4 mt-4 font-serif-custom whitespace-nowrap">
                Welcome to Qwatdril
              </motion.h1>
              <motion.p variants={itemVariants} className="text-lg md:text-2xl font-semibold mb-8">
                Your Complete Project Management & Collaboration Solution
              </motion.p>
              <motion.p variants={itemVariants} className="text-base md:text-xl mb-8">
                Qwatdril is a modern, cloud-based Project Management Tool that
                helps teams plan, track, and deliver projects effortlessly.
                Whether you're managing a single project or handling multiple
                complex workflows, Qwatdril brings all your work into one
                simple, organized platform.
              </motion.p>
              <motion.div variants={itemVariants} className="space-x-4">
                <motion.button
                  onClick={() => setView('login')}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => setView('register')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Register
                </motion.button>
              </motion.div>
            </motion.div>
            <motion.div
              className="md:w-3/5 lg:w-3/5 mt-8 md:mt-0"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src='https://firebasestorage.googleapis.com/v0/b/qwadril.firebasestorage.app/o/Webcontent%2FHero.png?alt=media&token=f901d29e-fb82-421a-8fcc-d26d26772e3e'
                alt="Qwatdril Project Management Tool"
                className="rounded-lg w-full"
              />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;