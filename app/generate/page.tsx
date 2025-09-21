'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Sparkles, ImageIcon, Link as LinkIcon, Shuffle, Save, Download, Palette as PaletteIcon, Eye, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { colorApi, PaletteExplanation, ColorExplanation } from '@/lib/api';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [colorExplanation, setColorExplanation] = useState<PaletteExplanation | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolutionFeedback, setEvolutionFeedback] = useState('');
  const [targetMood, setTargetMood] = useState('');
  const { toast } = useToast();

  // Remove auto-generation on page load

  // Spacebar shortcut for generation (only works if palette exists)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey && e.target === document.body && palette) {
        e.preventDefault();
        generatePalette();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [palette]);

  const generatePalette = useCallback(async () => {
    try {
      setIsGenerating(true);
      
      let colors;
      if (prompt.trim()) {
        // If we have a text prompt, use the workflow API
        const response = await colorApi.paletteWorkflow(
          prompt,
          'smart',
          5,
          evolutionFeedback.trim() || undefined,
          true
        );

        // Convert the final palette to our format
        colors = response.final_palette.map(hex => ({
          hex,
          rgb: `rgb(${hex.match(/\w\w/g)?.map(x => parseInt(x, 16)).join(',')})`,
          hsl: hexToColor(hex).hsl,
        }));

        // If we got explanations, update them
        if (response.explanation) {
          setColorExplanation(response.explanation);
        }

        // Show evolution explanation if available
        if (response.evolution?.explanation) {
          toast({
            title: "Palette Evolution",
            description: response.evolution.explanation,
          });
        }
      } else {
        // If no prompt, generate a random seed color and use it
        const seedColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        const response = await colorApi.generatePaletteFromSeed(seedColor);
        
        colors = response.palette.map(color => ({
          hex: color.hex,
          rgb: `rgb(${color.rgb.join(',')})`,
          hsl: hexToColor(color.hex).hsl,
        }));
      }
      
      const newPalette: Palette = {
        id: Date.now().toString(),
        name: prompt.trim() ? prompt.trim() : `Random Palette ${new Date().toLocaleTimeString()}`,
        colors,
        createdAt: new Date().toISOString(),
        locked: new Array(colors.length).fill(false),
      };
      
      setPalette(newPalette);

      // Clear evolution inputs after successful generation
      setEvolutionFeedback('');
      setTargetMood('');
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
  }, [prompt, evolutionFeedback, toast]);

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
          description: "Please enter valid website",
          variant: "destructive",
        });
      }
      setIsGenerating(false);
    }, 2000);
  };

  const handleEvolvePalette = async () => {
    if (!palette || !evolutionFeedback.trim()) return;

    try {
      setIsEvolving(true);
      const hexColors = palette.colors.map(c => c.hex);
      const result = await colorApi.evolvePalette(hexColors, evolutionFeedback, targetMood || undefined);

      // Convert the evolved palette to our format
      const evolvedColors = result.evolved_palette.map(hex => hexToColor(hex));

      // Update the palette with evolved colors
      setPalette({
        ...palette,
        colors: evolvedColors,
        name: `${palette.name} (Evolved)`,
      });

      // Show evolution explanation
      toast({
        title: "Palette Evolved!",
        description: result.explanation,
      });

      // Clear evolution inputs
      setEvolutionFeedback('');
      setTargetMood('');
    } catch (error) {
      console.error('Failed to evolve palette:', error);
      toast({
        title: "Error",
        description: "Failed to evolve palette. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvolving(false);
    }
  };

  const handleExplainColors = async () => {
    if (!palette || !palette.colors || palette.colors.length === 0) {
      toast({
        title: "Error",
        description: "No colors available to analyze.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsExplaining(true);
      setColorExplanation(null); // Clear previous explanation while loading

      // Extract hex colors and ensure they're valid
      const hexColors = palette.colors
        .map(c => c.hex)
        .filter(hex => /^#[0-9A-Fa-f]{6}$/.test(hex));

      if (hexColors.length === 0) {
        throw new Error('No valid colors found in the palette');
      }

      console.log('Sending colors for analysis:', hexColors);
      
      // Get the explanation from the API
      const explanation = await colorApi.explainColors(hexColors, prompt || undefined);
      
      // Log the response to help with debugging
      console.log('Color explanation response:', explanation);
      
      // Additional validation of the response
      if (!explanation.colors || explanation.colors.length === 0) {
        throw new Error('No color analysis received from the API');
      }
      
      // Check if we got actual data or just defaults
      const hasRealData = explanation.colors.some(color => 
        color.name !== 'Unnamed Color' || 
        color.description !== 'No description available' ||
        color.psychology !== 'No psychology information available'
      );
      
      if (!hasRealData) {
        throw new Error('Received only default values from the API. Please try again.');
      }

      // Set the explanation (API now handles validation and defaults)
      setColorExplanation(explanation);
      
      // Show success message
      toast({
        title: "Analysis Complete",
        description: "Color palette analysis has been generated successfully.",
      });
    } catch (error) {
      console.error('Failed to get color explanations:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get color explanations. Please try again.",
        variant: "destructive",
      });
      // Clear any partial explanation
      setColorExplanation(null);
    } finally {
      setIsExplaining(false);
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
    <div className="h-screen overflow-hidden relative scrollbar-hide">
      {/* Initial Input Overlay - shows when no palette */}
      {!palette && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="container max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Generate Color Palettes
          </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Create beautiful, accessible color schemes using AI
          </p>
        </motion.div>

            <Card className="backdrop-blur-sm bg-background/95 border-2">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                  How would you like to start?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="prompt" className="flex items-center gap-2 py-3">
                      <Sparkles className="h-4 w-4" />
                      Text Prompt
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-2 py-3">
                            <ImageIcon className="h-4 w-4" />
                      Upload Image
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2 py-3">
                      <LinkIcon className="h-4 w-4" />
                      Website URL
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-6 rounded-xl bg-muted/50">
                    <TabsContent value="prompt" className="space-y-4 mt-0">
                      <div>
                        <label className="text-sm font-medium mb-3 block">
                          Describe your ideal color palette
                        </label>
                        <Textarea
                          placeholder="e.g., sunset colors, ocean vibes, modern minimal, vintage autumn..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="resize-none bg-background text-base"
                          rows={4}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="mt-0 space-y-4">
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-primary bg-primary/10'
                            : 'border-muted-foreground hover:border-primary'
                        }`}
                      >
                        <input {...getInputProps()} />
                        {previewImage ? (
                          <div className="relative max-w-sm mx-auto">
                            <img 
                              src={previewImage} 
                              alt="Preview" 
                              className="rounded-lg object-contain w-full h-48"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewImage(null);
                              }}
                              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            {isDragActive ? (
                              <p className="text-lg">Drop the image here...</p>
                            ) : (
                              <div>
                                <p className="font-medium text-lg mb-2">Click or drag image here</p>
                                <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4 mt-0">
                        <div>
                        <label className="text-sm font-medium mb-3 block">
                            Enter Website URL
                          </label>
                            <Input
                          placeholder="https://xyz.com"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                          className="bg-background text-base py-3"
                        />
                  
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>

                <div className="flex gap-3 pt-4">
                    <Button
                    onClick={inputType === 'url' ? handleUrlGeneration : generatePalette}
                      disabled={isGenerating}
                    className="flex-1 bg-primary py-6 text-lg"
                      size="lg"
                    >
                    {isGenerating ? (
                      <>
                        <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-3" />
                        Generate Palette
                      </>
                    )}
                  </Button>
                  
                        <Button
                    onClick={generatePalette}
                          variant="outline"
                    size="lg"
                    className="px-6 py-6"
                    title="Generate random palette"
                  >
                    <Shuffle className="h-5 w-5" />
                        </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          </motion.div>
      )}

      {/* Main Palette View */}
      {palette && (
        <div className="h-screen flex">
          {/* Main Content Area - Palette + Tools */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`transition-all duration-500 ease-in-out overflow-y-auto scrollbar-hide ${
              sidebarOpen ? 'w-[calc(100%-400px)]' : 'w-full'
            }`}
          >
            {/* Color Palette */}
            <div className="h-[100vh] min-h-[400px]">
                  <PaletteViewer
                    palette={palette}
                    onColorChange={handleColorChange}
                    onToggleLock={handleToggleLock}
                  />
            </div>
            
            {/* Tools Section - Always Visible */}
            <div className="bg-background border-t">
              <div className="container mx-auto px-6 py-8 space-y-8">
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
            </div>
          </motion.div>

          {/* Sidebar Toggle Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-in-out ${
              sidebarOpen ? 'right-[400px]' : 'right-0'
            }`}
          >
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="outline"
              size="lg"
              className="rounded-l-xl rounded-r-none h-20 w-16 bg-white hover:bg-gray-50 border-2 border-gray-400 shadow-xl p-0"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-blue-600">
                {sidebarOpen ? '→' : '←'}
              </div>
            </Button>
          </motion.div>

          {/* Sliding Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-screen w-[400px] bg-background/95 backdrop-blur-sm border-l shadow-xl z-40 overflow-y-auto scrollbar-hide"
              >
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      New Palette
                    </h2>
                  </div>

                  <Tabs value={inputType} onValueChange={setInputType} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="prompt" className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Text
                      </TabsTrigger>
                      <TabsTrigger value="image" className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Image
                      </TabsTrigger>
                      <TabsTrigger value="url" className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        URL
                      </TabsTrigger>
                    </TabsList>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <TabsContent value="prompt" className="mt-0">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Describe your palette
                          </label>
                          <Textarea
                            placeholder="e.g., sunset colors, ocean vibes, modern minimal..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="resize-none bg-background"
                            rows={4}
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="image" className="mt-0">
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
                            <div className="relative">
                              <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="rounded-md object-contain w-full h-32"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewImage(null);
                                }}
                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              {isDragActive ? (
                                <p>Drop image here</p>
                              ) : (
                                <div>
                                  <p className="font-medium mb-1">Drop image</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="url" className="mt-0">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Website URL
                          </label>
                          <Input
                            placeholder="https://xyz.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="bg-background"
                          />
                      
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>

                  <div className="flex gap-3">
                    <Button
                      onClick={inputType === 'url' ? handleUrlGeneration : generatePalette}
                      disabled={isGenerating}
                      className="flex-1"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Shuffle className="h-4 w-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleSavePalette}
                      variant="outline"
                      size="lg"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Export Options */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium block">Export Palette</label>
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

                   {/* Palette Evolution */}
                   <div className="space-y-3 border-t pt-4">
                     <div className="flex items-center justify-between">
                       <h3 className="font-medium text-sm">Evolve Palette</h3>
                       <Button
                         onClick={handleEvolvePalette}
                         variant="outline"
                         size="sm"
                         className="bg-background hover:bg-primary hover:text-white transition-colors"
                         disabled={isEvolving || !palette || !evolutionFeedback.trim()}
                       >
                         {isEvolving ? (
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                         ) : (
                           <Sparkles className="h-4 w-4 mr-2" />
                         )}
                         {isEvolving ? 'Evolving...' : 'Evolve Palette'}
                       </Button>
                     </div>

                     {palette && (
                       <div className="space-y-3">
                         <div>
                           <label className="text-sm font-medium mb-2 block">
                             Evolution Feedback
                           </label>
                           <Textarea
                             placeholder="e.g., make it warmer, more vibrant, more professional..."
                             value={evolutionFeedback}
                             onChange={(e) => setEvolutionFeedback(e.target.value)}
                             className="resize-none bg-background"
                             rows={3}
                           />
                         </div>
                         <div>
                           <label className="text-sm font-medium mb-2 block">
                             Target Mood (Optional)
                           </label>
                           <Input
                             placeholder="e.g., energetic, calm, professional..."
                             value={targetMood}
                             onChange={(e) => setTargetMood(e.target.value)}
                             className="bg-background"
                           />
                         </div>
                       </div>
                     )}

                     {!palette && (
                       <p className="text-sm text-muted-foreground">
                         Generate a palette first to evolve it
                       </p>
                     )}
                   </div>

                   {/* Color Explanation */}
                   <div className="space-y-3 border-t pt-4">
                     <div className="flex items-center justify-between">
                       <h3 className="font-medium text-sm">Color Analysis</h3>
                       <Button
                         onClick={handleExplainColors}
                         variant="outline"
                         size="sm"
                         className="bg-background hover:bg-primary hover:text-white transition-colors"
                         disabled={isExplaining || !palette}
                       >
                         {isExplaining ? (
                           <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                         ) : (
                           <Eye className="h-4 w-4 mr-2" />
                         )}
                         {isExplaining ? 'Analyzing...' : 'Analyze Colors'}
                       </Button>
                     </div>

                     {colorExplanation && (
                       <div className="space-y-4">
                         {/* Palette Analysis */}
                         <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                           <h4 className="font-medium text-sm">Palette Analysis</h4>
                           <div className="space-y-1 text-sm">
                             {colorExplanation.palette_analysis?.harmony && (
                               <p><span className="font-medium">Harmony:</span> {colorExplanation.palette_analysis.harmony}</p>
                             )}
                             {colorExplanation.palette_analysis?.mood && (
                               <p><span className="font-medium">Mood:</span> {colorExplanation.palette_analysis.mood}</p>
                             )}
                             {colorExplanation.palette_analysis?.use_cases && colorExplanation.palette_analysis.use_cases.length > 0 && (
                               <div>
                                 <span className="font-medium">Use Cases:</span>
                                 <ul className="list-disc list-inside mt-1 text-muted-foreground">
                                   {colorExplanation.palette_analysis.use_cases.map((use: string, i: number) => (
                                     <li key={i}>{use}</li>
                                   ))}
                                 </ul>
                               </div>
                             )}
                           </div>
                         </div>

                         {/* Individual Colors */}
                         <div className="space-y-3">
                           <h4 className="font-medium text-sm">Color Details</h4>
                           {colorExplanation.colors?.map((color: ColorExplanation, i: number) => (
                             <div key={i} className="rounded-lg bg-muted/50 p-3 space-y-2">
                               <div className="flex items-center gap-2">
                                 <div 
                                   className="w-6 h-6 rounded-full border"
                                   style={{ backgroundColor: color.color }}
                                 />
                                 <span className="font-medium">{color.name || 'Unnamed Color'}</span>
                               </div>
                               {color.description && (
                                 <p className="text-sm text-muted-foreground">{color.description}</p>
                               )}
                               {color.psychology && (
                                 <div className="text-sm">
                                   <p className="font-medium mb-1">Psychology:</p>
                                   <p className="text-muted-foreground">{color.psychology}</p>
                                 </div>
                               )}
                               {color.common_uses && color.common_uses.length > 0 && (
                                 <div className="text-sm">
                                   <p className="font-medium mb-1">Common Uses:</p>
                                   <ul className="list-disc list-inside text-muted-foreground">
                                     {color.common_uses.map((use: string, j: number) => (
                                       <li key={j}>{use}</li>
                                     ))}
                                   </ul>
                                 </div>
                               )}
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {!colorExplanation && palette && (
                       <p className="text-sm text-muted-foreground">
                         Click 'Analyze' to get detailed insights about your color palette
                       </p>
                     )}

                     {!palette && (
                       <p className="text-sm text-muted-foreground">
                         Generate a palette first to see color analysis
                       </p>
                     )}
                   </div>

                   {/* Quick Actions */}
                   <div className="space-y-3 border-t pt-4">
                     <h3 className="font-medium text-sm">Quick Actions</h3>
                     <div className="space-y-2">
                       <Button
                         onClick={generatePalette}
                         variant="outline"
                         size="sm"
                         className="w-full justify-start"
                         disabled={isGenerating}
                       >
                         <Shuffle className="h-3 w-3 mr-2" />
                         Random Palette
                       </Button>
                       <Button
                         onClick={() => {
                           setPrompt('');
                           setUrl('');
                           setPreviewImage(null);
                           setColorExplanation(null);
                         }}
                         variant="outline"
                         size="sm"
                         className="w-full justify-start"
                       >
                         <X className="h-3 w-3 mr-2" />
                         Clear All
                       </Button>
                     </div>
                     <p className="text-xs text-muted-foreground">
                       All tools are visible below the palette
                     </p>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}