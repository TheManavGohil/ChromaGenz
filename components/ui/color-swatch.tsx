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
      className={`relative group h-64 cursor-pointer transition-all duration-300 ease-in-out ${
        isExpanded ? 'flex-[2]' : 'flex-1'
      } ${className}`}
      style={{ backgroundColor: color.hex }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Color Info */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        style={{ color: textColor }}
      >
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3">
          <div className="text-sm font-mono font-medium">{color.hex}</div>
          {color.name && (
            <div className="text-xs opacity-80 mt-1">{color.name}</div>
          )}
          <div className="text-xs opacity-60 mt-1">{color.rgb}</div>
          <div className="text-xs opacity-60">{color.hsl}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {onToggleLock && (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
          >
            {isLocked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
          </Button>
        )}

        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>

        {onViewShades && (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onViewShades();
            }}
          >
            <Palette className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Lock indicator */}
      {isLocked && (
        <div className="absolute top-2 left-2">
          <Lock className="h-4 w-4" style={{ color: textColor }} />
        </div>
      )}
    </motion.div>
  );
}