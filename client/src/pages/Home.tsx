import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { FaHeart, FaMusic, FaCommentDots, FaVideo, FaList, FaLock, FaArrowRight, FaStepForward, FaPlay, FaQuoteLeft } from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';
import Button from '@/components/ui/Button';

const features = [
  { icon: <FaMusic size={24} />, title: 'Real-Time Sync', description: 'Play together in perfect harmony with millisecond-accurate synchronization.' },
  { icon: <FaCommentDots size={24} />, title: 'Live Chat', description: 'Text, emoji, GIFs, and more to express every feeling.' },
  { icon: <FaVideo size={24} />, title: 'Voice & Video', description: 'Face-to-face calls while you listen together.' },
  { icon: <FaList size={24} />, title: 'Shared Playlists', description: 'Build music collections together in real-time.' },
  { icon: <FaHeart size={24} />, title: 'Couple Space', description: 'Memories, notes, to-do lists, and anniversary tracker.' },
  { icon: <FaLock size={24} />, title: 'Private Rooms', description: 'Just the two of you — no interruptions, no strangers.' },
];

const steps = [
  { icon: <FaMusic size={20} />, title: 'Create or Join a Room', description: 'Start a private room or join your partner with a unique 6-digit code.' },
  { icon: <FaStepForward size={20} />, title: 'Add Music from Anywhere', description: 'Share songs from YouTube, Spotify, or SoundCloud instantly.' },
  { icon: <FaPlay size={20} />, title: 'Enjoy Together in Real-Time', description: 'Listen, chat, and react together as if you were in the same room.' },
];

const testimonials = [
  { quote: 'SoulSync made our long-distance relationship feel so much closer. Hearing the same song at the same time... magic.', name: 'Priya & Arjun', location: 'Mumbai & Delhi' },
  { quote: 'We start every evening with SoulSync. It\'s our little ritual now. The sync is flawless!', name: 'Sarah & Mike', location: 'New York & London' },
  { quote: 'The shared playlist feature is everything. We\'ve built our love story through songs.', name: 'Emma & Carlos', location: 'Sydney & Barcelona' },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

function FloatingIcon({ icon, className, delay }: { icon: React.ReactNode; className?: string; delay?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.15, scale: 1 }}
      transition={{ delay: delay ? parseFloat(delay) : 0, duration: 1 }}
      className={`absolute text-white pointer-events-none ${className || ''}`}
    >
      {icon}
    </motion.div>
  );
}

export default function Home() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <div className="hero-gradient min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 pt-16">
        <FloatingIcon icon={<FaHeart size={40} />} className="top-[15%] left-[10%] animate-float" />
        <FloatingIcon icon={<FaMusic size={30} />} className="top-[25%] right-[12%] animate-float-delayed" />
        <FloatingIcon icon={<FaHeart size={24} />} className="bottom-[30%] left-[20%] animate-float-slow" />
        <FloatingIcon icon={<FaMusic size={36} />} className="bottom-[20%] right-[18%] animate-float" />
        <FloatingIcon icon={<FaHeart size={20} />} className="top-[40%] left-[5%] animate-float-delayed" />
        <FloatingIcon icon={<FaMusic size={28} />} className="top-[35%] right-[5%] animate-float-slow" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center z-10 max-w-4xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
          >
            <HiOutlineSparkles className="text-yellow-400" size={16} />
            <span className="text-sm text-gray-300">The #1 Sync Music App for Couples</span>
          </motion.div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6">
            <span className="text-white">Two Hearts,</span>
            <br />
            <span className="text-gradient">One Rhythm</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience music together in real-time with your loved one, no matter the distance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg" icon={<FaArrowRight size={16} />} className="!px-8 !py-3.5 !text-base !shadow-lg !shadow-purple-500/25">
                Get Started
              </Button>
            </Link>
            <Button variant="secondary" size="lg" onClick={scrollToFeatures} className="!px-8 !py-3.5 !text-base">
              Learn More
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-500 text-xs flex flex-col items-center gap-1"
          >
            <span>Scroll to explore</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      <section ref={featuresRef} className="py-24 px-4 bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to <span className="text-gradient">Stay Connected</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Built from the ground up for couples who love music and each other.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-gray-950 via-indigo-950/10 to-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Three simple steps to start your musical journey together.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          <div className="hidden md:block absolute left-[72px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-purple-500/50" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="relative flex items-start gap-6 mb-12 last:mb-0"
            >
              <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/30">
                {step.icon}
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gray-950 border-2 border-purple-500 flex items-center justify-center text-xs font-bold text-purple-400">
                  {i + 1}
                </div>
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Loved by <span className="text-gradient">Couples</span> Worldwide
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative"
            >
              <FaQuoteLeft className="text-purple-500/30 text-3xl mb-3" />
              <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-white font-medium text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-gray-950 via-pink-950/10 to-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-2 gap-8 md:gap-16 text-center mb-20">
            <div>
              <AnimatedCounter target={10000} suffix="+" />
              <p className="text-gray-400 text-sm mt-2">Couples Connected</p>
            </div>
            <div>
              <AnimatedCounter target={1000000} suffix="+" />
              <p className="text-gray-400 text-sm mt-2">Songs Synced</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative rounded-3xl p-12 md:p-16 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-purple-600/20 border border-white/10 rounded-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to <span className="text-gradient">Sync</span>?
            </h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto">
              Join thousands of couples already sharing the rhythm of their love.
            </p>
            <Link to="/login">
              <Button size="lg" className="!px-10 !py-3.5 !text-base !shadow-lg !shadow-purple-500/25">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  );
}
