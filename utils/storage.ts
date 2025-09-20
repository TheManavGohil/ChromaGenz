import { Palette, User } from '@/types';

const PALETTES_KEY = 'chromagen_palettes';
const USER_KEY = 'chromagen_user';

export function savePalette(palette: Palette): void {
  try {
    const existingPalettes = getSavedPalettes();
    const updatedPalettes = [palette, ...existingPalettes.filter(p => p.id !== palette.id)];
    localStorage.setItem(PALETTES_KEY, JSON.stringify(updatedPalettes));
  } catch (error) {
    console.error('Error saving palette:', error);
  }
}

export function getSavedPalettes(): Palette[] {
  try {
    const saved = localStorage.getItem(PALETTES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading palettes:', error);
    return [];
  }
}

export function deletePalette(id: string): void {
  try {
    const existingPalettes = getSavedPalettes();
    const updatedPalettes = existingPalettes.filter(p => p.id !== id);
    localStorage.setItem(PALETTES_KEY, JSON.stringify(updatedPalettes));
  } catch (error) {
    console.error('Error deleting palette:', error);
  }
}

export function saveUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

export function getUser(): User | null {
  try {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing user:', error);
  }
}

// Initialize with mock palettes if none exist
export function initializeMockData(): void {
  const existingPalettes = getSavedPalettes();
  if (existingPalettes.length === 0) {
    const mockPalettes: Palette[] = [
      {
        id: 'mock-1',
        name: 'Ocean Vibes',
        colors: [
          { hex: '#C2FFF9', rgb: 'rgb(194,255,249)', hsl: 'hsl(173,100%,88%)', name: 'Light Cyan' },
          { hex: '#00B3A6', rgb: 'rgb(0,179,166)', hsl: 'hsl(176,100%,35%)', name: 'Teal' },
          { hex: '#008080', rgb: 'rgb(0,128,128)', hsl: 'hsl(180,100%,25%)', name: 'Dark Teal' },
          { hex: '#004D40', rgb: 'rgb(0,77,64)', hsl: 'hsl(170,100%,15%)', name: 'Deep Teal' },
          { hex: '#F4F7F5', rgb: 'rgb(244,247,245)', hsl: 'hsl(140,11%,96%)', name: 'Seasalt' },
        ],
        createdAt: new Date().toISOString(),
        tags: ['nature', 'calm'],
      },
      {
        id: 'mock-2',
        name: 'Sunset Dreams',
        colors: [
          { hex: '#FFD700', rgb: 'rgb(255,215,0)', hsl: 'hsl(51,100%,50%)', name: 'Gold' },
          { hex: '#FF9800', rgb: 'rgb(255,152,0)', hsl: 'hsl(36,100%,50%)', name: 'Orange 500' },
          { hex: '#FF5722', rgb: 'rgb(255,87,34)', hsl: 'hsl(14,100%,57%)', name: 'Deep Orange' },
          { hex: '#F44336', rgb: 'rgb(244,67,54)', hsl: 'hsl(4,90%,58%)', name: 'Red 500' },
          { hex: '#9C27B0', rgb: 'rgb(156,39,176)', hsl: 'hsl(291,64%,42%)', name: 'Purple 500' },
        ],
        createdAt: new Date().toISOString(),
        tags: ['warm', 'vibrant'],
      },
      {
        id: 'mock-3',
        name: 'Minimal Modern',
        colors: [
          { hex: '#F4F7F5', rgb: 'rgb(244,247,245)', hsl: 'hsl(140,11%,96%)', name: 'Seasalt' },
          { hex: '#A7A7A9', rgb: 'rgb(167,167,169)', hsl: 'hsl(240,1%,66%)', name: 'Rose Quartz' },
          { hex: '#575A5E', rgb: 'rgb(87,90,94)', hsl: 'hsl(213,4%,35%)', name: 'Davy\'s Gray' },
          { hex: '#08090A', rgb: 'rgb(8,9,10)', hsl: 'hsl(210,11%,4%)', name: 'Rich Black' },
        ],
        createdAt: new Date().toISOString(),
        tags: ['minimal', 'professional'],
      },
    ];
    
    mockPalettes.forEach(savePalette);
  }
}