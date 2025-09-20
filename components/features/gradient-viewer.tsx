'use client';

import { useState } from 'react';
import { Color } from '@/types';
import { createGradient } from '@/utils/colors';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GradientViewerProps {
  colors: Color[];
}

const gradientDirections = [
  { label: 'Left to Right', value: 'to right' },
  { label: 'Top to Bottom', value: 'to bottom' },
  { label: 'Top Left to Bottom Right', value: 'to bottom right' },
  { label: 'Top Right to Bottom Left', value: 'to bottom left' },
  { label: 'Radial', value: 'radial-gradient(circle' },
];

export function GradientViewer({ colors }: GradientViewerProps) {
  const [direction, setDirection] = useState('to right');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (colors.length < 2) {
    return (
      <div className="bg-card rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Gradient Preview</h3>
        <div className="text-center py-8 text-muted-foreground">
          Add at least 2 colors to create a gradient
        </div>
      </div>
    );
  }

  const colorHexes = colors.map(c => c.hex);
  const gradientCSS = direction.includes('radial')
    ? `radial-gradient(circle, ${colorHexes.join(', ')})`
    : createGradient(colorHexes, direction);

  const handleCopyCSS = async () => {
    try {
      await navigator.clipboard.writeText(`background: ${gradientCSS};`);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Gradient CSS copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Gradient Preview</h3>
      
      <div className="space-y-6">
        {/* Direction Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Direction</label>
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gradientDirections.map(dir => (
                <SelectItem key={dir.value} value={dir.value}>
                  {dir.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gradient Preview */}
        <div
          className="h-32 rounded-lg border shadow-inner"
          style={{ background: gradientCSS }}
        />

        {/* CSS Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">CSS Code</label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCSS}
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <div className="bg-muted p-3 rounded-md">
            <code className="text-xs text-muted-foreground break-all">
              background: {gradientCSS};
            </code>
          </div>
        </div>

        {/* Color Stops */}
        <div>
          <label className="text-sm font-medium mb-2 block">Color Stops</label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="font-mono">{color.hex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}