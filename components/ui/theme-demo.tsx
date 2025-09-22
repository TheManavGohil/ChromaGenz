'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeDemo() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          Theme Control Demo
        </CardTitle>
        <CardDescription>
          Current theme: <span className="font-semibold">{theme}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
            className="w-full"
          >
            <Sun className="h-4 w-4 mr-2" />
            Light
          </Button>
          <Button 
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
            className="w-full"
          >
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </Button>
        </div>
        <Button 
          onClick={toggleTheme}
          variant="secondary"
          className="w-full"
        >
          Toggle Theme
        </Button>
        <div className="text-sm text-muted-foreground">
          <p>This demonstrates the global theme state.</p>
          <p>Changes here affect the entire application!</p>
        </div>
      </CardContent>
    </Card>
  );
}
