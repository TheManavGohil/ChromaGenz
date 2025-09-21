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
import { WebsitePreview } from '@/components/features/website-preview';
import { hexToColor } from '@/utils/colors';
import { savePalette } from '@/utils/storage';
import { Palette, Color } from '@/types';
import { Sparkles, ImageIcon, Link as LinkIcon, Shuffle, Save, Download, Palette as PaletteIcon, Eye, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { colorApi } from '@/lib/api';

// Hardcoded website color palettes
const WEBSITE_PALETTES: Record<string, { name: string; colors: Color[] }> = {
  'https://vercel.com': {
    name: 'Vercel',
    colors: [
      { hex: '#000000', rgb: 'rgb(0,0,0)', hsl: 'hsl(0,0%,0%)' },
      { hex: '#FFFFFF', rgb: 'rgb(255,255,255)', hsl: 'hsl(0,0%,100%)' },
      { hex: '#F5F5F5', rgb: 'rgb(245,245,245)', hsl: 'hsl(0,0%,96%)' },
      { hex: '#888888', rgb: 'rgb(136,136,136)', hsl: 'hsl(0,0%,53%)' },
      { hex: '#333333', rgb: 'rgb(51,51,51)', hsl: 'hsl(0,0%,20%)' },
    ]
  },
  'https://stripe.com': {
    name: 'Stripe',
    colors: [
      { hex: '#635BFF', rgb: 'rgb(99,91,255)', hsl: 'hsl(243,100%,68%)' },
      { hex: '#0A2540', rgb: 'rgb(10,37,64)', hsl: 'hsl(210,73%,15%)' },
      { hex: '#00D4FF', rgb: 'rgb(0,212,255)', hsl: 'hsl(190,100%,50%)' },
      { hex: '#FFFFFF', rgb: 'rgb(255,255,255)', hsl: 'hsl(0,0%,100%)' },
      { hex: '#F6F9FC', rgb: 'rgb(246,249,252)', hsl: 'hsl(210,33%,98%)' },
    ]
  },
  'https://linear.app': {
    name: 'Linear',
    colors: [
      { hex: '#5E6AD2', rgb: 'rgb(94,106,210)', hsl: 'hsl(234,54%,60%)' },
      { hex: '#2E3147', rgb: 'rgb(46,49,71)', hsl: 'hsl(234,21%,23%)' },
      { hex: '#8A8F98', rgb: 'rgb(138,143,152)', hsl: 'hsl(219,6%,57%)' },
      { hex: '#FFFFFF', rgb: 'rgb(255,255,255)', hsl: 'hsl(0,0%,100%)' },
      { hex: '#F8F8F8', rgb: 'rgb(248,248,248)', hsl: 'hsl(0,0%,97%)' },
    ]
  }
};

export default function Generate() {
  const [palette, setPalette] = useState<Palette | null>(null);
  const [inputType, setInputType] = useState('prompt');
  const [prompt, setPrompt] = useState('');
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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

  const generatePalette = useCallback(async () => {
    try {
      setIsGenerating(true);
      
      let response;
      if (prompt.trim()) {
        // If we have a text prompt, use it to generate the palette
        response = await colorApi.generatePaletteFromText(prompt);
      } else {
        // If no prompt, generate a random seed color and use it
        const seedColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        response = await colorApi.generatePaletteFromSeed(seedColor);
      }
      
      // Convert the API response to our Palette format
        const colors = response.palette.map(color => ({
          hex: color.hex,
          rgb: `rgb(${color.rgb.join(',')})`,
          hsl: hexToColor(color.hex).hsl, // Convert to HSL for our UI
        }));
      
      const newPalette: Palette = {
        id: Date.now().toString(),
        name: prompt ? prompt : `Generated Palette ${new Date().toLocaleTimeString()}`,
        colors,
        createdAt: new Date().toISOString(),
        locked: new Array(colors.length).fill(false),
      };
      
      setPalette(newPalette);
    } catch (error) {
      console.error('Failed to generate palette:', error);
      toast({
        title: "Error",
        description: "Failed to generate palette. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, toast]);

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

  // Handle image upload and color extraction
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
        setIsGenerating(true);
        const response = await colorApi.extractColorsFromImage(file);
        
        // Convert the API response to our Palette format
        const colors = response.colors.map(color => ({
          hex: color.hex,
          rgb: `rgb(${color.rgb.join(',')})`,
          hsl: hexToColor(color.hex).hsl, // Convert to HSL for our UI
        }));
        
        const newPalette: Palette = {
          id: Date.now().toString(),
          name: `Colors from ${file.name}`,
          colors,
          createdAt: new Date().toISOString(),
          locked: new Array(colors.length).fill(false),
        };
        
        setPalette(newPalette);
        toast({
          title: "Colors Extracted!",
          description: `Generated palette from ${file.name}`,
        });
      } catch (error) {
        console.error('Failed to extract colors from image:', error);
        toast({
          title: "Error",
          description: "Failed to extract colors from image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    }
  }, [toast]);

  // Cleanup preview URL when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    multiple: false,
  });

  const handleUrlGeneration = () => {
    setIsGenerating(true);

    // Normalize the URL for matching
    const normalizedInput = url.trim().toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, '') // Remove protocol and www
      .replace(/\/$/, ''); // Remove trailing slash
    
    // Find matching website
    const websitePalette = Object.entries(WEBSITE_PALETTES).find(([key]) => {
      const normalizedKey = key.toLowerCase()
        .replace(/^(https?:\/\/)?(www\.)?/, '')
        .replace(/\/$/, '');
      return normalizedKey === normalizedInput;
    })?.[1];

    // Simulate API call with 2 second delay
    setTimeout(() => {
      if (websitePalette) {
        const newPalette: Palette = {
          id: Date.now().toString(),
          name: `Colors from ${websitePalette.name}`,
          colors: websitePalette.colors,
          createdAt: new Date().toISOString(),
          locked: new Array(websitePalette.colors.length).fill(false),
        };
        setPalette(newPalette);
        toast({
          title: "Colors Extracted!",
          description: `Successfully extracted colors from ${websitePalette.name}`,
        });
      } else {
        toast({
          title: "Website Not Found",
          description: "Please enter stripe.com, vercel.com, or linear.app",
          variant: "destructive",
        });
      }
      setIsGenerating(false);
    }, 2000);
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
    <div className="container mx-auto px-2 py-8">
      <div className="mx-auto">
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

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Input Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
          >
            <Card className="backdrop-blur-sm bg-background/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Input Methods
                </CardTitle>
                <CardDescription>
                  Choose how you want to generate your palette
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="prompt" className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-1.5">
                            <ImageIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Image</span>
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-1.5">
                      <LinkIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">URL</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <TabsContent value="prompt" className="space-y-4 mt-0">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Describe your palette
                        </label>
                        <Textarea
                          placeholder="e.g., sunset colors, ocean vibes, modern minimal..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="resize-none bg-background"
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="mt-0 space-y-4">
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-primary bg-primary/10'
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                      >
                        <input {...getInputProps()} />
                        {previewImage ? (
                          <div className="relative aspect-[4/3] w-full">
                            <img 
                              src={previewImage} 
                              alt="Preview" 
                              className="rounded-md object-contain w-full h-full"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(null);
                              }}
                              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            {isDragActive ? (
                              <p>Drop the image here...</p>
                            ) : (
                              <div>
                                <p className="font-medium">Click or drag image</p>
                                <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {previewImage && !isGenerating && (
                        <Button 
                          onClick={() => setPreviewImage(null)}
                          variant="outline"
                          className="w-full"
                        >
                          Remove Image
                        </Button>
                      )}
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4 mt-0">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Enter Website URL
                          </label>
                          <div className="space-y-2">
                            <Input
                              placeholder="https://stripe.com"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              className="bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                              Try: stripe.com, vercel.com, or linear.app
                            </p>
                          </div>
                          <Button
                            onClick={handleUrlGeneration}
                            disabled={isGenerating}
                            className="w-full mt-4"
                          >
                            {isGenerating ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                                Extracting Colors...
                              </>
                            ) : (
                              <>
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Extract Colors
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={generatePalette}
                      disabled={isGenerating}
                      className="flex-1 bg-primary"
                      size="lg"
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                    
                    {palette && (
                      <Button
                        onClick={handleSavePalette}
                        variant="outline"
                        size="lg"
                        className="bg-background"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Export Options */}
                  {palette && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium block">Export As</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('hex')}
                          className="bg-background hover:bg-muted"
                        >
                          HEX
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('css')}
                          className="bg-background hover:bg-muted"
                        >
                          CSS
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('json')}
                          className="bg-background hover:bg-muted"
                        >
                          JSON
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('pdf')}
                          className="bg-background hover:bg-muted"
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-9 space-y-8"
          >
            {/* Main Palette */}
            {palette && (
              <Card className="overflow-hidden border-2">
                <CardHeader className="border-b bg-muted/50">
                  <CardTitle className="flex items-center gap-2">
                    <PaletteIcon className="h-5 w-5 text-primary" />
                    Current Palette
                  </CardTitle>
                  <CardDescription>
                    Click on any color to edit or lock it in place
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <PaletteViewer
                    palette={palette}
                    onColorChange={handleColorChange}
                    onToggleLock={handleToggleLock}
                  />
                </CardContent>
              </Card>
            )}

            {/* Tools */}
            {palette && (
              <div className="space-y-8">
                {/* Website Preview */}
                <WebsitePreview colors={palette.colors} />

                {/* Gradient Viewer */}
                <Card>
                  <CardHeader className="border-b bg-muted/50">
                    <CardTitle className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-gradient-to-r from-primary to-primary-foreground" />
                      Gradient Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <GradientViewer colors={palette.colors} />
                  </CardContent>
                </Card>

                {/* Accessibility Tools */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader className="border-b bg-muted/50">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Accessibility
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <AccessibilityChecker colors={palette.colors} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="border-b bg-muted/50">
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Color Blindness
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ColorBlindSimulator colors={palette.colors} />
                    </CardContent>
                  </Card>
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