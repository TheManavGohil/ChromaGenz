'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Heart, Copy, Download, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { trendingPalettes } from '@/data/colors';
import { useToast } from '@/hooks/use-toast';
import { getUser } from '@/utils/storage';
import { User } from '@/types';
import { HexColorPicker } from 'react-colorful';
import { hexToColor } from '@/utils/colors';

interface FilterOptions {
  search: string;
  hue: string;
  popularity: string;
}

interface ThemeColor {
  hex: string;
  rgb: string;
  hsl: string;
  name?: string;
}

interface Theme {
  _id: string;
  name: string;
  colors: ThemeColor[];
  tags: string[];
  createdBy?: {
    username: string;
  };
  createdAt: string;
}

export default function Explore() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    hue: 'all',
    popularity: 'trending',
  });
  const [displayedPalettes, setDisplayedPalettes] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);
  const [isAddThemeOpen, setIsAddThemeOpen] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeColors, setNewThemeColors] = useState<ThemeColor[]>([]);
  const [newThemeTags, setNewThemeTags] = useState('');
  const [currentColorPicker, setCurrentColorPicker] = useState<number | null>(null);
  const [tempColorHex, setTempColorHex] = useState('#000000');
  const { toast } = useToast();

  const PALETTES_PER_PAGE = 12;

  // Fetch themes from API
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setIsLoadingThemes(true);
        const response = await fetch('/api/themes');
        const result = await response.json();
        
        if (response.ok) {
          setThemes(result.themes || []);
        } else {
          console.error('Failed to fetch themes:', result.error);
        }
      } catch (error) {
        console.error('Error fetching themes:', error);
      } finally {
        setIsLoadingThemes(false);
      }
    };

    fetchThemes();
    setUser(getUser());
  }, []);

  // Convert themes to palette format
  const themesAsPalettes = useMemo(() => {
    return themes.map(theme => ({
      name: theme.name,
      colors: theme.colors,
      tags: theme.tags || [],
      uniqueKey: theme._id,
      isFromDB: true,
    }));
  }, [themes]);

  // Extended mock palettes for demonstration
  const allPalettes = useMemo(() => {
    const additional = [
      {
        name: 'Warm Autumn',
        colors: [
          { hex: '#D2691E', name: 'Chocolate', rgb: 'rgb(210,105,30)', hsl: 'hsl(25,75%,47%)' },
          { hex: '#FF8C00', name: 'Dark Orange', rgb: 'rgb(255,140,0)', hsl: 'hsl(33,100%,50%)' },
          { hex: '#FFD700', name: 'Gold', rgb: 'rgb(255,215,0)', hsl: 'hsl(51,100%,50%)' },
          { hex: '#B22222', name: 'Fire Brick', rgb: 'rgb(178,34,34)', hsl: 'hsl(0,68%,42%)' },
          { hex: '#8B4513', name: 'Saddle Brown', rgb: 'rgb(139,69,19)', hsl: 'hsl(25,76%,31%)' },
        ],
        tags: ['warm', 'autumn', 'cozy']
      },
      {
        name: 'Cool Winter',
        colors: [
          { hex: '#4682B4', name: 'Steel Blue', rgb: 'rgb(70,130,180)', hsl: 'hsl(207,44%,49%)' },
          { hex: '#B0C4DE', name: 'Light Steel Blue', rgb: 'rgb(176,196,222)', hsl: 'hsl(214,41%,78%)' },
          { hex: '#708090', name: 'Slate Gray', rgb: 'rgb(112,128,144)', hsl: 'hsl(210,13%,50%)' },
          { hex: '#2F4F4F', name: 'Dark Slate Gray', rgb: 'rgb(47,79,79)', hsl: 'hsl(180,25%,25%)' },
          { hex: '#E6F3FF', name: 'Alice Blue', rgb: 'rgb(230,243,255)', hsl: 'hsl(208,100%,95%)' },
        ],
        tags: ['cool', 'winter', 'professional']
      },
      {
        name: 'Spring Meadow',
        colors: [
          { hex: '#32CD32', name: 'Lime Green', rgb: 'rgb(50,205,50)', hsl: 'hsl(120,61%,50%)' },
          { hex: '#98FB98', name: 'Pale Green', rgb: 'rgb(152,251,152)', hsl: 'hsl(120,93%,79%)' },
          { hex: '#228B22', name: 'Forest Green', rgb: 'rgb(34,139,34)', hsl: 'hsl(120,61%,34%)' },
          { hex: '#ADFF2F', name: 'Green Yellow', rgb: 'rgb(173,255,47)', hsl: 'hsl(84,100%,59%)' },
          { hex: '#006400', name: 'Dark Green', rgb: 'rgb(0,100,0)', hsl: 'hsl(120,100%,20%)' },
        ],
        tags: ['nature', 'spring', 'fresh']
      },
      {
        name: 'Royal Purple',
        colors: [
          { hex: '#663399', name: 'Rebecca Purple', rgb: 'rgb(102,51,153)', hsl: 'hsl(270,50%,40%)' },
          { hex: '#9932CC', name: 'Dark Orchid', rgb: 'rgb(153,50,204)', hsl: 'hsl(280,60%,50%)' },
          { hex: '#DDA0DD', name: 'Plum', rgb: 'rgb(221,160,221)', hsl: 'hsl(300,47%,75%)' },
          { hex: '#4B0082', name: 'Indigo', rgb: 'rgb(75,0,130)', hsl: 'hsl(275,100%,25%)' },
          { hex: '#E6E6FA', name: 'Lavender', rgb: 'rgb(230,230,250)', hsl: 'hsl(240,67%,94%)' },
        ],
        tags: ['elegant', 'royal', 'luxury']
      },
      {
        name: 'Ocean Depths',
        colors: [
          { hex: '#001F3F', name: 'Navy', rgb: 'rgb(0,31,63)', hsl: 'hsl(210,100%,12%)' },
          { hex: '#0074D9', name: 'Blue', rgb: 'rgb(0,116,217)', hsl: 'hsl(207,100%,43%)' },
          { hex: '#7FDBFF', name: 'Aqua', rgb: 'rgb(127,219,255)', hsl: 'hsl(197,100%,75%)' },
          { hex: '#39CCCC', name: 'Teal', rgb: 'rgb(57,204,204)', hsl: 'hsl(180,59%,51%)' },
          { hex: '#E0F6FF', name: 'Azure', rgb: 'rgb(224,246,255)', hsl: 'hsl(200,100%,94%)' },
        ],
        tags: ['ocean', 'cool', 'serene']
      },
      {
        name: 'Sunset Vibes',
        colors: [
          { hex: '#FF4136', name: 'Red', rgb: 'rgb(255,65,54)', hsl: 'hsl(3,100%,61%)' },
          { hex: '#FF851B', name: 'Orange', rgb: 'rgb(255,133,27)', hsl: 'hsl(28,100%,55%)' },
          { hex: '#FFDC00', name: 'Yellow', rgb: 'rgb(255,220,0)', hsl: 'hsl(52,100%,50%)' },
          { hex: '#FF6B6B', name: 'Coral', rgb: 'rgb(255,107,107)', hsl: 'hsl(0,100%,71%)' },
          { hex: '#FFE0E0', name: 'Peach', rgb: 'rgb(255,224,224)', hsl: 'hsl(0,100%,94%)' },
        ],
        tags: ['warm', 'sunset', 'energetic']
      },
      {
        name: 'Monochrome Classic',
        colors: [
          { hex: '#000000', name: 'Black', rgb: 'rgb(0,0,0)', hsl: 'hsl(0,0%,0%)' },
          { hex: '#333333', name: 'Dark Gray', rgb: 'rgb(51,51,51)', hsl: 'hsl(0,0%,20%)' },
          { hex: '#666666', name: 'Gray', rgb: 'rgb(102,102,102)', hsl: 'hsl(0,0%,40%)' },
          { hex: '#CCCCCC', name: 'Light Gray', rgb: 'rgb(204,204,204)', hsl: 'hsl(0,0%,80%)' },
          { hex: '#FFFFFF', name: 'White', rgb: 'rgb(255,255,255)', hsl: 'hsl(0,0%,100%)' },
        ],
        tags: ['monochrome', 'classic', 'minimal']
      },
      {
        name: 'Tropical Paradise',
        colors: [
          { hex: '#FF6B35', name: 'Coral Orange', rgb: 'rgb(255,107,53)', hsl: 'hsl(16,100%,60%)' },
          { hex: '#F7931E', name: 'Orange', rgb: 'rgb(247,147,30)', hsl: 'hsl(32,93%,54%)' },
          { hex: '#FFD23F', name: 'Golden Yellow', rgb: 'rgb(255,210,63)', hsl: 'hsl(46,100%,62%)' },
          { hex: '#06FFA5', name: 'Mint Green', rgb: 'rgb(6,255,165)', hsl: 'hsl(158,100%,51%)' },
          { hex: '#4ECDC4', name: 'Turquoise', rgb: 'rgb(78,205,196)', hsl: 'hsl(176,58%,55%)' },
        ],
        tags: ['tropical', 'vibrant', 'summer']
      },
      {
        name: 'Desert Sunrise',
        colors: [
          { hex: '#8B4513', name: 'Saddle Brown', rgb: 'rgb(139,69,19)', hsl: 'hsl(25,76%,31%)' },
          { hex: '#CD853F', name: 'Peru', rgb: 'rgb(205,133,63)', hsl: 'hsl(30,59%,53%)' },
          { hex: '#DEB887', name: 'Burlywood', rgb: 'rgb(222,184,135)', hsl: 'hsl(34,57%,70%)' },
          { hex: '#F4A460', name: 'Sandy Brown', rgb: 'rgb(244,164,96)', hsl: 'hsl(28,87%,67%)' },
          { hex: '#FFF8DC', name: 'Cornsilk', rgb: 'rgb(255,248,220)', hsl: 'hsl(48,100%,93%)' },
        ],
        tags: ['earth', 'warm', 'natural']
      },
      {
        name: 'Neon Dreams',
        colors: [
          { hex: '#FF0080', name: 'Hot Pink', rgb: 'rgb(255,0,128)', hsl: 'hsl(330,100%,50%)' },
          { hex: '#8000FF', name: 'Electric Violet', rgb: 'rgb(128,0,255)', hsl: 'hsl(270,100%,50%)' },
          { hex: '#00FFFF', name: 'Cyan', rgb: 'rgb(0,255,255)', hsl: 'hsl(180,100%,50%)' },
          { hex: '#00FF00', name: 'Lime', rgb: 'rgb(0,255,0)', hsl: 'hsl(120,100%,50%)' },
          { hex: '#FFFF00', name: 'Yellow', rgb: 'rgb(255,255,0)', hsl: 'hsl(60,100%,50%)' },
        ],
        tags: ['neon', 'electric', 'bright']
      },
      {
        name: 'Forest Mist',
        colors: [
          { hex: '#2D4A2B', name: 'Dark Forest', rgb: 'rgb(45,74,43)', hsl: 'hsl(116,26%,23%)' },
          { hex: '#456B45', name: 'Forest Green', rgb: 'rgb(69,107,69)', hsl: 'hsl(120,22%,35%)' },
          { hex: '#7BA05B', name: 'Sage', rgb: 'rgb(123,160,91)', hsl: 'hsl(92,27%,49%)' },
          { hex: '#C8E6C9', name: 'Light Green', rgb: 'rgb(200,230,201)', hsl: 'hsl(122,38%,84%)' },
          { hex: '#F1F8E9', name: 'Mint Cream', rgb: 'rgb(241,248,233)', hsl: 'hsl(88,50%,94%)' },
        ],
        tags: ['nature', 'calm', 'organic']
      },
      {
        name: 'Cherry Blossom',
        colors: [
          { hex: '#8E24AA', name: 'Purple', rgb: 'rgb(142,36,170)', hsl: 'hsl(287,65%,40%)' },
          { hex: '#E91E63', name: 'Pink', rgb: 'rgb(233,30,99)', hsl: 'hsl(340,82%,52%)' },
          { hex: '#F8BBD9', name: 'Light Pink', rgb: 'rgb(248,187,217)', hsl: 'hsl(330,80%,85%)' },
          { hex: '#FCE4EC', name: 'Pink Tint', rgb: 'rgb(252,228,236)', hsl: 'hsl(340,67%,94%)' },
          { hex: '#FFFFFF', name: 'White', rgb: 'rgb(255,255,255)', hsl: 'hsl(0,0%,100%)' },
        ],
        tags: ['floral', 'feminine', 'spring']
      },
      {
        name: 'Midnight Sky',
        colors: [
          { hex: '#0D1B2A', name: 'Rich Black', rgb: 'rgb(13,27,42)', hsl: 'hsl(211,53%,11%)' },
          { hex: '#415A77', name: 'Charcoal', rgb: 'rgb(65,90,119)', hsl: 'hsl(212,29%,36%)' },
          { hex: '#778DA9', name: 'Blue Gray', rgb: 'rgb(119,141,169)', hsl: 'hsl(214,24%,56%)' },
          { hex: '#B8C5D1', name: 'Light Blue Gray', rgb: 'rgb(184,197,209)', hsl: 'hsl(209,24%,77%)' },
          { hex: '#E0E1DD', name: 'Platinum', rgb: 'rgb(224,225,221)', hsl: 'hsl(75,6%,87%)' },
        ],
        tags: ['dark', 'sophisticated', 'modern']
      },
      {
        name: 'Citrus Burst',
        colors: [
          { hex: '#FF6B00', name: 'Orange Peel', rgb: 'rgb(255,107,0)', hsl: 'hsl(25,100%,50%)' },
          { hex: '#FFD60A', name: 'Golden Poppy', rgb: 'rgb(255,214,10)', hsl: 'hsl(50,100%,52%)' },
          { hex: '#8AC926', name: 'Yellow Green', rgb: 'rgb(138,201,38)', hsl: 'hsl(83,68%,47%)' },
          { hex: '#FFE66D', name: 'Buff', rgb: 'rgb(255,230,109)', hsl: 'hsl(50,100%,71%)' },
          { hex: '#FFF3CD', name: 'Lemon Chiffon', rgb: 'rgb(255,243,205)', hsl: 'hsl(46,100%,90%)' },
        ],
        tags: ['citrus', 'fresh', 'energetic']
      },
      {
        name: 'Copper Rust',
        colors: [
          { hex: '#A0522D', name: 'Sienna', rgb: 'rgb(160,82,45)', hsl: 'hsl(19,56%,40%)' },
          { hex: '#CD853F', name: 'Peru', rgb: 'rgb(205,133,63)', hsl: 'hsl(30,59%,53%)' },
          { hex: '#B87333', name: 'Copper', rgb: 'rgb(184,115,51)', hsl: 'hsl(29,57%,46%)' },
          { hex: '#DAA520', name: 'Goldenrod', rgb: 'rgb(218,165,32)', hsl: 'hsl(43,74%,49%)' },
          { hex: '#F5DEB3', name: 'Wheat', rgb: 'rgb(245,222,179)', hsl: 'hsl(39,77%,83%)' },
        ],
        tags: ['metallic', 'warm', 'rustic']
      },
      {
        name: 'Arctic Freeze',
        colors: [
          { hex: '#A8DADC', name: 'Powder Blue', rgb: 'rgb(168,218,220)', hsl: 'hsl(182,34%,76%)' },
          { hex: '#457B9D', name: 'Steel Blue', rgb: 'rgb(69,123,157)', hsl: 'hsl(203,39%,44%)' },
          { hex: '#1D3557', name: 'Prussian Blue', rgb: 'rgb(29,53,87)', hsl: 'hsl(215,50%,23%)' },
          { hex: '#F1FAEE', name: 'Honeydew', rgb: 'rgb(241,250,238)', hsl: 'hsl(105,50%,96%)' },
          { hex: '#E63946', name: 'Imperial Red', rgb: 'rgb(230,57,70)', hsl: 'hsl(356,77%,56%)' },
        ],
        tags: ['cool', 'winter', 'crisp']
      },
      {
        name: 'Lavender Fields',
        colors: [
          { hex: '#6A4C93', name: 'Royal Purple', rgb: 'rgb(106,76,147)', hsl: 'hsl(265,32%,44%)' },
          { hex: '#9A7AA0', name: 'Purple Mountain', rgb: 'rgb(154,122,160)', hsl: 'hsl(291,18%,55%)' },
          { hex: '#C5A9CA', name: 'Thistle', rgb: 'rgb(197,169,202)', hsl: 'hsl(291,24%,73%)' },
          { hex: '#E0D4E7', name: 'Lavender Blush', rgb: 'rgb(224,212,231)', hsl: 'hsl(278,28%,87%)' },
          { hex: '#F7F3FF', name: 'Ghost White', rgb: 'rgb(247,243,255)', hsl: 'hsl(260,100%,98%)' },
        ],
        tags: ['purple', 'calming', 'floral']
      },
      {
        name: 'Autumn Harvest',
        colors: [
          { hex: '#8B0000', name: 'Dark Red', rgb: 'rgb(139,0,0)', hsl: 'hsl(0,100%,27%)' },
          { hex: '#FF4500', name: 'Orange Red', rgb: 'rgb(255,69,0)', hsl: 'hsl(16,100%,50%)' },
          { hex: '#FFD700', name: 'Gold', rgb: 'rgb(255,215,0)', hsl: 'hsl(51,100%,50%)' },
          { hex: '#DEB887', name: 'Burlywood', rgb: 'rgb(222,184,135)', hsl: 'hsl(34,57%,70%)' },
          { hex: '#8B4513', name: 'Saddle Brown', rgb: 'rgb(139,69,19)', hsl: 'hsl(25,76%,31%)' },
        ],
        tags: ['autumn', 'warm', 'harvest']
      },
    ];
    // Combine database themes with mock palettes
    return [...themesAsPalettes, ...trendingPalettes, ...additional];
  }, [themesAsPalettes]);

  // Helper function to convert hex to HSL
  const hexToHsl = useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return h * 360; // Return hue in degrees
  }, []);

  // Helper function to check if a color matches a hue category
  const colorMatchesHue = useCallback((hex: string, targetHue: string) => {
    const hue = hexToHsl(hex);
    
    switch (targetHue) {
      case 'red':
        return (hue >= 0 && hue <= 15) || (hue >= 345 && hue <= 360);
      case 'orange':
        return hue >= 15 && hue <= 45;
      case 'yellow':
        return hue >= 45 && hue <= 75;
      case 'green':
        return hue >= 75 && hue <= 165;
      case 'blue':
        return hue >= 180 && hue <= 270;
      case 'purple':
        return (hue >= 270 && hue <= 345) || (hue >= 165 && hue <= 180);
      default:
        return true;
    }
  }, [hexToHsl]);

  const filteredAndSortedPalettes = useMemo(() => {
    let filtered = allPalettes.filter(palette => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = palette.name.toLowerCase().includes(searchLower);
        const matchesTags = palette.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesName && !matchesTags) return false;
      }

      // Improved Hue filter
      if (filters.hue !== 'all') {
        const hasMatchingHue = palette.colors.some(color => 
          colorMatchesHue(color.hex, filters.hue)
        );
        if (!hasMatchingHue) return false;
      }

      return true;
    });

    // Sort the filtered results
    switch (filters.popularity) {
      case 'alphabetical':
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
        // Simulate popularity by color count and name length (mock data)
        filtered = filtered.sort((a, b) => {
          const aPopularity = a.colors.length * 100 + (20 - a.name.length);
          const bPopularity = b.colors.length * 100 + (20 - b.name.length);
          return bPopularity - aPopularity;
        });
        break;
      case 'recent':
        // Simulate recent by reversing the array (mock data)
        filtered = [...filtered].reverse();
        break;
      case 'trending':
      default:
        // Keep original order for trending (default)
        break;
    }

    return filtered;
  }, [allPalettes, filters, colorMatchesHue]);

  // Function to create infinite palettes by repeating the filtered ones
  const createInfinitePalettes = useCallback((basePalettes: any[], totalNeeded: number) => {
    if (basePalettes.length === 0) return [];
    
    const result = [];
    for (let i = 0; i < totalNeeded; i++) {
      const paletteIndex = i % basePalettes.length;
      const repetitionNumber = Math.floor(i / basePalettes.length);
      result.push({
        ...basePalettes[paletteIndex],
        // Add a unique key for React rendering
        uniqueKey: `${basePalettes[paletteIndex].name}-${repetitionNumber}`,
      });
    }
    return result;
  }, []);

  // Load more palettes function
  const loadMorePalettes = useCallback(() => {
    if (isLoading || filteredAndSortedPalettes.length === 0) return;
    
    setIsLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const startIndex = (currentPage - 1) * PALETTES_PER_PAGE;
      const endIndex = startIndex + PALETTES_PER_PAGE;
      const newPalettes = createInfinitePalettes(filteredAndSortedPalettes, endIndex);
      
      setDisplayedPalettes(newPalettes);
      setCurrentPage(prev => prev + 1);
      setIsLoading(false);
    }, 200);
  }, [currentPage, filteredAndSortedPalettes, createInfinitePalettes, isLoading]);

  // Reset displayed palettes when filters change
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedPalettes([]);
    if (filteredAndSortedPalettes.length > 0) {
      const initialPalettes = createInfinitePalettes(filteredAndSortedPalettes, PALETTES_PER_PAGE);
      setDisplayedPalettes(initialPalettes);
      setCurrentPage(2);
    }
  }, [filteredAndSortedPalettes, createInfinitePalettes]);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Trigger load more when user is 200px from bottom
      if (scrollTop + windowHeight >= documentHeight - 200) {
        loadMorePalettes();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMorePalettes, isLoading]);

  // Initial load
  useEffect(() => {
    if (displayedPalettes.length === 0 && filteredAndSortedPalettes.length > 0) {
      const initialPalettes = createInfinitePalettes(filteredAndSortedPalettes, PALETTES_PER_PAGE);
      setDisplayedPalettes(initialPalettes);
      setCurrentPage(2);
    }
  }, [filteredAndSortedPalettes, displayedPalettes.length, createInfinitePalettes]);

  const handleCopyPalette = (palette: any) => {
    const hexColors = palette.colors.map((c: any) => c.hex).join(', ');
    navigator.clipboard.writeText(hexColors);
    toast({
      title: "Copied!",
      description: `${palette.name} colors copied to clipboard`,
    });
  };

  const handleAddColor = () => {
    const colorInfo = hexToColor(tempColorHex);
    setNewThemeColors([...newThemeColors, {
      hex: tempColorHex,
      rgb: colorInfo.rgb,
      hsl: colorInfo.hsl,
    }]);
    setCurrentColorPicker(null);
    setTempColorHex('#000000');
  };

  const handleRemoveColor = (index: number) => {
    setNewThemeColors(newThemeColors.filter((_, i) => i !== index));
  };

  const handleCreateTheme = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create themes",
        variant: 'destructive',
      });
      return;
    }

    if (!newThemeName.trim()) {
      toast({
        title: "Error",
        description: "Theme name is required",
        variant: 'destructive',
      });
      return;
    }

    if (newThemeColors.length === 0) {
      toast({
        title: "Error",
        description: "At least one color is required",
        variant: 'destructive',
      });
      return;
    }

    try {
      const tags = newThemeTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newThemeName,
          colors: newThemeColors,
          tags,
          userId: user.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create theme');
      }

      toast({
        title: "Success!",
        description: "Theme created successfully",
      });

      // Reset form
      setNewThemeName('');
      setNewThemeColors([]);
      setNewThemeTags('');
      setIsAddThemeOpen(false);

      // Refresh themes
      const themesResponse = await fetch('/api/themes');
      const themesResult = await themesResponse.json();
      if (themesResponse.ok) {
        setThemes(themesResult.themes || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to create theme',
        variant: 'destructive',
      });
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Explore Color Palettes
              </h1>
              <p className="text-muted-foreground">
                Discover trending palettes and find inspiration for your next project
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {user?.role === 'admin' && (
                <Dialog open={isAddThemeOpen} onOpenChange={setIsAddThemeOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Theme
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Theme</DialogTitle>
                      <DialogDescription>
                        Add a new color theme to the explore page. Only admins can create themes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="theme-name">Theme Name</Label>
                        <Input
                          id="theme-name"
                          value={newThemeName}
                          onChange={(e) => setNewThemeName(e.target.value)}
                          placeholder="e.g., Ocean Breeze"
                        />
                      </div>
                      
                      <div>
                        <Label>Colors</Label>
                        <div className="mt-2 space-y-2">
                          {newThemeColors.map((color, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="w-12 h-12 rounded border"
                                style={{ backgroundColor: color.hex }}
                              />
                              <div className="flex-1">
                                <div className="font-mono text-sm">{color.hex}</div>
                                <div className="text-xs text-muted-foreground">{color.rgb}</div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveColor(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          {currentColorPicker === null ? (
                            <Button
                              variant="outline"
                              onClick={() => setCurrentColorPicker(newThemeColors.length)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Color
                            </Button>
                          ) : (
                            <div className="space-y-2 p-4 border rounded-lg">
                              <HexColorPicker
                                color={tempColorHex}
                                onChange={setTempColorHex}
                              />
                              <div className="flex gap-2">
                                <Button onClick={handleAddColor} size="sm">
                                  Add Color
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentColorPicker(null);
                                    setTempColorHex('#000000');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="theme-tags">Tags (comma-separated)</Label>
                        <Input
                          id="theme-tags"
                          value={newThemeTags}
                          onChange={(e) => setNewThemeTags(e.target.value)}
                          placeholder="e.g., cool, ocean, serene"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddThemeOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTheme}>
                        Create Theme
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search palettes..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Hue Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Color Hue</label>
                  <Select
                    value={filters.hue}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, hue: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Colors</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Popularity Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort by</label>
                  <Select
                    value={filters.popularity}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, popularity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trending">Trending</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="recent">Recently Added</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground">
              {filteredAndSortedPalettes.length} unique palette{filteredAndSortedPalettes.length !== 1 ? 's' : ''} found
              {displayedPalettes.length > filteredAndSortedPalettes.length && (
                <span className="ml-2 text-xs">
                  (showing {displayedPalettes.length} with repeats)
                </span>
              )}
            </p>
          </div>

          {isLoadingThemes ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading themes...</span>
            </div>
          ) : displayedPalettes.length > 0 ? (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedPalettes.map((palette, index) => (
                <motion.div
                  key={palette.uniqueKey || `${palette.name}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index % 12) * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{palette.name}</CardTitle>
                      <div className="flex flex-wrap gap-1">
                        {palette.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      {/* Color Swatches */}
                      <div className="flex h-32">
                        {palette.colors.map((color: any, colorIndex: number) => (
                          <div
                            key={colorIndex}
                            className="flex-1 relative group cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                            title={`${color.name || color.hex}`}
                          >
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-mono">
                                {color.hex}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4" />
                          <span>{Math.floor(Math.random() * 1000) + 100}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyPalette(palette)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3 text-muted-foreground">Loading more palettes...</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No palettes found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => setFilters({ search: '', hue: 'all', popularity: 'trending' })}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}