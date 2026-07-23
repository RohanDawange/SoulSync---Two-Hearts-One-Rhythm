import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMusic, FaCommentDots, FaVideo, FaList, FaHeart, FaUserFriends } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import CreateRoomCard from '@/components/room/CreateRoomCard';
import JoinRoomCard from '@/components/room/JoinRoomCard';
import RoomCard from '@/components/room/RoomCard';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { usePlayer } from '@/context/PlayerContext';

const quickActions = [
  { icon: <FaMusic size={16} />, label: 'Find Music', path: '/room', color: 'from-purple-600 to-purple-700' },
  { icon: <FaCommentDots size={16} />, label: 'Chat Now', path: '/room', color: 'from-pink-600 to-pink-700' },
  { icon: <FaVideo size={16} />, label: 'Start Call', path: '/room', color: 'from-indigo-600 to-indigo-700' },
  { icon: <FaList size={16} />, label: 'View Playlist', path: '/room', color: 'from-teal-600 to-teal-700' },
];

const recentSongsPlaceholder = [
  { title: 'Perfect', artist: 'Ed Sheeran', albumArt: '' },
  { title: 'Lover', artist: 'Taylor Swift', albumArt: '' },
  { title: 'All of Me', artist: 'John Legend', albumArt: '' },
  { title: 'Shallow', artist: 'Lady Gaga & Bradley Cooper', albumArt: '' },
  { title: 'Thinking Out Loud', artist: 'Ed Sheeran', albumArt: '' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { currentRoom, isLoading: roomLoading } = useRoom();
  const { currentSong } = usePlayer();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="text-white">Welcome back, </span>
          <span className="text-gradient">{user?.displayName || 'Friend'}</span>
        </h1>
        <p className="text-gray-400 mt-1">Here&apos;s what&apos;s happening with your music journey.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Card hover={false} className="!p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <FaMusic className="text-purple-400" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Room Status</p>
              {roomLoading ? (
                <Skeleton width="80px" height="16px" />
              ) : (
                <p className="text-white font-semibold">{currentRoom ? 'Active' : 'No Room'}</p>
              )}
            </div>
          </div>
        </Card>
        <Card hover={false} className="!p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-600/20 flex items-center justify-center">
              <FaHeart className="text-pink-400" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Partner</p>
              {roomLoading ? (
                <Skeleton width="80px" height="16px" />
              ) : (
                <p className="text-white font-semibold">
                  {currentRoom && currentRoom.participants.length > 1 ? 'Connected' : 'Waiting'}
                </p>
              )}
            </div>
          </div>
        </Card>
        <Card hover={false} className="!p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
              <FaList className="text-indigo-400" size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Songs Played</p>
              <p className="text-white font-semibold">{currentSong ? '1 Playing' : '0'}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-10">
        {roomLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : currentRoom ? (
          <div className="max-w-md">
            <RoomCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreateRoomCard />
            <JoinRoomCard />
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.path}>
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-br ${action.color} rounded-xl p-4 text-center cursor-pointer`}
              >
                <div className="flex justify-center mb-2 text-white">{action.icon}</div>
                <p className="text-white text-sm font-medium">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card hover={false} className="!p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaMusic className="text-purple-400" size={16} />
              Recent Songs
            </h2>
            <div className="space-y-3">
              {recentSongsPlaceholder.map((song, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <FaMusic className="text-gray-500" size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{song.title}</p>
                    <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                  </div>
                  <Badge variant="default" size="sm">Played</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card hover={false} className="!p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaUserFriends className="text-pink-400" size={16} />
              Partner Activity
            </h2>
            {currentRoom && currentRoom.participants.length > 1 ? (
              <div className="space-y-4">
                {currentRoom.participants
                  .filter((p) => p.uid !== user?.uid)
                  .map((partner) => (
                    <div key={partner.uid} className="flex items-center gap-3">
                      <Avatar src={partner.photoURL} name={partner.displayName} size="md" online={partner.online} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{partner.displayName}</p>
                        <p className="text-xs text-gray-400">
                          {partner.online ? (currentSong ? 'Listening to music' : 'Online') : 'Offline'}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${partner.online ? 'bg-green-500' : 'bg-gray-500'}`} />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaUserFriends className="text-gray-600 mx-auto mb-3" size={32} />
                <p className="text-gray-500 text-sm">No partner connected yet</p>
                <p className="text-gray-600 text-xs mt-1">Create or join a room to start</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
