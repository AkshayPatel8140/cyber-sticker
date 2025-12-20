'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  show: boolean;
  message: string;
}

export default function Toast({ show, message }: ToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="px-6 py-3 bg-gray-900 text-white rounded-lg shadow-lg text-sm font-medium">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
