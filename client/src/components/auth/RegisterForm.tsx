import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail } from '@/utils/validators';

interface RegisterFormProps {
  onToggle: () => void;
}

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%' };
  if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', width: '50%' };
  return { label: 'Strong', color: 'bg-green-500', width: '80%' };
}

export default function RegisterForm({ onToggle }: RegisterFormProps) {
  const { registerWithEmail, loading, error } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [localError, setLocalError] = useState('');

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const validate = (): boolean => {
    if (!displayName.trim()) { setLocalError('Display name is required'); return false; }
    if (!email.trim()) { setLocalError('Email is required'); return false; }
    if (!isValidEmail(email)) { setLocalError('Invalid email format'); return false; }
    if (!password) { setLocalError('Password is required'); return false; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return false; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match'); return false; }
    if (!acceptedTerms) { setLocalError('You must accept the terms'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!validate()) return;
    await registerWithEmail(email, password);
  };

  const displayError = localError || error || '';

  return (
    <Card className="w-full max-w-md !bg-white/5 !backdrop-blur-xl border !border-white/10 !p-8" glow hover={false}>
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1">Join with your partner</p>
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
          label="Display Name"
          type="text"
          placeholder="Your name"
          icon={<HiOutlineUser size={18} />}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

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

        {password && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${strength.color}`}
                  initial={{ width: '0%' }}
                  animate={{ width: strength.width }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs text-gray-400 min-w-[48px] text-right">{strength.label}</span>
            </div>
          </div>
        )}

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={<HiOutlineLockClosed size={18} />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-primary-500/50 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
            I accept the{' '}
            <button type="button" className="text-primary-400 hover:text-primary-300 underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-primary-400 hover:text-primary-300 underline">
              Privacy Policy
            </button>
          </span>
        </label>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Create Account
        </Button>

        <p className="text-center text-sm text-gray-400 pt-1">
          Already have an account?{' '}
          <button type="button" onClick={onToggle} className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in
          </button>
        </p>
      </motion.form>
    </Card>
  );
}
