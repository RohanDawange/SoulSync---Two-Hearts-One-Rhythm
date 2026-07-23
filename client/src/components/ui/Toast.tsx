import { motion } from 'framer-motion';
import { IoCheckmarkCircle, IoAlertCircle, IoInformationCircle, IoWarning, IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
  visible?: boolean;
}

const icons = {
  success: IoCheckmarkCircle,
  error: IoAlertCircle,
  info: IoInformationCircle,
  warning: IoWarning,
};

const colors = {
  success: 'bg-green-500/20 border-green-500/30 text-green-400',
  error: 'bg-red-500/20 border-red-500/30 text-red-400',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
};

export default function Toast({ message, type = 'info', onClose, visible = true }: ToastProps) {
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={visible ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg max-w-sm ${colors[type]}`}
    >
      <Icon className="shrink-0" size={20} />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <IoClose size={18} />
        </button>
      )}
    </motion.div>
  );
}

export function showToast(message: string, type: ToastType = 'info') {
  toast.custom((t: { id: string; visible: boolean }) => (
    <Toast message={message} type={type} onClose={() => toast.dismiss(t.id)} visible={t.visible} />
  ), { duration: 3000 });
}
