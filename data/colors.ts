import { Color } from '@/types';

export const mockColors: Color[] = [
  // Grayscale
  { hex: '#08090A', name: 'Rich Black', rgb: 'rgb(8,9,10)', hsl: 'hsl(210,11%,4%)' },
  { hex: '#575A5E', name: 'Davy\'s Gray', rgb: 'rgb(87,90,94)', hsl: 'hsl(213,4%,35%)' },
  { hex: '#A7A7A9', name: 'Rose Quartz', rgb: 'rgb(167,167,169)', hsl: 'hsl(240,1%,66%)' },
  { hex: '#F4F7F5', name: 'Seasalt', rgb: 'rgb(244,247,245)', hsl: 'hsl(140,11%,96%)' },
  
  // Blues & Cyans
  { hex: '#C2FFF9', name: 'Light Cyan', rgb: 'rgb(194,255,249)', hsl: 'hsl(173,100%,88%)' },
  { hex: '#00B3A6', name: 'Teal', rgb: 'rgb(0,179,166)', hsl: 'hsl(176,100%,35%)' },
  { hex: '#008080', name: 'Dark Teal', rgb: 'rgb(0,128,128)', hsl: 'hsl(180,100%,25%)' },
  { hex: '#004D40', name: 'Deep Teal', rgb: 'rgb(0,77,64)', hsl: 'hsl(170,100%,15%)' },
  { hex: '#2196F3', name: 'Material Blue', rgb: 'rgb(33,150,243)', hsl: 'hsl(207,90%,54%)' },
  { hex: '#1976D2', name: 'Blue 700', rgb: 'rgb(25,118,210)', hsl: 'hsl(210,79%,46%)' },
  
  // Reds & Pinks
  { hex: '#F44336', name: 'Red 500', rgb: 'rgb(244,67,54)', hsl: 'hsl(4,90%,58%)' },
  { hex: '#E91E63', name: 'Pink 500', rgb: 'rgb(233,30,99)', hsl: 'hsl(340,82%,52%)' },
  { hex: '#FF9800', name: 'Orange 500', rgb: 'rgb(255,152,0)', hsl: 'hsl(36,100%,50%)' },
  { hex: '#FF5722', name: 'Deep Orange', rgb: 'rgb(255,87,34)', hsl: 'hsl(14,100%,57%)' },
  
  // Greens
  { hex: '#4CAF50', name: 'Green 500', rgb: 'rgb(76,175,80)', hsl: 'hsl(122,39%,49%)' },
  { hex: '#8BC34A', name: 'Light Green', rgb: 'rgb(139,195,74)', hsl: 'hsl(88,50%,53%)' },
  { hex: '#009688', name: 'Teal 500', rgb: 'rgb(0,150,136)', hsl: 'hsl(174,100%,29%)' },
  { hex: '#2E7D32', name: 'Green 800', rgb: 'rgb(46,125,50)', hsl: 'hsl(123,46%,34%)' },
  
  // Purples
  { hex: '#9C27B0', name: 'Purple 500', rgb: 'rgb(156,39,176)', hsl: 'hsl(291,64%,42%)' },
  { hex: '#673AB7', name: 'Deep Purple', rgb: 'rgb(103,58,183)', hsl: 'hsl(262,52%,47%)' },
  { hex: '#3F51B5', name: 'Indigo 500', rgb: 'rgb(63,81,181)', hsl: 'hsl(231,48%,48%)' },
  
  // Yellows
  { hex: '#FFEB3B', name: 'Yellow 500', rgb: 'rgb(255,235,59)', hsl: 'hsl(54,100%,62%)' },
  { hex: '#FFC107', name: 'Amber 500', rgb: 'rgb(255,193,7)', hsl: 'hsl(45,100%,51%)' },
  { hex: '#FF9800', name: 'Orange 500', rgb: 'rgb(255,152,0)', hsl: 'hsl(36,100%,50%)' },
  
  // Pastels
  { hex: '#FFE0E0', name: 'Pastel Pink', rgb: 'rgb(255,224,224)', hsl: 'hsl(0,100%,94%)' },
  { hex: '#E0F0FF', name: 'Pastel Blue', rgb: 'rgb(224,240,255)', hsl: 'hsl(209,100%,94%)' },
  { hex: '#E0FFE0', name: 'Pastel Green', rgb: 'rgb(224,255,224)', hsl: 'hsl(120,100%,94%)' },
  { hex: '#FFF0E0', name: 'Pastel Orange', rgb: 'rgb(255,240,224)', hsl: 'hsl(31,100%,94%)' },
  { hex: '#F0E0FF', name: 'Pastel Purple', rgb: 'rgb(240,224,255)', hsl: 'hsl(271,100%,94%)' },
  
  // Additional vibrant colors
  { hex: '#00FFFF', name: 'Cyan', rgb: 'rgb(0,255,255)', hsl: 'hsl(180,100%,50%)' },
  { hex: '#FF00FF', name: 'Magenta', rgb: 'rgb(255,0,255)', hsl: 'hsl(300,100%,50%)' },
  { hex: '#32CD32', name: 'Lime Green', rgb: 'rgb(50,205,50)', hsl: 'hsl(120,61%,50%)' },
  { hex: '#FFD700', name: 'Gold', rgb: 'rgb(255,215,0)', hsl: 'hsl(51,100%,50%)' },
  { hex: '#FF69B4', name: 'Hot Pink', rgb: 'rgb(255,105,180)', hsl: 'hsl(330,100%,71%)' },
  { hex: '#DC143C', name: 'Crimson', rgb: 'rgb(220,20,60)', hsl: 'hsl(348,83%,47%)' },
  { hex: '#00CED1', name: 'Dark Turquoise', rgb: 'rgb(0,206,209)', hsl: 'hsl(181,100%,41%)' },
  { hex: '#9370DB', name: 'Medium Purple', rgb: 'rgb(147,112,219)', hsl: 'hsl(260,60%,65%)' },
  { hex: '#20B2AA', name: 'Light Sea Green', rgb: 'rgb(32,178,170)', hsl: 'hsl(177,70%,41%)' },
  { hex: '#FF6347', name: 'Tomato', rgb: 'rgb(255,99,71)', hsl: 'hsl(9,100%,64%)' },
];

export const trendingPalettes: { 
  name: string; 
  colors: Color[]; 
  tags: string[]; 
}[] = [
  {
    name: 'Ocean Breeze',
    colors: [
      mockColors.find(c => c.name === 'Light Cyan')!,
      mockColors.find(c => c.name === 'Teal')!,
      mockColors.find(c => c.name === 'Dark Teal')!,
      mockColors.find(c => c.name === 'Deep Teal')!,
      mockColors.find(c => c.name === 'Seasalt')!,
    ],
    tags: ['nature', 'calm', 'professional']
  },
  {
    name: 'Sunset Gradient',
    colors: [
      mockColors.find(c => c.name === 'Gold')!,
      mockColors.find(c => c.name === 'Orange 500')!,
      mockColors.find(c => c.name === 'Deep Orange')!,
      mockColors.find(c => c.name === 'Red 500')!,
      mockColors.find(c => c.name === 'Purple 500')!,
    ],
    tags: ['warm', 'vibrant', 'energetic']
  },
  {
    name: 'Forest Harmony',
    colors: [
      mockColors.find(c => c.name === 'Light Green')!,
      mockColors.find(c => c.name === 'Green 500')!,
      mockColors.find(c => c.name === 'Green 800')!,
      mockColors.find(c => c.name === 'Deep Teal')!,
      mockColors.find(c => c.name === 'Rich Black')!,
    ],
    tags: ['nature', 'organic', 'growth']
  },
  {
    name: 'Modern Minimal',
    colors: [
      mockColors.find(c => c.name === 'Seasalt')!,
      mockColors.find(c => c.name === 'Rose Quartz')!,
      mockColors.find(c => c.name === 'Davy\'s Gray')!,
      mockColors.find(c => c.name === 'Rich Black')!,
      mockColors.find(c => c.name === 'Material Blue')!,
    ],
    tags: ['minimal', 'professional', 'clean']
  },
  {
    name: 'Pastel Dreams',
    colors: [
      mockColors.find(c => c.name === 'Pastel Pink')!,
      mockColors.find(c => c.name === 'Pastel Blue')!,
      mockColors.find(c => c.name === 'Pastel Green')!,
      mockColors.find(c => c.name === 'Pastel Orange')!,
      mockColors.find(c => c.name === 'Pastel Purple')!,
    ],
    tags: ['soft', 'dreamy', 'creative']
  }
];