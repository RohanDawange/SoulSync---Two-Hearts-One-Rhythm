import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaSyncAlt } from 'react-icons/fa';
import Card from '@/components/ui/Card';

const QUOTES = [
  { text: 'In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.', author: 'Maya Angelou' },
  { text: 'I have waited for this opportunity for more than half a century, to repeat to you once again my vow of faithful love.', author: 'Gabriel Garcia Marquez' },
  { text: 'Love is not about how many days, months, or years you\'ve been together. Love is about how much you love each other every single day.', author: 'Unknown' },
  { text: 'I love you not because of who you are, but because of who I am when I am with you.', author: 'Roy Croft' },
  { text: 'The best thing to hold onto in life is each other.', author: 'Audrey Hepburn' },
  { text: 'I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more.', author: 'Angelita Lim' },
  { text: 'Love is composed of a single soul inhabiting two bodies.', author: 'Aristotle' },
  { text: 'You are my sun, my moon, and all my stars.', author: 'E.E. Cummings' },
  { text: 'To love and be loved is to feel the sun from both sides.', author: 'David Viscott' },
  { text: 'Every love story is beautiful, but ours is my favorite.', author: 'Unknown' },
  { text: 'I look at you and see the rest of my life in front of my eyes.', author: 'Unknown' },
  { text: 'Love isn\'t something you find. Love is something that finds you.', author: 'Loretta Young' },
  { text: 'You are my today and all of my tomorrows.', author: 'Leo Christopher' },
  { text: 'The only thing better than having you is having you by my side.', author: 'Unknown' },
  { text: 'I love you more than coffee, but please don\'t make me prove it.', author: 'Unknown' },
  { text: 'We loved with a love that was more than love.', author: 'Edgar Allan Poe' },
  { text: 'Grow old with me! The best is yet to be.', author: 'Robert Browning' },
  { text: 'I seem to have loved you in numberless forms, numberless times.', author: 'Rabindranath Tagore' },
  { text: 'Take my hand, take my whole life too. For I can\'t help falling in love with you.', author: 'Elvis Presley' },
  { text: 'You are the finest, loveliest, tenderest, and most beautiful person I have ever known.', author: 'F. Scott Fitzgerald' },
];

function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export default function DailyQuote() {
  const [quote, setQuote] = useState(getRandomQuote);
  const [key, setKey] = useState(0);

  const refresh = useCallback(() => {
    setQuote(getRandomQuote());
    setKey((k) => k + 1);
  }, []);

  return (
    <Card>
      <div className="flex items-start gap-3">
        <FaQuoteLeft className="text-purple-500/30 shrink-0 mt-1" size={24} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Love Quote</h3>
            <button
              onClick={refresh}
              className="text-gray-500 hover:text-purple-400 transition-colors p-1"
            >
              <FaSyncAlt size={12} />
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-gray-200 leading-relaxed italic">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-xs text-gray-400 mt-2">&mdash; {quote.author}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}
