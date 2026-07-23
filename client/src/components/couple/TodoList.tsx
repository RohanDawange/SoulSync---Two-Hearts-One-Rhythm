import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: Date;
}

const STORAGE_KEY = 'soulsync-todos';

function loadTodos(): TodoItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTodos(todos: TodoItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {}
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>(loadTodos);
  const [input, setInput] = useState('');

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const addTodo = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: trimmed,
      done: false,
      createdAt: new Date(),
    };
    setTodos((prev) => [...prev, newTodo]);
    setInput('');
  }, [input]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const total = todos.length;
  const completed = todos.filter((t) => t.done).length;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-white mb-3">To-Do List</h3>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task..."
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          />
        </div>
        <Button onClick={addTodo} disabled={!input.trim()} icon={<FaPlus size={12} />}>
          Add
        </Button>
      </div>

      {total > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>{completed} of {total} completed</span>
            <span>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </div>
      )}

      <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 group p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <button onClick={() => toggleTodo(todo.id)} className="text-lg shrink-0">
                {todo.done ? (
                  <FaCheckCircle className="text-green-400" size={18} />
                ) : (
                  <FaRegCircle className="text-gray-500 group-hover:text-gray-300" size={18} />
                )}
              </button>
              <span
                className={`flex-1 text-sm truncate ${
                  todo.done ? 'line-through text-gray-500' : 'text-gray-200'
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"
              >
                <FaTrash size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {todos.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-6">No tasks yet. Add one above!</p>
        )}
      </div>
    </Card>
  );
}
