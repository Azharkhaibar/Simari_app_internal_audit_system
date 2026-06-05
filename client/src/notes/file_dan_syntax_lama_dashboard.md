<!-- // import React, { useEffect, useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useDarkMode } from '../../../shared/components/Darkmodecontext';
// import RiskManagementDashboard from '../components/chartComponents/riskmanagement';

// export default function Dashboard() {
//   const loc = useLocation();
//   const { darkMode } = useDarkMode();
//   const [showDialog, setShowDialog] = useState(false);
//   const [dialogMessage, setDialogMessage] = useState('');
//   const [activeView, setActiveView] = useState('overview');

//   useEffect(() => {
//     if (loc.state?.fromLogin) {
//       setDialogMessage('✅ Login berhasil! Selamat datang di Dashboard 👋');
//       setShowDialog(true);
//       setTimeout(() => setShowDialog(false), 4000);
//     }
//   }, [loc.state]);

//   const welcomeCardStyle = {
//     background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
//     color: 'white',
//     padding: '1.5rem',
//     borderRadius: '1rem',
//     marginBottom: '1.5rem',
//     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//   };

//   const statCardStyle = {
//     backgroundColor: darkMode ? 'var(--card-bg)' : '#ffffff',
//     border: `1px solid ${darkMode ? 'var(--border-color)' : '#e5e7eb'}`,
//     borderRadius: '0.75rem',
//     padding: '1.5rem',
//     boxShadow: darkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
//   };

//   const activityCardStyle = {
//     backgroundColor: darkMode ? 'var(--card-bg)' : '#ffffff',
//     border: `1px solid ${darkMode ? 'var(--border-color)' : '#e5e7eb'}`,
//     borderRadius: '0.75rem',
//     padding: '1.5rem',
//     marginTop: '1.5rem',
//     boxShadow: darkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
//   };

//   const activityItemStyle = {
//     padding: '0.75rem',
//     border: `1px solid ${darkMode ? 'var(--border-color)' : '#e5e7eb'}`,
//     borderRadius: '0.5rem',
//     backgroundColor: darkMode ? 'var(--bg-secondary)' : '#f9fafb',
//     marginBottom: '0.75rem',
//   };

//   const dialogStyle = {
//     backgroundColor: darkMode ? '#1f2937' : '#ffffff',
//     color: darkMode ? '#f9fafb' : '#1f2937',
//     padding: '1.25rem',
//     borderRadius: '1rem',
//     boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
//     maxWidth: '380px',
//     width: '100%',
//     border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
//     position: 'relative',
//     overflow: 'hidden',
//   };

//   const progressBarStyle = {
//     position: 'absolute',
//     bottom: '0',
//     left: '0',
//     height: '3px',
//     backgroundColor: '#10b981',
//     width: '100%',
//     transformOrigin: 'left',
//   };

//   const tabButtonStyle = (isActive) => ({
//     padding: '0.75rem 1.5rem',
//     borderRadius: '0.5rem',
//     fontWeight: '600',
//     backgroundColor: isActive ? (darkMode ? '#3b82f6' : '#2563eb') : 'transparent',
//     color: isActive ? 'white' : darkMode ? '#d1d5db' : '#6b7280',
//     border: `1px solid ${isActive ? 'transparent' : darkMode ? '#374151' : '#d1d5db'}`,
//     cursor: 'pointer',
//     transition: 'all 0.2s ease',
//   });

//   const renderOverview = () => (
//     <>
//       <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={welcomeCardStyle}>
//         <h2 className="text-2xl font-semibold">Welcome Back 👋</h2>
//         <p className="text-blue-100 mt-1">Senang melihat Anda kembali. Semoga hari Anda produktif!</p>
//       </motion.div>

    

//     </>
//   );

//   return (
//     <div className={`p-6 min-h-screen ${darkMode ? 'dark-mode-bg' : 'bg-gray-50'}`}>
//       <div className="flex justify-between items-center mb-6">
//         <motion.h1 initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className={`text-3xl font-bold ${darkMode ? 'dark-mode-text' : 'text-gray-900'}`}>
//           Dashboard
//         </motion.h1>

//         {/* View Toggle */}
//         <div className="flex gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
//           {/* <button onClick={() => setActiveView('overview')} style={tabButtonStyle(activeView === 'overview')}>
//             Overview
//           </button>
//           <button onClick={() => setActiveView('risk-kpi')} style={tabButtonStyle(activeView === 'risk-kpi')}>
//             Risk KPI
//           </button> */}
//         </div>
//       </div>

//       {/* Konten Berdasarkan Active View */}
//       {activeView === 'overview' ? renderOverview() : <RiskManagementDashboard />}

//       <AnimatePresence>
//         {showDialog && (
//           <motion.div
//             className="fixed bottom-6 right-6 z-50"
//             initial={{ opacity: 0, x: 100, scale: 0.8 }}
//             animate={{ opacity: 1, x: 0, scale: 1 }}
//             exit={{ opacity: 0, x: 100, scale: 0.8 }}
//             transition={{
//               type: 'spring',
//               stiffness: 300,
//               damping: 25,
//             }}
//           >
//             <div style={dialogStyle} className="relative">
//               <div className="flex items-start gap-3">
//                 <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
//                   <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                   </svg>
//                 </div>

//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-semibold text-lg mb-1">Welcome Back!</h3>
//                   <p className="text-sm opacity-90 leading-relaxed">Login berhasil! Selamat datang di Dashboard Risk Management</p>
//                   <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <span>Baru saja</span>
//                   </div>
//                 </div>

//                 <button onClick={() => setShowDialog(false)} className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               <motion.div style={progressBarStyle} initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 4, ease: 'linear' }} />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// } -->
