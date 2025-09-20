'use client';

import { useState } from 'react';
import { Color, ColorBlindType } from '@/types';
import { simulateColorBlind } from '@/utils/colors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorSwatch } from '@/components/ui/color-swatch';

interface ColorBlindSimulatorProps {
  colors: Color[];
}

const colorBlindTypes: ColorBlindType[] = [
  { name: 'Deuteranomaly (Green weakness)', type: 'deuteranomaly' },
  { name: 'Protanomaly (Red weakness)', type: 'protanomaly' },
  { name: 'Tritanopia (Blue blindness)', type: 'tritanopia' },
  { name: 'Tritanomaly (Blue weakness)', type: 'tritanomaly' },
];

export function ColorBlindSimulator({ colors }: ColorBlindSimulatorProps) {
  const [selectedType, setSelectedType] = useState<ColorBlindType | null>(null);

  const simulatedColors = selectedType
    ? colors.map(color => ({
        ...color,
        hex: simulateColorBlind(color.hex, selectedType.type),
      }))
    : colors;

  return (
    <div className="bg-card rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Color Blindness Simulator</h3>
      
      <div className="mb-6">
        <Select
          value={selectedType?.type || ''}
          onValueChange={(value) => {
            const type = colorBlindTypes.find(t => t.type === value);
            setSelectedType(type || null);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select color blindness type" />
          </SelectTrigger>
          <SelectContent>
            {colorBlindTypes.map(type => (
              <SelectItem key={type.type} value={type.type}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {/* Original Palette */}
        <div>
          <h4 className="text-sm font-medium mb-3">Original Palette</h4>
          <div className="flex space-x-2 h-20">
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex-1 rounded-md border"
                style={{ backgroundColor: color.hex }}
                title={color.hex}
              />
            ))}
          </div>
        </div>

        {/* Simulated Palette */}
        {selectedType && (
          <div>
            <h4 className="text-sm font-medium mb-3">
              As seen with {selectedType.name}
            </h4>
            <div className="flex space-x-2 h-20">
              {simulatedColors.map((color, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-md border"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedType && (
        <div className="mt-6 p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            This simulation helps you understand how your palette appears to people with {selectedType.name.toLowerCase()}.
            Consider using tools like patterns or icons in addition to color for important information.
          </p>
        </div>
      )}
    </div>
  );
}