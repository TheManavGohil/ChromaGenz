'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Edit, Share, Copy, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getSavedPalettes, deletePalette } from '@/utils/storage';
import { Palette } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Palettes() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPalettes();
  }, []);

  const loadPalettes = () => {
    const saved = getSavedPalettes();
    setPalettes(saved);
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    deletePalette(id);
    loadPalettes();
    toast({
      title: "Palette Deleted",
      description: "The palette has been removed from your collection.",
    });
  };

  const handleShare = (palette: Palette) => {
    const colors = palette.colors.map(c => c.hex).join('-');
    const shareUrl = `${window.location.origin}/generate?colors=${colors}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share Link Copied!",
      description: "The palette share link has been copied to your clipboard.",
    });
  };

  const handleCopy = (palette: Palette) => {
    const hexColors = palette.colors.map(c => c.hex).join(', ');
    navigator.clipboard.writeText(hexColors);
    toast({
      title: "Colors Copied!",
      description: "All color codes have been copied to your clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              My Palettes
            </h1>
            <p className="text-muted-foreground">
              {palettes.length} saved palette{palettes.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Link href="/generate">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </Link>
        </motion.div>

        {/* Palettes Grid */}
        {palettes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {palettes.map((palette, index) => (
              <motion.div
                key={palette.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg truncate">
                      {palette.name}
                    </CardTitle>
                    <CardDescription>
                      Created {new Date(palette.createdAt).toLocaleDateString()}
                    </CardDescription>
                    {palette.tags && palette.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {palette.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
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
                      <div className="text-sm text-muted-foreground">
                        {palette.colors.length} colors
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(palette)}
                          title="Copy colors"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShare(palette)}
                          title="Share palette"
                        >
                          <Share className="h-3 w-3" />
                        </Button>
                        
                        <Link href={`/generate?palette=${palette.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Edit palette"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Delete palette"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Palette</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{palette.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(palette.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                <Plus className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">No Palettes Yet</h2>
              <p className="text-muted-foreground mb-8">
                Start creating beautiful color palettes and they'll appear here for easy access and organization.
              </p>
              <Link href="/generate">
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Palette
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}