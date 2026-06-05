// sidebar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo-pnm-2-removebg-preview.png';
import {
  FaChevronDown,
  FaUserCircle,
  FaSignOutAlt,
  FaBuilding,
  FaCheck,
  FaShieldAlt,
  FaHome,
  FaBook,
  FaBell,
  FaSlidersH,
  FaHistory,
  FaChartPie,
  FaBuilding as FaBuildingIcon,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from 'react-avatar';
import { useAuth } from '../../auth/hooks/useAuth.hook';
import { ChevronsUpDown } from 'lucide-react';

const Sidebar = ({ onWidthChange }) => {
  const { pathname } = useLocation();
  const [openRisk, setOpenRisk] = useState(false);
  const [openOjkRisk, setOpenOjkRisk] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const divisionRef = useRef(null);
  const ojkRiskRef = useRef(null);
  const [divisionDropdownOpen, setDivisionDropdownOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const minWidth = 80;
  const maxWidth = 400;
  const collapsedThreshold = 180;

  const divisions = [
    {
      divisi_id: 1,
      name: 'Risk Management',
      description: 'Divisi Compliance dan Manajemen Risiko',
    },
  ];

  const [selectedDivision, setSelectedDivision] = useState(divisions[0]);

  const riskItems = [
    { name: 'Investasi', path: '/dashboard/risk-form/investasi' },
    { name: 'Pasar', path: '/dashboard/risk-form/pasar' },
    { name: 'Likuiditas', path: '/dashboard/risk-form/likuiditas' },
    { name: 'Operasional', path: '/dashboard/risk-form/operasional' },
    { name: 'Hukum', path: '/dashboard/risk-form/hukum' },
    { name: 'Stratejik', path: '/dashboard/risk-form/stratejik' },
    { name: 'Kepatuhan', path: '/dashboard/risk-form/kepatuhan' },
    { name: 'Reputasi', path: '/dashboard/risk-form/reputasi' },
    { name: 'Ringkasan', path: '/dashboard/ringkasan' },
    { name: 'Rekap Data', path: '/dashboard/rekap-data' },
    { name: 'Rekap Data 2', path: '/dashboard/rekapdata2' },
    { name: 'Rekap 1', path: '/dashboard/rekap1' },
  ];

  const ojkRiskItems = [
    { name: 'Pasar Produk', path: '/dashboard/ojk/pasar-produk' },
    { name: 'Likuiditas Produk', path: '/dashboard/ojk/likuiditas-produk' },
    { name: 'Kredit Produk', path: '/dashboard/ojk/kredit-produk' },
    { name: 'Konsentrasi Produk', path: '/dashboard/ojk/konsentrasi-produk' },
    { name: 'Operasional', path: '/dashboard/ojk/operasional' },
    { name: 'Hukum', path: '/dashboard/ojk/hukum' },
    { name: 'Kepatuhan', path: '/dashboard/ojk/kepatuhan' },
    { name: 'Reputasi', path: '/dashboard/ojk/reputasi' },
    { name: 'Strategis', path: '/dashboard/ojk/strategis' },
    { name: 'Investasi', path: '/dashboard/ojk/investasi' },
    { name: 'Rentabilitas', path: '/dashboard/ojk/rentabilitas' },
    { name: 'Permodalan', path: '/dashboard/ojk/permodalan' },
    { name: 'Tata Kelola', path: '/dashboard/ojk/tata-kelola' },
    { name: 'Rekap Data', path: '/dashboard/ojk/rekap-data' },
    { name: 'Rekap Data 1', path: '/dashboard/ojk/rekap-data-1' },
    { name: 'Rekap Data 2', path: '/dashboard/ojk/rekap-data-2' },
    { name: 'Peringkat Komposit', path: '/dashboard/ojk/peringkat-komposit' },
    { name: 'Ringkasan', path: '/dashboard/ojk/ringkasan' },
  ];

  useEffect(() => {
    if (pathname.startsWith('/dashboard/risk-form') || pathname === '/dashboard/rekap1' || pathname === '/dashboard/rekap-data' || pathname === '/dashboard/rekap-data-2' || pathname === '/dashboard/ringkasan') {
      setOpenRisk(true);
    }
    if (pathname.startsWith('/dashboard/ojk')) {
      setOpenOjkRisk(true);
    }
  }, [pathname]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing) return;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX));
      setSidebarWidth(newWidth);
      setIsCollapsed(newWidth <= collapsedThreshold);
      if (onWidthChange) onWidthChange(newWidth);
    },
    [isResizing, onWidthChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = 'auto';
    document.body.style.cursor = 'auto';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (divisionRef.current && !divisionRef.current.contains(event.target)) setDivisionDropdownOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
      if (ojkRiskRef.current && !ojkRiskRef.current.contains(event.target)) setOpenOjkRisk(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path, exact = false) => (exact ? pathname === path : pathname.startsWith(path));

  const handleDivisionSelect = (division) => {
    setSelectedDivision(division);
    setDivisionDropdownOpen(false);
  };

  const handleToggleCollapse = () => {
    const newWidth = isCollapsed ? 280 : minWidth;
    setSidebarWidth(newWidth);
    setIsCollapsed(!isCollapsed);
    if (onWidthChange) onWidthChange(newWidth);
  };

  const colors = {
    bg: 'bg-white',
    bgHover: 'hover:bg-slate-50',
    bgActive: 'bg-blue-50',
    text: 'text-slate-600',
    textHover: 'hover:text-slate-900',
    textActive: 'text-blue-700',
    textMuted: 'text-slate-400',
    border: 'border-slate-200',
    icon: 'text-slate-400',
    iconActive: 'text-blue-600',
    accent: 'bg-blue-700',
    accentLight: 'bg-blue-50',
    surface: 'bg-white',
    userBg: 'bg-slate-50',
    userBgHover: 'hover:bg-slate-100',
  };

  const ResizeHandle = () => (
    <div 
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize group z-10" 
      onMouseDown={() => setIsResizing(true)}
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full bg-blue-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );

  const CollapseToggle = () => (
    <button
      onClick={handleToggleCollapse}
      className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 transition-all duration-200 z-20 shadow-sm"
      title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {isCollapsed ? <FaChevronRight size={10} className="text-slate-500" /> : <FaChevronLeft size={10} className="text-slate-500" />}
    </button>
  );

  const scrollbarStyles = `
    .sidebar-scrollbar::-webkit-scrollbar {
      width: 3px;
    }
    .sidebar-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .sidebar-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 3px;
    }
    .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }
    .sidebar-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #e2e8f0 transparent;
    }
  `;

  const mainNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FaHome, exact: true },
    { name: 'Risk Appetite Statement', path: '/dashboard/ras', icon: FaChartPie },
    { name: 'Repository', path: '/dashboard/repository', icon: FaBook },
  ];

  const secondaryNavItems = [
    { name: 'Notifications', path: '/dashboard/notification', icon: FaBell, exact: true },
    { name: 'Audit Log', path: '/dashboard/audit-log', icon: FaHistory, exact: true },
    { name: 'Settings', path: '/dashboard/settings', icon: FaSlidersH, exact: true },
  ];

  const renderCollapsedContent = () => (
    <div className={`h-full flex flex-col items-center ${colors.bg}`}>
      {/* Logo - Collapsed */}
      <div className="flex-shrink-0 w-full flex justify-center pt-5 pb-4">
        <img src={logo} alt="PNM" className="w-10 h-auto opacity-90" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full px-2.5 mt-2 flex flex-col gap-4">
        {/* Main Menu Section */}
        <div className="flex flex-col gap-1.5">
          {mainNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ${
                isActive(item.path, item.exact)
                  ? `${colors.bgActive} ${colors.iconActive}`
                  : `${colors.icon} ${colors.bgHover} ${colors.textHover}`
              }`}
              title={item.name}
            >
              <item.icon className="w-4 h-4" />
            </Link>
          ))}
        </div>

        {/* Risk Profile Section */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-1.5">
          <button
            onClick={() => setOpenRisk(!openRisk)}
            className={`flex items-center justify-center p-2.5 rounded-lg w-full transition-all duration-200 ${
              isActive('/dashboard/risk-form') || isActive('/dashboard/rekap1')
                ? `${colors.bgActive} ${colors.iconActive}`
                : `${colors.icon} ${colors.bgHover} ${colors.textHover}`
            }`}
            title="Profil Resiko Holding"
          >
            <FaShieldAlt className="w-4 h-4" />
          </button>

          <button
            onClick={() => setOpenOjkRisk(!openOjkRisk)}
            className={`flex items-center justify-center p-2.5 rounded-lg w-full transition-all duration-200 ${
              isActive('/dashboard/ojk')
                ? `${colors.bgActive} ${colors.iconActive}`
                : `${colors.icon} ${colors.bgHover} ${colors.textHover}`
            }`}
            title="Profil Resiko OJK"
          >
            <FaBuildingIcon className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Secondary Navigation & User */}
      <div className="w-full px-2.5 pb-4 flex flex-col gap-4">
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-1.5">
          {secondaryNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ${
                isActive(item.path, item.exact)
                  ? `${colors.bgActive} ${colors.iconActive}`
                  : `${colors.icon} ${colors.bgHover} ${colors.textHover}`
              }`}
              title={item.name}
            >
              <item.icon className="w-4 h-4" />
            </Link>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-center" ref={menuRef}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)} 
            className="w-full flex justify-center p-1 hover:opacity-80 transition-opacity"
          >
            <Avatar 
              src={user?.photoURL} 
              name={user?.userID || 'U'} 
              size="32" 
              round 
              color="#1e40af"
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderExpandedContent = () => (
    <div className={`h-full flex flex-col ${colors.bg}`}>
      {/* Logo Section - Centered & Larger */}
      <div className="flex-shrink-0 flex justify-center px-6 pt-6 pb-5">
        <img src={logo} alt="PNM" className="w-full max-w-[160px] h-auto opacity-90" />
      </div>

      {/* Division Selector */}
      <div className="px-3 mb-4" ref={divisionRef}>
        <button
          onClick={() => setDivisionDropdownOpen(!divisionDropdownOpen)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border ${colors.border} ${colors.bgHover} transition-all duration-200 group`}
        >
          <div className={`w-9 h-9 rounded-lg ${colors.accent} flex items-center justify-center flex-shrink-0`}>
            <FaBuilding className="text-white text-sm" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{selectedDivision.name}</p>
            <p className={`text-xs ${colors.textMuted} truncate`}>{user?.role || 'User'}</p>
          </div>
          <ChevronsUpDown size={14} className={`${colors.textMuted} transition-transform duration-200 ${divisionDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {divisionDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="mt-2 rounded-xl border border-slate-200 shadow-lg overflow-hidden bg-white"
            >
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">Pilih Divisi</p>
                <p className={`text-xs ${colors.textMuted} mt-0.5`}>Saat ini hanya tersedia divisi Compliance</p>
              </div>
              {divisions.map((division) => (
                <button
                  key={division.divisi_id}
                  onClick={() => handleDivisionSelect(division)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors ${
                    selectedDivision.divisi_id === division.divisi_id ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${colors.accentLight} flex items-center justify-center`}>
                    <FaBuilding className="text-blue-600 text-xs" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-800">{division.name}</p>
                    <p className={`text-xs ${colors.textMuted}`}>{division.description}</p>
                  </div>
                  {selectedDivision.divisi_id === division.divisi_id && (
                    <FaCheck className="text-blue-600 text-xs" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto sidebar-scrollbar pb-6">
        <div className="flex flex-col gap-6">
          {/* Section 1: Menu Utama */}
          <div className="flex flex-col gap-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Menu Utama</p>
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive(item.path, item.exact)
                    ? `${colors.bgActive} ${colors.textActive} font-medium`
                    : `${colors.text} ${colors.bgHover} ${colors.textHover}`
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive(item.path, item.exact) ? colors.iconActive : ''}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Section 2: Profil Risiko */}
          <div className="flex flex-col gap-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Manajemen Risiko</p>
            
            {/* Risk Profile Group */}
            <div>
              <button
                onClick={() => setOpenRisk(!openRisk)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive('/dashboard/risk-form') || isActive('/dashboard/rekap1')
                    ? `${colors.bgActive} ${colors.textActive} font-medium`
                    : `${colors.text} ${colors.bgHover} ${colors.textHover}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <FaShieldAlt className={`w-4 h-4 flex-shrink-0 ${isActive('/dashboard/risk-form') || isActive('/dashboard/rekap1') ? colors.iconActive : ''}`} />
                  <span>Profil Resiko Holding</span>
                </div>
                <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${openRisk ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openRisk && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-5 pl-4 border-l border-slate-100 mt-1 mb-1.5 space-y-1">
                      {riskItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`group flex items-center px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-200 ${
                            isActive(item.path)
                              ? `${colors.textActive} font-medium`
                              : `${colors.text} ${colors.textHover}`
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-2.5 transition-all duration-200 flex-shrink-0 ${
                            isActive(item.path)
                              ? 'bg-blue-600 scale-110 shadow-sm shadow-blue-200'
                              : 'bg-slate-300 group-hover:bg-slate-400'
                          }`} />
                          <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* OJK Risk Group */}
            <div ref={ojkRiskRef}>
              <button
                onClick={() => setOpenOjkRisk(!openOjkRisk)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive('/dashboard/ojk')
                    ? `${colors.bgActive} ${colors.textActive} font-medium`
                    : `${colors.text} ${colors.bgHover} ${colors.textHover}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <FaBuildingIcon className={`w-4 h-4 flex-shrink-0 ${isActive('/dashboard/ojk') ? colors.iconActive : ''}`} />
                  <span>Profil Resiko OJK</span>
                </div>
                <FaChevronDown className={`w-3 h-3 transition-transform duration-200 ${openOjkRisk ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openOjkRisk && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-5 pl-4 border-l border-slate-100 mt-1 mb-1.5 space-y-1 max-h-52 overflow-y-auto sidebar-scrollbar">
                      {ojkRiskItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`group flex items-center px-2.5 py-1.5 rounded-md text-[13px] transition-all duration-200 ${
                            isActive(item.path)
                              ? `${colors.textActive} font-medium`
                              : `${colors.text} ${colors.textHover}`
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-2.5 transition-all duration-200 flex-shrink-0 ${
                            isActive(item.path)
                              ? 'bg-blue-600 scale-110 shadow-sm shadow-blue-200'
                              : 'bg-slate-300 group-hover:bg-slate-400'
                          }`} />
                          <span className="truncate group-hover:translate-x-0.5 transition-transform duration-150">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Section 3: Lainnya */}
          <div className="flex flex-col gap-1 pt-4 border-t border-slate-100">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Lainnya</p>
            {secondaryNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive(item.path, item.exact)
                    ? `${colors.bgActive} ${colors.textActive} font-medium`
                    : `${colors.text} ${colors.bgHover} ${colors.textHover}`
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive(item.path, item.exact) ? colors.iconActive : ''}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User Section */}
      <div className={`flex-shrink-0 px-3 pb-4 pt-3 border-t ${colors.border} mt-2`} ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl ${colors.userBg} ${colors.userBgHover} transition-all duration-200 group`}
        >
          <Avatar 
            src={user?.photoURL} 
            name={user?.userID || 'User'} 
            size="36" 
            round 
            color="#1e40af"
            className="flex-shrink-0"
          />
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.userID || 'Nama User'}</p>
            <p className={`text-xs ${colors.textMuted} truncate`}>{selectedDivision.name} • {user?.role || 'Role'}</p>
          </div>
          <ChevronsUpDown size={14} className={`${colors.textMuted} transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-slate-200 shadow-lg overflow-hidden bg-white"
            >
              <button
                onClick={() => {
                  navigate('/dashboard/profile');
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <FaUserCircle className="text-blue-600 text-lg" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Profile</p>
                  <p className={`text-xs ${colors.textMuted}`}>Kelola profil Anda</p>
                </div>
              </button>
              <div className="border-t border-slate-100" />
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
              >
                <FaSignOutAlt className="text-red-400 text-lg" />
                <div>
                  <p className="text-sm font-medium text-red-500">Logout</p>
                  <p className={`text-xs ${colors.textMuted}`}>Keluar dari sistem</p>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div 
        ref={sidebarRef} 
        className={`h-screen border-r ${colors.border} flex flex-col transition-all duration-300 relative ${colors.bg}`} 
        style={{ width: `${sidebarWidth}px` }}
      >
        <ResizeHandle />
        <CollapseToggle />
        {isCollapsed ? renderCollapsedContent() : renderExpandedContent()}
      </div>
    </>
  );
};

export default Sidebar;