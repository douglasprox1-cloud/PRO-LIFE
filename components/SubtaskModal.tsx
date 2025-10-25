
import React, { useState, useEffect } from 'react';
import { Task, Subtask } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon } from './Icons';

interface SubtaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUpdateTask: (task: Task) => void;
}

const SubtaskModal: React.FC<SubtaskModalProps> = ({ isOpen, onClose, task, onUpdateTask }) => {
  const [newSubtaskText, setNewSubtaskText] = useState('');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskText.trim() === '') return;

    const newSubtask: Subtask = {
      id: `sub_${Date.now()}`,
      text: newSubtaskText.trim(),
      completed: false,
    };

    const updatedTask = {
      ...task,
      subtasks: [...task.subtasks, newSubtask],
    };
    onUpdateTask(updatedTask);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
     const updatedSubtasks = task.subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
     );
     onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter(st => st.id !== subtaskId);
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-slate-700"
                >
                    <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {task.subtasks.map(subtask => (
                            <div key={subtask.id} className="flex items-center justify-between bg-slate-700 p-2 rounded-md group">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox"
                                        checked={subtask.completed}
                                        onChange={() => handleToggleSubtask(subtask.id)}
                                        className="form-checkbox h-5 w-5 bg-slate-600 border-slate-500 rounded text-indigo-500 focus:ring-indigo-500 mr-3"
                                    />
                                    <span className={subtask.completed ? 'line-through text-slate-400' : ''}>
                                        {subtask.text}
                                    </span>
                                </div>
                                <button onClick={() => handleDeleteSubtask(subtask.id)} className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                         {task.subtasks.length === 0 && (
                            <p className="text-slate-400 text-sm text-center py-4">Nenhuma subtarefa ainda. Adicione uma abaixo!</p>
                        )}
                    </div>

                    <form onSubmit={handleAddSubtask} className="mt-4 flex gap-2">
                        <input 
                            type="text"
                            value={newSubtaskText}
                            onChange={(e) => setNewSubtaskText(e.target.value)}
                            placeholder="Nova subtarefa..."
                            className="flex-grow bg-slate-700 p-2 rounded-md placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                            Adicionar
                        </button>
                    </form>
                    
                    <button onClick={onClose} className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        Fechar
                    </button>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
};

export default SubtaskModal;
