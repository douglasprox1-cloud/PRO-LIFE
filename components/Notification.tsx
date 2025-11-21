import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, CheckCircleIcon } from './Icons';

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success';
}

const Notification: React.FC<NotificationProps> = ({ isOpen, onClose, title, message, type = 'error' }) => {
  if (!isOpen) return null;

  const icon = type === 'error' ? (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
      <ExclamationTriangleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
    </div>
  ) : (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
      <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-slate-700 text-center"
          >
            {icon}
            <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
            <div className="mt-2">
              <p className="text-sm text-slate-400">{message}</p>
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 sm:text-sm"
                onClick={onClose}
              >
                OK
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
