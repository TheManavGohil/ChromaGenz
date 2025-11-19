'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RefreshCcw, Database, Pencil, Trash2, UploadCloud } from 'lucide-react';

type PostgresPalette = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  colors: string[];
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  name: string;
  description: string;
  tags: string;
  colors: string;
};

const defaultFormState: FormState = {
  name: '',
  description: '',
  tags: '',
  colors: '#FF6B6B, #FFD93D, #6BCB77, #4D96FF, #843B62',
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

export default function PostgresPalettesPage() {
  const { toast } = useToast();
  const [palettes, setPalettes] = useState<PostgresPalette[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>(defaultFormState);

  const isEditing = Boolean(selectedId);

  const orderedPalettes = useMemo(
    () =>
      palettes.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [palettes]
  );

  const fetchPalettes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/postgres-palettes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch palettes');
      }

      setPalettes(data.palettes || []);
    } catch (error: any) {
      toast({
        title: 'Unable to load PostgreSQL palettes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPalettes();
  }, []);

  const resetForm = () => {
    setSelectedId(null);
    setFormState(defaultFormState);
  };

  const parseColorsInput = (input: string) =>
    input
      .split(/,|\s+/)
      .map((color) => color.trim())
      .filter(Boolean);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const payload = {
        name: formState.name.trim(),
        description: formState.description.trim(),
        tags: formState.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        colors: parseColorsInput(formState.colors),
      };

      if (!payload.name || payload.colors.length === 0) {
        toast({
          title: 'Missing fields',
          description: 'Name and at least one hex color are required.',
          variant: 'destructive',
        });
        return;
      }

      const url = isEditing
        ? `/api/postgres-palettes/${selectedId}`
        : '/api/postgres-palettes';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      toast({
        title: `Palette ${isEditing ? 'updated' : 'created'}!`,
        description: 'PostgreSQL successfully processed your request.',
      });

      await fetchPalettes();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Action failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (palette: PostgresPalette) => {
    setSelectedId(palette.id);
    setFormState({
      name: palette.name,
      description: palette.description || '',
      tags: palette.tags.join(', '),
      colors: palette.colors.join(', '),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this palette from PostgreSQL?')) return;

    try {
      const response = await fetch(`/api/postgres-palettes/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete palette');
      }

      toast({
        title: 'Palette deleted',
        description: 'Record removed from Neon/PostgreSQL.',
      });

      if (selectedId === id) {
        resetForm();
      }

      await fetchPalettes();
    } catch (error: any) {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold">Server Palettes (PostgreSQL)</h1>
          <p className="text-muted-foreground">
            Persist collaborative palettes in Neon using Prisma, side-by-side with your
            MongoDB features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? 'Update palette' : 'Create new palette'}</CardTitle>
                <CardDescription>
                  {isEditing
                    ? 'You are editing an existing row stored in PostgreSQL.'
                    : 'Every submission becomes a new row in the palettes table.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Studio Brand Pack"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formState.description}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="High-contrast palette for UI accents."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input
                    value={formState.tags}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, tags: event.target.value }))
                    }
                    placeholder="ui, marketing, dark"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hex colors</label>
                  <Textarea
                    value={formState.colors}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, colors: event.target.value }))
                    }
                    placeholder="#FF6B6B, #FFD93D, #6BCB77"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleSubmit} disabled={submitting}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {isEditing ? 'Save changes' : 'Create palette'}
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={fetchPalettes}
                    disabled={loading}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Stored palettes</CardTitle>
                  <CardDescription>
                    {loading
                      ? 'Loading from Prisma...'
                      : `${palettes.length} row${palettes.length === 1 ? '' : 's'} in PostgreSQL`}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchPalettes} disabled={loading}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <p className="text-sm text-muted-foreground">Fetching data...</p>
                ) : orderedPalettes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No palettes stored in PostgreSQL yet.
                  </p>
                ) : (
                  orderedPalettes.map((palette) => (
                    <div
                      key={palette.id}
                      className="rounded-lg border p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{palette.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Updated {formatDate(palette.updatedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(palette)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(palette.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {palette.description && (
                        <p className="text-sm text-muted-foreground">{palette.description}</p>
                      )}
                      {palette.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {palette.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex h-20 overflow-hidden rounded-lg">
                        {palette.colors.map((color) => (
                          <div
                            key={color}
                            className="flex-1 flex items-end justify-between px-2 py-1 text-[10px] font-mono text-white/90"
                            style={{ backgroundColor: color }}
                          >
                            <span>{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

