'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ColorSwatch } from '@/components/ui/color-swatch';
import { ShadesModal } from './shades-modal';
import { Color, Palette } from '@/types';

interface PaletteViewerProps {
  palette: Palette;
  onColorChange?: (index: number, color: Color) => void;
  onToggleLock?: (index: number) => void;
}

export function PaletteViewer({
  palette,
  onColorChange,
  onToggleLock,
}: PaletteViewerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [shadesModalIndex, setShadesModalIndex] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setExpandedIndex(index);
  };

  const handleMouseLeave = () => {
    setExpandedIndex(null);
  };

  const handleViewShades = (index: number) => {
    setShadesModalIndex(index);
  };

  const handleShadeSelect = (shade: string) => {
    if (shadesModalIndex !== null && onColorChange) {
      const updatedColor = {
        ...palette.colors[shadesModalIndex],
        hex: shade,
      };
      onColorChange(shadesModalIndex, updatedColor);
    }
    setShadesModalIndex(null);
  };

  return (
    <>
      <motion.div
        className="flex h-64 rounded-lg overflow-hidden shadow-lg group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {palette.colors.map((color, index) => (
          <div
            key={index}
            className="transition-all duration-300 ease-in-out"
            style={{
              flex: expandedIndex === index ? '3' : '1',
              opacity: expandedIndex === null || expandedIndex === index ? '1' : '0.5',
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <ColorSwatch
              color={color}
              isLocked={palette.locked?.[index]}
              isExpanded={expandedIndex === index}
              onToggleLock={() => onToggleLock?.(index)}
              onViewShades={() => handleViewShades(index)}
              className="h-full"
            />
          </div>
        ))}
      </motion.div>

      {shadesModalIndex !== null && (
        <ShadesModal
          color={palette.colors[shadesModalIndex]}
          isOpen={shadesModalIndex !== null}
          onClose={() => setShadesModalIndex(null)}
          onSelectShade={handleShadeSelect}
        />
      )}
    </>
  );
}