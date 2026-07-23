import { motion } from 'framer-motion';
import {
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
  FaDesktop, FaPhoneSlash, FaCompressArrowsAlt, FaExpandArrowsAlt,
} from 'react-icons/fa';

interface CallControlsProps {
  isMuted: boolean;
  cameraOn: boolean;
  screenSharing: boolean;
  pipActive?: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onTogglePip?: () => void;
  onEnd: () => void;
}

interface ControlBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  className?: string;
}

function ControlBtn({ icon, label, onClick, active, danger, className = '' }: ControlBtnProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
        title={label}
        className={`p-3.5 rounded-full transition-all ${
          danger
            ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/30'
            : active
              ? 'bg-green-600/40 text-green-400 border border-green-500/30 hover:bg-green-600/50'
              : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
        } ${className}`}
      >
        {icon}
      </motion.button>
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

export default function CallControls({
  isMuted, cameraOn, screenSharing, pipActive,
  onToggleMute, onToggleCamera, onToggleScreenShare, onTogglePip, onEnd,
}: CallControlsProps) {
  return (
    <div className="bg-black/50 backdrop-blur-xl border-t border-white/10 px-6 py-4">
      <div className="flex items-center justify-center gap-6 max-w-lg mx-auto">
        <ControlBtn
          icon={isMuted ? <FaMicrophoneSlash size={18} /> : <FaMicrophone size={18} />}
          label={isMuted ? 'Unmute' : 'Mute'}
          onClick={onToggleMute}
          active={!isMuted}
        />
        <ControlBtn
          icon={cameraOn ? <FaVideo size={18} /> : <FaVideoSlash size={18} />}
          label={cameraOn ? 'Camera On' : 'Camera Off'}
          onClick={onToggleCamera}
          active={cameraOn}
        />
        <ControlBtn
          icon={<FaDesktop size={18} />}
          label={screenSharing ? 'Stop Share' : 'Share Screen'}
          onClick={onToggleScreenShare}
          active={screenSharing}
        />
        {onTogglePip && (
          <ControlBtn
            icon={pipActive ? <FaCompressArrowsAlt size={18} /> : <FaExpandArrowsAlt size={18} />}
            label={pipActive ? 'Exit PiP' : 'PiP'}
            onClick={onTogglePip}
          />
        )}
        <ControlBtn
          icon={<FaPhoneSlash size={20} />}
          label="End Call"
          onClick={onEnd}
          danger
        />
      </div>
    </div>
  );
}
