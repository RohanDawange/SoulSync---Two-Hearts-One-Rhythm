import { useState, useRef, useCallback, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaSmile, FaImage, FaGift } from 'react-icons/fa';
import { useChat } from '@/context/ChatContext';
import EmojiPicker from './EmojiPicker';
import GIFPicker from './GIFPicker';

const MAX_CHARS = 1000;

export default function ChatInput() {
  const { sendMessage, setTyping } = useChat();
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 4;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setTyping(false);
  }, [text, sendMessage, setTyping]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (val.length <= MAX_CHARS) {
        setText(val);
      }
      setTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
    },
    [setTyping]
  );

  const handleEmojiSelect = useCallback((emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  }, []);

  const handleGifSelect = useCallback(
    (url: string) => {
      sendMessage(url, 'gif');
      setShowGif(false);
    },
    [sendMessage]
  );

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        sendMessage(result, 'image');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [sendMessage]);

  const charsLeft = MAX_CHARS - text.length;

  return (
    <div className="relative border-t border-white/10 bg-black/30 backdrop-blur-sm">
      {showEmoji && (
        <div className="absolute bottom-full left-0 right-0 z-20">
          <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
        </div>
      )}
      {showGif && (
        <div className="absolute bottom-full left-0 right-0 z-20">
          <GIFPicker onSelect={handleGifSelect} onClose={() => setShowGif(false)} />
        </div>
      )}
      <div className="flex items-end gap-2 p-3">
        <div className="flex items-center gap-1 pb-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setShowEmoji((p) => !p); setShowGif(false); }}
            className="p-2 text-gray-400 hover:text-yellow-400 transition-colors rounded-lg hover:bg-white/10"
          >
            <FaSmile size={18} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setShowGif((p) => !p); setShowEmoji(false); }}
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors rounded-lg hover:bg-white/10"
          >
            <FaGift size={18} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleImageUpload}
            className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-lg hover:bg-white/10"
          >
            <FaImage size={18} />
          </motion.button>
        </div>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 scrollbar-thin max-h-[96px]"
          />
          <div className="absolute right-3 bottom-3">
            <motion.button
              whileTap={{ scale: text.trim() ? 0.9 : 1 }}
              onClick={handleSend}
              disabled={!text.trim()}
              className={`p-1.5 rounded-lg transition-all ${
                text.trim()
                  ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20'
                  : 'text-gray-600 cursor-not-allowed'
              }`}
            >
              <FaPaperPlane size={16} />
            </motion.button>
          </div>
        </div>
      </div>
      <div className="flex justify-end px-4 pb-1">
        <span className={`text-[10px] ${charsLeft < 50 ? 'text-red-400' : 'text-gray-600'}`}>
          {charsLeft}
        </span>
      </div>
    </div>
  );
}
