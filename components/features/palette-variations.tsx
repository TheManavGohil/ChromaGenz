'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Color } from '@/types';
import { generatePaletteVariations, getTextColor } from '@/utils/colors';
import { 
  Palette as PaletteIcon, 
  Sun, 
  Thermometer, 
  Lightbulb,
  Check
} from 'lucide-react';

interface PaletteVariationsProps {
  colors: Color[];
  onApplyVariation: (colors: Color[]) => void;
}

export function PaletteVariations({ colors, onApplyVariation }: PaletteVariationsProps) {
  const [selectedTab, setSelectedTab] = useState('shades');
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);
  
  const variations = generatePaletteVariations(colors);
  
  const variationLabels = {
    shades: ['Very Dark', 'Dark', 'Original', 'Light', 'Very Light'],
    hueShifts: ['-60°', '-30°', 'Original', '+30°', '+60°'],
    temperature: ['Very Cool', 'Cool', 'Neutral', 'Warm', 'Very Warm'],
    luminance: ['Dark (10%)', 'Medium Dark (30%)', 'Medium (50%)', 'Medium Light (70%)', 'Light (90%)']
  };

  const tabConfig = [
    { 
      value: 'shades', 
      label: 'Shades', 
      icon: Sun, 
      description: 'Lightness variations of your palette',
      variations: variations.shades
    },
    { 
      value: 'hueShifts', 
      label: 'Hue', 
      icon: PaletteIcon, 
      description: 'Hue rotations for different moods',
      variations: variations.hueShifts
    },
    { 
      value: 'temperature', 
      label: 'Temperature', 
      icon: Thermometer, 
      description: 'Cool to warm color temperature shifts',
      variations: variations.temperature
    },
    { 
      value: 'luminance', 
      label: 'Luminance', 
      icon: Lightbulb, 
      description: 'Brightness-balanced variations',
      variations: variations.luminance
    }
  ];

  const currentConfig = tabConfig.find(config => config.value === selectedTab);
  const currentVariations = currentConfig?.variations || [];
  const currentLabels = variationLabels[selectedTab as keyof typeof variationLabels] || [];

  const handleApplyVariation = (variationIndex: number) => {
    const variationColors = currentVariations[variationIndex];
    if (variationColors) {
      onApplyVariation(variationColors);
      setSelectedVariation(variationIndex);
      
      // Reset selection after a short delay to show feedback
      setTimeout(() => setSelectedVariation(null), 1000);
    }
  };

  const ColorSwatch = ({ color, size = 'md' }: { color: Color; size?: 'sm' | 'md' }) => {
    const sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-12 h-12'
    };

    return (
      <div 
        className={`${sizeClasses[size]} rounded-md border border-white/50 shadow-sm flex items-center justify-center text-xs font-medium transition-transform hover:scale-105`}
        style={{ 
          backgroundColor: color.hex,
          color: getTextColor(color.hex)
        }}
        title={color.hex}
      >
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="flex items-center gap-2">
          <PaletteIcon className="h-5 w-5 text-primary" />
          Palette Variations
        </CardTitle>
        <CardDescription>
          Explore different variations of your color palette
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            {tabConfig.map((config) => {
              const Icon = config.icon;
              return (
                <TabsTrigger 
                  key={config.value} 
                  value={config.value}
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabConfig.map((config) => (
            <TabsContent key={config.value} value={config.value} className="space-y-3">
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold mb-1">{config.label}</h3>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
                {config.variations.map((variation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <div className="bg-muted/30 rounded-lg p-3 transition-all duration-200 group-hover:bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {currentLabels[index]}
                          </Badge>
                          {index === 2 && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              Original
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={() => handleApplyVariation(index)}
                          variant={selectedVariation === index ? "default" : "outline"}
                          size="sm"
                          className="transition-all duration-200 h-7 px-3"
                          disabled={selectedVariation === index}
                        >
                          {selectedVariation === index ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Applied
                            </>
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex gap-1.5 justify-center mb-2">
                        {variation.map((color, colorIndex) => (
                          <ColorSwatch key={colorIndex} color={color} size="sm" />
                        ))}
                      </div>
                      
                      {/* Compact color codes */}
                      <div className="flex gap-1 justify-center overflow-x-auto">
                        {variation.map((color, colorIndex) => (
                          <div key={colorIndex} className="text-center min-w-0">
                            <div className="text-xs font-mono text-muted-foreground/80 truncate">
                              {color.hex}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Compact tips section */}
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                  <config.icon className="h-4 w-4 text-primary" />
                  Tips for {config.label}
                </h4>
                <div className="text-xs text-muted-foreground">
                  {config.value === 'shades' && (
                    <p>Use lighter shades for backgrounds and darker ones for text or emphasis.</p>
                  )}
                  {config.value === 'hueShifts' && (
                    <p>Hue shifts can create complementary or analogous color schemes for different moods.</p>
                  )}
                  {config.value === 'temperature' && (
                    <p>Cool colors feel calming and professional, while warm colors feel energetic and friendly.</p>
                  )}
                  {config.value === 'luminance' && (
                    <p>Different luminance levels help create visual hierarchy and ensure readability.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
