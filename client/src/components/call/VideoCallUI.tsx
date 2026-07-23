import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CallControls from './CallControls';

interface VideoCallUIProps {
  isOpen: boolean;
  peerName: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  cameraOn: boolean;
  screenSharing: boolean;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VideoCallUI({
  isOpen, peerName, localStream, remoteStream, isMuted, cameraOn, screenSharing,
  onEnd, onToggleMute, onToggleCamera, onToggleScreenShare,
}: VideoCallUIProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callTimer, setCallTimer] = useState(0);
  const [pipMode, setPipMode] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteStream) {
      const timer = setInterval(() => setCallTimer((t) => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [remoteStream]);

  const handlePip = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setPipMode(false);
      } else if (remoteVideoRef.current) {
        await remoteVideoRef.current.requestPictureInPicture();
        setPipMode(true);
      }
    } catch {
      setPipMode(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          <div className="relative flex-1 bg-gray-900">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <p className="text-gray-400">Waiting for {peerName}...</p>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <h2 className="text-white font-semibold text-sm">{peerName}</h2>
              <span className="text-gray-400 text-xs">{formatTime(callTimer)}</span>
            </div>

            <div className={`absolute ${screenSharing ? 'top-16 right-4' : 'bottom-24 right-4'} w-32 h-48 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-800`}>
              {localStream && cameraOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <span className="text-2xl">🙋</span>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0">
              <CallControls
                isMuted={isMuted}
                cameraOn={cameraOn}
                screenSharing={screenSharing}
                pipActive={pipMode}
                onToggleMute={onToggleMute}
                onToggleCamera={onToggleCamera}
                onToggleScreenShare={onToggleScreenShare}
                onTogglePip={handlePip}
                onEnd={onEnd}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
