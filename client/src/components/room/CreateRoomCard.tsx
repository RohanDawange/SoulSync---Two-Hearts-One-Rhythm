import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus } from 'react-icons/hi';
import { IoCheckmarkCircle } from 'react-icons/io5';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRoom } from '@/context/RoomContext';

export default function CreateRoomCard() {
  const { createRoom, isLoading, currentRoom } = useRoom();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentRoom) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentRoom]);

  const handleCreate = () => {
    setShowSuccess(false);
    createRoom();
  };

  return (
    <Card className="relative flex flex-col items-center text-center !p-8 min-h-[220px]" hover>
      <AnimatePresence mode="wait">
        {showSuccess && currentRoom ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <IoCheckmarkCircle size={48} className="text-green-400" />
            </motion.div>
            <p className="text-green-400 font-semibold text-lg">Room Created!</p>
            <p className="text-gray-400 text-sm">Code: <span className="text-white font-mono tracking-widest">{currentRoom.code}</span></p>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
              <HiPlus size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Create a Room</h3>
              <p className="text-gray-400 text-sm mt-1">Start a private session with your partner</p>
            </div>
            <Button onClick={handleCreate} loading={isLoading} size="lg" className="mt-2">
              Create Room
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
