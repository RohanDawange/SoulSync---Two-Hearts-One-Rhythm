import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaMusic, FaSignOutAlt, FaUser, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/#features' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dropdownItems = [
    { label: 'Profile', onClick: () => navigate('/profile'), icon: <FaUser size={14} /> },
    { label: 'Settings', onClick: () => navigate('/settings'), icon: <FaCog size={14} /> },
    { label: 'Logout', onClick: handleLogout, icon: <FaSignOutAlt size={14} />, danger: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <FaHeart className="text-pink-500 group-hover:scale-110 transition-transform" size={24} />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SoulSync
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link to="/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2 cursor-pointer group">
                    <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {user.displayName}
                    </span>
                  </div>
                }
                items={dropdownItems}
              />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-black/50 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-gray-300 hover:text-white py-2 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-gray-300 hover:text-white py-2 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <div className="border-t border-white/10 pt-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 py-2">
                      <Avatar src={user.photoURL} name={user.displayName} size="sm" />
                      <span className="text-sm text-white">{user.displayName}</span>
                    </div>
                    {dropdownItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => { item.onClick(); setMobileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          item.danger ? 'text-red-400 hover:bg-red-500/20' : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button variant="ghost" size="sm" fullWidth>Login</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button size="sm" fullWidth>Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
