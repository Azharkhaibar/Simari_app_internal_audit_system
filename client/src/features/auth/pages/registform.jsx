// registform.jsx
import React, { useState } from 'react';
import InputField from '../components/inputField';
import fileIMG from '../../../assets/logo-pnm-2-removebg-preview.png';
import bgImage from '../../../assets/Gedung-PNM-Banner.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.hook';
import GenderToggleSignupDialog from '../../../shared/components/genderToggle';
import { useDarkMode } from '../../../shared/components/Darkmodecontext';
import { motion } from 'framer-motion';
import PinDialog from '../components/pinDialog';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const { darkMode } = useDarkMode();

  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER'); 
  const [genderForm, setGenderForm] = useState('MALE'); 
  const [showPinDialog, setShowPinDialog] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!userID || !password) {
      console.warn('[Register] UserID atau Password kosong');
      return alert('UserID dan Password wajib diisi');
    }

    const payload = {
      userID,
      password,
      role: role.toUpperCase(), 
      gender: genderForm.toUpperCase(), 
    };

    console.log('[Register] Payload dikirim:', payload);

    try {
      const result = await register(payload);
      console.log('[Register] Response:', result);

      alert('Registrasi berhasil! Silakan login');
      navigate('/login');
    } catch (err) {
      console.error('[Register] Register failed:', err);

      if (err?.response) {
        console.error('[Register] Response data:', err.response.data);
        const msg = err.response.data?.message;
        if (Array.isArray(msg)) {
          alert(msg.join('\n'));
        } else {
          alert(msg || 'Registrasi gagal, cek input dan backend');
        }
      } else if (err?.request) {
        alert('Backend tidak merespon, cek server');
      } else {
        alert(err.message || 'Registrasi gagal, cek console');
      }
    }
  };

  const handlePinVerified = () => {
    setShowPinDialog(false);
  };

  const containerClass = `min-h-screen flex transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-blue-200'}`;

  const formCardClass = `w-full max-w-md backdrop-blur-md shadow-2xl rounded-2xl p-8 border transition-all duration-300 ${darkMode ? 'bg-gray-800/80 border-gray-700/50 text-white' : 'bg-white/50 border-white/40 text-gray-800'}`;

  const textClass = darkMode ? 'text-gray-300' : 'text-gray-600';
  const titleClass = darkMode ? 'text-white' : 'text-gray-800';

  const selectClass = `w-full mt-1 border p-2 rounded-lg transition-colors duration-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`;

  const buttonClass = `w-full mt-4 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg ${
    loading ? 'bg-gray-500 cursor-not-allowed text-gray-300' : darkMode ? 'bg-blue-700 hover:bg-blue-600 active:scale-[.98] text-white' : 'bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white'
  }`;

  const labelClass = `font-medium transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className={containerClass}>
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className={formCardClass}>
          <div className="text-center mb-8">
            <img
              src={fileIMG}
              alt="PNM Logo"
              className="mx-auto w-64 h-auto drop-shadow-lg transition-all duration-300"
            />
            <h1 className={`text-2xl font-semibold mt-6 transition-colors duration-300 ${titleClass}`}>Register Akun Baru</h1>
            <p className={`${textClass} text-sm mt-2 transition-colors duration-300`}>Silahkan isi form di bawah untuk membuat akun</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <InputField label="UserID" type="text" value={userID} onChange={(e) => setUserID(e.target.value)} darkMode={darkMode} />
            <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} darkMode={darkMode} />

            <div>
              <label className={labelClass}>Role</label>
              <select className={selectClass} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Gender</label>
              <GenderToggleSignupDialog genderForm={genderForm} setGenderForm={setGenderForm} darkMode={darkMode} />
            </div>

            {error && <p className={`text-sm text-center transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}

            <button type="submit" disabled={loading} className={buttonClass}>
              {loading ? 'Processing...' : 'Register'}
            </button>

            <p className={`text-center text-sm mt-4 transition-colors duration-300 ${textClass}`}>
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/login')} className={`font-medium hover:underline transition-colors duration-300 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                Sign in here
              </button>
            </p>
          </form>
        </motion.div>
      </div>

      <div className="hidden md:block w-1/2 relative bg-cover bg-center transition-all duration-300" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className={`absolute inset-0 transition-all duration-300 ${darkMode ? 'bg-gradient-to-t from-black/60 to-transparent' : 'bg-gradient-to-t from-black/40 to-transparent'}`} />
      </div>

      <PinDialog isOpen={showPinDialog} onClose={() => setShowPinDialog(false)} onPinVerified={handlePinVerified} />
    </div>
  );
}
