'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaletteViewer } from '@/components/features/palette-viewer';
import { AccessibilityChecker } from '@/components/features/accessibility-checker';
import { ColorBlindSimulator } from '@/components/features/colorblind-simulator';
import { GradientViewer } from '@/components/features/gradient-viewer';
import { generateRandomPalette, hexToColor } from '@/utils/colors';
import { savePalette } from '@/utils/storage';
import { Palette, Color } from '@/types';
import { Sparkles, Image, Link as LinkIcon, Shuffle, Save, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';

export default function Generate() {
  const [palette, setPalette] = useState<Palette | null>(null);
  const [inputType, setInputType] = useState('prompt');
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Generate initial palette
  useEffect(() => {
    generatePalette();
  }, []);

  // Spacebar shortcut for generation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey && e.target === document.body) {
        e.preventDefault();
        generatePalette();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const generatePalette = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const colors = generateRandomPalette(5);
      const newPalette: Palette = {
        id: Date.now().toString(),
        name: `Generated Palette ${new Date().toLocaleTimeString()}`,
        colors,
        createdAt: new Date().toISOString(),
        locked: new Array(colors.length).fill(false),
      };
      
      setPalette(newPalette);
      setIsGenerating(false);
    }, 800);
  }, []);

  const handleColorChange = (index: number, color: Color) => {
    if (palette) {
      const newColors = [...palette.colors];
      newColors[index] = color;
      setPalette({ ...palette, colors: newColors });
    }
  };

  const handleToggleLock = (index: number) => {
    if (palette) {
      const newLocked = [...(palette.locked || [])];
      newLocked[index] = !newLocked[index];
      setPalette({ ...palette, locked: newLocked });
    }
  };

  const handleSavePalette = () => {
    if (palette) {
      const paletteToSave = {
        ...palette,
        name: prompt || palette.name,
        tags: prompt ? [prompt] : undefined,
      };
      savePalette(paletteToSave);
      toast({
        title: "Palette Saved!",
        description: "Your palette has been saved to your collection.",
      });
    }
  };

  // Mock image upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsGenerating(true);
      // Mock extraction - generate random palette
      setTimeout(() => {
        generatePalette();
        toast({
          title: "Colors Extracted!",
          description: `Generated palette from ${file.name}`,
        });
      }, 1200);
    }
  }, [generatePalette, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    multiple: false,
  });

  const handleUrlGeneration = () => {
    if (url.trim()) {
      setIsGenerating(true);
      // Mock URL extraction
      setTimeout(() => {
        generatePalette();
        toast({
          title: "Colors Extracted!",
          description: `Generated palette from website colors`,
        });
      }, 1000);
    }
  };

  const handleExport = (format: string) => {
    if (!palette) return;

    switch (format) {
      case 'hex':
        const hexColors = palette.colors.map(c => c.hex).join('\n');
        navigator.clipboard.writeText(hexColors);
        toast({ title: "Copied!", description: "HEX colors copied to clipboard" });
        break;
      case 'css':
        const cssVars = palette.colors.map((c, i) => `--color-${i + 1}: ${c.hex};`).join('\n');
        navigator.clipboard.writeText(`:root {\n${cssVars}\n}`);
        toast({ title: "Copied!", description: "CSS variables copied to clipboard" });
        break;
      case 'json':
        const jsonData = JSON.stringify(palette.colors, null, 2);
        navigator.clipboard.writeText(jsonData);
        toast({ title: "Copied!", description: "JSON data copied to clipboard" });
        break;
      default:
        toast({ title: "Coming Soon!", description: `${format} export is coming soon` });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Generate Color Palettes
          </h1>
          <p className="text-muted-foreground mb-6">
            Create beautiful, accessible color schemes using AI. Press spacebar to generate new palettes.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardHeader>
                <CardTitle>Input Methods</CardTitle>
                <CardDescription>
                  Choose how you want to generate your palette
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={inputType} onValueChange={setInputType}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="prompt">
                      <Sparkles className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="image">
                      <Image className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Image</span>
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">URL</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="prompt" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Describe your palette
                      </label>
                      <Textarea
                        placeholder="e.g., sunset colors, ocean vibes, modern minimal..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="space-y-4">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-primary bg-primary/10'
                          : 'border-muted-foreground hover:border-primary'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      {isDragActive ? (
                        <p>Drop the image here...</p>
                      ) : (
                        <div>
                          <p className="font-medium">Click or drag image</p>
                          <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Website URL
                      </label>
                      <Input
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <Button
                        onClick={handleUrlGeneration}
                        disabled={!url.trim() || isGenerating}
                        className="w-full mt-2"
                      >
                        Extract Colors
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={generatePalette}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                  
                  {palette && (
                    <Button
                      onClick={handleSavePalette}
                      variant="outline"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Export Options */}
                {palette && (
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm font-medium mb-2 block">Export</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('hex')}
                      >
                        HEX
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('css')}
                      >
                        CSS
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('json')}
                      >
                        JSON
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport('pdf')}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Palette Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Main Palette */}
            {palette && (
              <PaletteViewer
                palette={palette}
                onColorChange={handleColorChange}
                onToggleLock={handleToggleLock}
              />
            )}

            {/* Tools */}
            {palette && (
              <div className="space-y-8">
                {/* Gradient Viewer */}
                <GradientViewer colors={palette.colors} />

                {/* Accessibility Tools */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <AccessibilityChecker colors={palette.colors} />
                  <ColorBlindSimulator colors={palette.colors} />
                </div>
              </div>
            )}

            {/* Loading State */}
            {!palette && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Generating your palette...</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}