'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Heart, Copy, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { trendingPalettes } from '@/data/colors';
import { useToast } from '@/hooks/use-toast';

interface FilterOptions {
  search: string;
  hue: string;
  popularity: string;
}

export default function Explore() {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    hue: 'all',
    popularity: 'trending',
  });
  const { toast } = useToast();

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
    ];
    return [...trendingPalettes, ...additional];
  }, []);

  const filteredPalettes = useMemo(() => {
    return allPalettes.filter(palette => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = palette.name.toLowerCase().includes(searchLower);
        const matchesTags = palette.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesName && !matchesTags) return false;
      }

      // Hue filter (simplified - could be more sophisticated)
      if (filters.hue !== 'all') {
        const hasHue = palette.colors.some(color => {
          const hex = color.hex.toLowerCase();
          switch (filters.hue) {
            case 'red': return hex.includes('f') && !hex.includes('0');
            case 'blue': return hex.includes('0') || hex.includes('2') || hex.includes('4');
            case 'green': return hex.includes('0') || hex.includes('8') || hex.includes('a');
            case 'yellow': return hex.includes('f') && hex.includes('f');
            case 'purple': return hex.includes('9') || hex.includes('c');
            default: return true;
          }
        });
        if (!hasHue) return false;
      }

      return true;
    });
  }, [allPalettes, filters]);

  const handleCopyPalette = (palette: any) => {
    const hexColors = palette.colors.map((c: any) => c.hex).join(', ');
    navigator.clipboard.writeText(hexColors);
    toast({
      title: "Copied!",
      description: `${palette.name} colors copied to clipboard`,
    });
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
            Explore Color Palettes
          </h1>
          <p className="text-muted-foreground mb-8">
            Discover trending palettes and find inspiration for your next project
          </p>
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
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
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
              {filteredPalettes.length} palette{filteredPalettes.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {filteredPalettes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPalettes.map((palette, index) => (
                <motion.div
                  key={palette.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{palette.name}</CardTitle>
                      <div className="flex flex-wrap gap-1">
                        {palette.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      {/* Color Swatches */}
                      <div className="flex h-32">
                        {palette.colors.map((color, colorIndex) => (
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