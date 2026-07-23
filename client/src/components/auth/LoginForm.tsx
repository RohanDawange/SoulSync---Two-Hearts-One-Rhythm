import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail } from '@/utils/validators';

interface LoginFormProps {
  onToggle: () => void;
}

export default function LoginForm({ onToggle }: LoginFormProps) {
  const { loginWithEmail, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const validate = (): boolean => {
    if (!email.trim()) { setLocalError('Email is required'); return false; }
    if (!isValidEmail(email)) { setLocalError('Invalid email format'); return false; }
    if (!password) { setLocalError('Password is required'); return false; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!validate()) return;
    await loginWithEmail(email, password);
  };

  const displayError = localError || error || '';

  return (
    <Card className="w-full max-w-md !bg-white/5 !backdrop-blur-xl border !border-white/10 !p-8" glow hover={false}>
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <AnimatePresence mode="wait">
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-red-400"
            >
              {displayError}
            </motion.div>
          )}
        </AnimatePresence>

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<HiOutlineMail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<HiOutlineLockClosed size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
          </button>
        </div>

        <div className="flex justify-end">
          <button type="button" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            Forgot Password?
          </button>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Sign In
        </Button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-white/10" />
          <span className="flex-shrink mx-4 text-xs text-gray-500">OR</span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <button type="button" onClick={onToggle} className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign up
          </button>
        </p>
      </motion.form>
    </Card>
  );
}
