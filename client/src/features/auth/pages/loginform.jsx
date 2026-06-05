// LoginPage.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../components/inputField';
import { useNavigate, Navigate } from 'react-router-dom';
import bgImage from '../../../assets/Gedung-PNM-Banner.jpg';
import fileIMG from '../../../assets/logo-pnm-2-removebg-preview.png'; // Logo baru sesuai sidebar
import { useAuth } from '../hooks/useAuth.hook';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '../../../shared/components/Darkmodecontext';
import PinDialog from '../components/pinDialog';

export default function LoginPage() {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notification, setNotification] = useState(null);
  const [inputError, setInputError] = useState('');
  const navigate = useNavigate();
  const { user, loading, error, login } = useAuth();
  const { darkMode } = useDarkMode();

  // Auto-hide notification setelah 4 detik
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (inputError) {
      setInputError('');
    }
  }, [userID, password]);

  // Jika user sudah login, redirect otomatis ke dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    // Validasi input
    if (!userID || !password) {
      setInputError('UserID dan Password harus diisi');
      setIsLoggingIn(false);
      return;
    }

    try {
      await login(userID, password);

      // Notifikasi sukses
      setNotification({
        message: `✅ Login berhasil! Selamat datang, ${userID}`,
        type: 'success',
      });

      setTimeout(() => {
        navigate('/dashboard', {
          state: { fromLogin: true, welcomeMessage: `Selamat datang, ${userID}!` },
        });
      }, 1500);
    } catch (err) {
      // Handle error dengan pesan yang lebih user-friendly
      setInputError(err.message || 'Login gagal, silakan coba lagi');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePinVerified = () => {
    setShowPinDialog(false);
    navigate('/register');
  };

  const containerClass = `min-h-screen flex relative transition-colors duration-300 ${
    darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-blue-200'
  }`;

  const formCardClass = `w-full max-w-md backdrop-blur-md shadow-2xl rounded-2xl p-8 border transition-all duration-300 ${
    darkMode ? 'bg-gray-800/80 border-gray-700/50 text-white' : 'bg-white/50 border-white/40 text-gray-800'
  }`;

  const textClass = darkMode ? 'text-gray-300' : 'text-gray-600';
  
  const buttonClass = `w-full mt-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg ${
    isLoggingIn
      ? 'bg-gray-500 cursor-not-allowed text-gray-300'
      : darkMode
      ? 'bg-blue-700 hover:bg-blue-600 active:scale-[.98] text-white'
      : 'bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white'
  }`;

  const loadingOverlayClass = `fixed inset-0 flex items-center justify-center z-50 ${
    darkMode ? 'bg-black/50' : 'bg-black/40'
  }`;

  const loadingCardClass = `rounded-xl p-6 flex flex-col items-center justify-center shadow-lg transition-colors duration-300 ${
    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'
  }`;

  return (
    <div className={containerClass}>
      {/* Notifikasi Minimalis */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 min-w-72 max-w-sm rounded-lg shadow-xl ${
              notification.type === 'error' ? 'bg-red-500 border-red-600' : 'bg-green-500 border-green-600'
            } border text-white`}
          >
            <div className="p-4 flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                {notification.type === 'error' ? '❌' : '✅'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-white/80 hover:text-white transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={formCardClass}
        >
          <div className="text-center mb-8">
            {/* Logo dengan warna original (hitam/default) */}
            <img
              src={fileIMG}
              alt="PNM Logo"
              className="mx-auto w-64 h-auto drop-shadow-lg transition-all duration-300"
            />
            <h1
              className={`text-3xl font-semibold mt-6 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}
            >
              Selamat Datang
            </h1>
            <p className={`${textClass} text-sm mt-2 transition-colors duration-300`}>
              Silahkan login untuk mengakses dashboard
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="space-y-4">
              <AnimatePresence>
                {inputError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-lg p-3 mb-2 border ${
                      darkMode
                        ? 'bg-red-900/30 border-red-700/50 text-red-300'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className={`flex-shrink-0 ${
                          darkMode ? 'text-red-400' : 'text-red-500'
                        }`}
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                      </svg>
                      <p className="text-sm font-medium">{inputError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <InputField
                label="UserID"
                type="text"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
                darkMode={darkMode}
                disabled={isLoggingIn}
              />

              <InputField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                darkMode={darkMode}
                disabled={isLoggingIn}
              />
            </div>

            <button type="submit" disabled={isLoggingIn} className={buttonClass}>
              {isLoggingIn ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>

            <p className={`mt-4 text-center text-sm transition-colors duration-300 ${textClass}`}>
              Not already have an account?{' '}
              <button
                type="button"
                onClick={() => setShowPinDialog(true)}
                disabled={isLoggingIn}
                className={`font-medium hover:underline transition-colors duration-300 ${
                  isLoggingIn
                    ? 'text-gray-500 cursor-not-allowed'
                    : darkMode
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Register here
              </button>
            </p>
          </form>
        </motion.div>
      </div>

      <div
        className="hidden md:block w-1/2 relative bg-cover bg-center transition-all duration-300"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            darkMode
              ? 'bg-gradient-to-t from-black/60 to-transparent'
              : 'bg-gradient-to-t from-black/40 to-transparent'
          }`}
        />
      </div>

      {/* Dialog sukses untuk login berhasil */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`relative rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
            >
              <div className="text-center">
                {dialogMessage.includes('✅') && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
                <p className="font-medium">{dialogMessage}</p>
                {dialogMessage.includes('✅') && (
                  <p className="text-sm mt-2 opacity-75">Mengarahkan ke dashboard...</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(loading || isLoggingIn) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={loadingOverlayClass}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={loadingCardClass}
            >
              <svg
                className="animate-spin h-10 w-10 mb-4 transition-colors duration-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke={darkMode ? '#60A5FA' : '#2563EB'}
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill={darkMode ? '#60A5FA' : '#2563EB'}
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <p className="font-medium">Logging in...</p>
              <p className="text-sm mt-2 opacity-75">Mohon tunggu sebentar...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PinDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onPinVerified={handlePinVerified}
      />
    </div>
  );
}