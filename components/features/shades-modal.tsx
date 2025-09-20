'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Color } from '@/types';
import { generateShades, getTextColor } from '@/utils/colors';
import { Button } from '@/components/ui/button';

interface ShadesModalProps {
  color: Color;
  isOpen: boolean;
  onClose: () => void;
  onSelectShade: (shade: string) => void;
}

export function ShadesModal({
  color,
  isOpen,
  onClose,
  onSelectShade,
}: ShadesModalProps) {
  const shades = generateShades(color.hex, 15);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-background rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Shades of {color.name || color.hex}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Shades Grid */}
          <div className="p-6 space-y-2 max-h-96 overflow-y-auto">
            {shades.map((shade, index) => {
              const textColor = getTextColor(shade);
              return (
                <motion.button
                  key={index}
                  className="w-full h-12 rounded-md flex items-center justify-between px-4 text-sm font-mono transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{
                    backgroundColor: shade,
                    color: textColor,
                  }}
                  onClick={() => onSelectShade(shade)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{shade.toUpperCase()}</span>
                  <span className="text-xs opacity-70">
                    {index === 0 ? 'Lightest' : index === shades.length - 1 ? 'Darkest' : ''}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}