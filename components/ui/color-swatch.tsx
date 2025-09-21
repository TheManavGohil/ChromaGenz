'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Lock, Unlock, Palette, Check } from 'lucide-react';
import { Color } from '@/types';
import { getTextColor } from '@/utils/colors';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ColorSwatchProps {
  color: Color;
  isLocked?: boolean;
  isExpanded?: boolean;
  onToggleLock?: () => void;
  onViewShades?: () => void;
  onSave?: () => void;
  onAdjust?: () => void;
  className?: string;
}

export function ColorSwatch({
  color,
  isLocked = false,
  isExpanded = false,
  onToggleLock,
  onViewShades,
  onSave,
  onAdjust,
  className = '',
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const textColor = getTextColor(color.hex);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      toast({
        title: "Copied!",
        description: `${color.hex} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <motion.div
      className={`relative group cursor-pointer transition-all duration-500 ease-in-out overflow-hidden ${className}`}
      style={{ backgroundColor: color.hex }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      {/* Color Info - Bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 transform ${
          isExpanded ? 'translate-y-0' : 'translate-y-full'
        } transition-transform duration-500 ease-out`}
        style={{ color: textColor }}
      >
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 text-center">
          <div className="text-lg font-mono font-bold mb-2">{color.hex}</div>
          {color.name && (
            <div className="text-sm opacity-90 mb-2">{color.name}</div>
          )}
          <div className="text-xs opacity-70 space-y-1">
            <div>{color.rgb}</div>
            <div>{color.hsl}</div>
          </div>
        </div>
      </div>

      {/* Centered Action Buttons */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transform ${
          isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        } transition-all duration-500 ease-out pointer-events-none group-hover:pointer-events-auto`}
      >
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md rounded-full p-3 shadow-lg">
          {onToggleLock && (
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full h-10 w-10 p-0 bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock();
              }}
              title={isLocked ? "Unlock color" : "Lock color"}
            >
              {isLocked ? (
                <Lock className="h-4 w-4" style={{ color: textColor }} />
              ) : (
                <Unlock className="h-4 w-4" style={{ color: textColor }} />
              )}
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            className="rounded-full h-10 w-10 p-0 bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            title="Copy color code"
          >
            {copied ? (
              <Check className="h-4 w-4" style={{ color: textColor }} />
            ) : (
              <Copy className="h-4 w-4" style={{ color: textColor }} />
            )}
          </Button>

          {onViewShades && (
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full h-10 w-10 p-0 bg-white/20 border-white/30 hover:bg-white/30 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onViewShades();
              }}
              title="View shades"
            >
              <Palette className="h-4 w-4" style={{ color: textColor }} />
            </Button>
          )}
        </div>
      </div>

      {/* Lock indicator - Top Left */}
      {isLocked && (
        <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md rounded-full p-2">
          <Lock className="h-4 w-4" style={{ color: textColor }} />
        </div>
      )}

      {/* Color Code - Always visible in top right */}
      <div 
        className="absolute top-4 right-4 bg-black/30 backdrop-blur-md rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ color: textColor }}
      >
        <div className="text-sm font-mono font-medium">{color.hex}</div>
      </div>
    </motion.div>
  );
}