import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaMusic, FaUser, FaCog, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';

const sidebarLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: FaHome },
  { label: 'Room', path: '/room', icon: FaMusic },
  { label: 'Profile', path: '/profile', icon: FaUser },
  { label: 'Settings', path: '/settings', icon: FaCog },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const content = (
    <div className="h-full flex flex-col">
      <div className="p-5 border-b border-white/10">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar src={user.photoURL} name={user.displayName} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all relative ${
                isActive
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-500/20"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <link.icon size={18} className="relative z-10" />
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-full bg-white/5 backdrop-blur-xl border-r border-white/10">
        {content}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden bg-gray-900 border-r border-white/10 shadow-2xl"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
              >
                <FaTimes size={18} />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
