import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaMusic } from 'react-icons/fa';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

function FloatingShape({ className, delay }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.1, scale: 1 }}
      transition={{ delay, duration: 1.5 }}
      className={`absolute rounded-full pointer-events-none ${className || ''}`}
    />
  );
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex pt-16"
    >
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-gray-950 to-pink-900/30 items-center justify-center">
        <FloatingShape className="w-72 h-72 bg-purple-500 top-[15%] left-[10%]" delay={0.2} />
        <FloatingShape className="w-48 h-48 bg-pink-500 bottom-[20%] right-[15%]" delay={0.4} />
        <FloatingShape className="w-36 h-36 bg-indigo-500 top-[50%] right-[20%]" delay={0.6} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-center z-10 px-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex"
          >
            <FaHeart className="text-pink-500 mx-auto" size={48} />
          </motion.div>
          <h1 className="text-4xl font-bold mt-6 mb-3">
            <span className="text-white">Soul</span>
            <span className="text-gradient">Sync</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-sm mx-auto leading-relaxed">
            Two Hearts, One Rhythm
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <FaMusic className="text-gray-500" size={i === 1 ? 20 : 16} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <FaHeart className="text-pink-500 mx-auto" size={32} />
            <h1 className="text-2xl font-bold mt-3">
              <span className="text-white">Soul</span>
              <span className="text-gradient">Sync</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Two Hearts, One Rhythm</p>
          </div>

          <div className="mb-6">
            <GoogleAuthButton />
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink mx-4 text-xs text-gray-500">or continue with email</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.25 }}
            >
              {isLogin ? (
                <LoginForm onToggle={() => setIsLogin(false)} />
              ) : (
                <RegisterForm onToggle={() => setIsLogin(true)} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
