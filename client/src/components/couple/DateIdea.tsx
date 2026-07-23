import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRandom } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

interface DateIdeaItem {
  idea: string;
  category: 'Virtual' | 'Outdoor' | 'Indoor' | 'Creative';
}

const DATE_IDEAS: DateIdeaItem[] = [
  { idea: 'Virtual movie night with synchronized streaming', category: 'Virtual' },
  { idea: 'Cook the same recipe together over video call', category: 'Virtual' },
  { idea: 'Stargaze together and share what you see', category: 'Outdoor' },
  { idea: 'Have a picnic in the park', category: 'Outdoor' },
  { idea: 'Go for a sunset walk hand in hand', category: 'Outdoor' },
  { idea: 'Visit a museum or art gallery', category: 'Outdoor' },
  { idea: 'Build a blanket fort and watch movies', category: 'Indoor' },
  { idea: 'Board game night with your favorite snacks', category: 'Indoor' },
  { idea: 'Bake something sweet together', category: 'Indoor' },
  { idea: 'Create a playlist of songs that remind you of each other', category: 'Creative' },
  { idea: 'Write each other love letters and read them aloud', category: 'Creative' },
  { idea: 'Paint or draw together even if you\'re not artists', category: 'Creative' },
  { idea: 'Take an online dance class together', category: 'Virtual' },
  { idea: 'Play an online multiplayer game together', category: 'Virtual' },
  { idea: 'Have a themed dinner night (Italian, Mexican, etc.)', category: 'Indoor' },
];

function getRandomIdea(): DateIdeaItem {
  return DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)];
}

const categoryColors: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  Virtual: 'info',
  Outdoor: 'success',
  Indoor: 'warning',
  Creative: 'default',
};

export default function DateIdea() {
  const [current, setCurrent] = useState<DateIdeaItem | null>(null);
  const [key, setKey] = useState(0);

  const generate = useCallback(() => {
    setCurrent(getRandomIdea());
    setKey((k) => k + 1);
  }, []);

  return (
    <Card>
      <div className="flex flex-col items-center gap-4 text-center">
        <FaHeart className="text-pink-500" size={24} />
        <h3 className="text-sm font-semibold text-white">Date Idea Generator</h3>

        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={key}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-200 leading-relaxed mb-3">{current.idea}</p>
                <Badge variant={categoryColors[current.category]} size="sm">
                  {current.category}
                </Badge>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Button onClick={generate} icon={<FaRandom size={14} />}>
          {current ? 'Another Idea!' : 'Give Me a Date Idea!'}
        </Button>
      </div>
    </Card>
  );
}
