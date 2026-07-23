import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiLink } from 'react-icons/hi';
import { IoQrCodeOutline } from 'react-icons/io5';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRoom } from '@/context/RoomContext';
import { ROOM_CODE_LENGTH } from '@/utils/constants';

export default function JoinRoomCard() {
  const { joinRoom, isLoading, error } = useRoom();
  const [code, setCode] = useState('');
  const [useLink, setUseLink] = useState(false);
  const [link, setLink] = useState('');
  const [localError, setLocalError] = useState('');

  const extractCode = useCallback((url: string) => {
    const patterns = [
      /room\/([A-Z0-9]{6})/i,
      /code=([A-Z0-9]{6})/i,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1].toUpperCase();
    }
    return '';
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LENGTH);
    setCode(val);
    setLocalError('');
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLink(val);
    const extracted = extractCode(val);
    if (extracted) {
      setCode(extracted);
      setLocalError('');
    }
  };

  const handleJoin = () => {
    setLocalError('');
    const trimmedCode = code.trim();
    if (trimmedCode.length !== ROOM_CODE_LENGTH) {
      setLocalError(`Room code must be ${ROOM_CODE_LENGTH} characters`);
      return;
    }
    joinRoom(trimmedCode);
  };

  const displayError = localError || error || '';

  return (
    <Card className="!p-8" hover>
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
          <IoQrCodeOutline size={28} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Join a Room</h3>
          <p className="text-gray-400 text-sm mt-1">Connect with your partner's session</p>
        </div>

        <div className="w-full space-y-4 mt-2">
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

          {useLink ? (
            <Input
              label="Paste invite link"
              placeholder="https://app.com/room/ABC123"
              icon={<HiLink size={18} />}
              value={link}
              onChange={handleLinkChange}
            />
          ) : (
            <Input
              label="Room Code"
              placeholder="ABC123"
              value={code}
              onChange={handleCodeChange}
              className="text-center tracking-[0.3em] font-mono text-lg uppercase"
            />
          )}

          <button
            type="button"
            onClick={() => { setUseLink(!useLink); setLocalError(''); }}
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors mx-auto block"
          >
            {useLink ? 'Enter code manually' : 'Or paste invite link'}
          </button>

          <Button
            onClick={handleJoin}
            loading={isLoading}
            fullWidth
            size="lg"
            disabled={code.length !== ROOM_CODE_LENGTH && !useLink}
          >
            Join Room
          </Button>
        </div>
      </div>
    </Card>
  );
}
