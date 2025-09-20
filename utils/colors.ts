import chroma from 'chroma-js';
import { Color, ContrastCheck } from '@/types';
import { mockColors } from '@/data/colors';

export function generateShades(color: string, steps: number = 15): string[] {
  try {
    const baseColor = chroma(color);
    return chroma
      .scale([
        baseColor.brighten(3).saturate(0.5),
        baseColor,
        baseColor.darken(3).desaturate(0.3)
      ])
      .mode('lab')
      .colors(steps);
  } catch (error) {
    console.error('Error generating shades:', error);
    return [color];
  }
}

export function simulateColorBlind(
  color: string, 
  type: 'deuteranomaly' | 'protanomaly' | 'tritanopia' | 'tritanomaly'
): string {
  try {
    const rgb = chroma(color).rgb();
    let r = rgb[0], g = rgb[1], b = rgb[2];

    // Transformation matrices for different types of color blindness
    switch (type) {
      case 'deuteranomaly': // Green weakness
        return chroma([
          r * 0.80 + g * 0.20 + b * 0.00,
          r * 0.25 + g * 0.75 + b * 0.00,
          r * 0.00 + g * 0.14 + b * 0.86
        ]).hex();
      
      case 'protanomaly': // Red weakness
        return chroma([
          r * 0.82 + g * 0.18 + b * 0.00,
          r * 0.33 + g * 0.67 + b * 0.00,
          r * 0.00 + g * 0.13 + b * 0.87
        ]).hex();
      
      case 'tritanopia': // Blue blindness
        return chroma([
          r * 0.95 + g * 0.05 + b * 0.00,
          r * 0.00 + g * 0.43 + b * 0.57,
          r * 0.00 + g * 0.48 + b * 0.52
        ]).hex();
      
      case 'tritanomaly': // Blue weakness
        return chroma([
          r * 0.97 + g * 0.03 + b * 0.00,
          r * 0.00 + g * 0.73 + b * 0.27,
          r * 0.00 + g * 0.18 + b * 0.82
        ]).hex();
      
      default:
        return color;
    }
  } catch (error) {
    console.error('Error simulating color blindness:', error);
    return color;
  }
}

export function checkContrast(color1: string, color2: string): ContrastCheck {
  try {
    const ratio = chroma.contrast(color1, color2);
    return {
      ratio: Math.round(ratio * 100) / 100,
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
    };
  } catch (error) {
    console.error('Error checking contrast:', error);
    return { ratio: 1, aa: false, aaa: false };
  }
}

export function generateRandomPalette(numColors: number = 5): Color[] {
  // Create harmonious colors using chroma.js
  const baseHue = Math.random() * 360;
  const colors: Color[] = [];
  
  for (let i = 0; i < numColors; i++) {
    try {
      // Create harmonious hues (complementary, triadic, etc.)
      const hue = (baseHue + (i * 360 / numColors) + (Math.random() * 30 - 15)) % 360;
      const saturation = 0.3 + Math.random() * 0.7;
      const lightness = 0.2 + Math.random() * 0.6;
      
      const color = chroma.hsl(hue, saturation, lightness);
      const hex = color.hex();
      
      colors.push({
        hex,
        rgb: color.css('rgb'),
        hsl: color.css('hsl'),
        name: findColorName(hex) || `Color ${i + 1}`,
      });
    } catch (error) {
      // Fallback to mock colors
      const randomIndex = Math.floor(Math.random() * mockColors.length);
      colors.push(mockColors[randomIndex]);
    }
  }
  
  return colors;
}

export function findColorName(hex: string): string | undefined {
  // Find closest color name from our mock data
  const targetColor = chroma(hex);
  let closestColor = mockColors[0];
  let minDistance = Infinity;
  
  for (const color of mockColors) {
    try {
      const distance = chroma.distance(targetColor, color.hex);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    } catch (error) {
      continue;
    }
  }
  
  return minDistance < 30 ? closestColor.name : undefined;
}

export function adjustColor(
  color: string, 
  adjustments: { hue?: number; saturation?: number; lightness?: number }
): string {
  try {
    let c = chroma(color);
    
    if (adjustments.hue !== undefined) {
      const [h, s, l] = c.hsl();
      c = chroma.hsl((h + adjustments.hue) % 360, s, l);
    }
    
    if (adjustments.saturation !== undefined) {
      c = c.saturate(adjustments.saturation);
    }
    
    if (adjustments.lightness !== undefined) {
      c = adjustments.lightness > 0 ? c.brighten(adjustments.lightness) : c.darken(-adjustments.lightness);
    }
    
    return c.hex();
  } catch (error) {
    console.error('Error adjusting color:', error);
    return color;
  }
}

export function createGradient(colors: string[], direction = 'to right'): string {
  const colorStops = colors.join(', ');
  return `linear-gradient(${direction}, ${colorStops})`;
}

export function getColorLuminance(color: string): number {
  try {
    return chroma(color).luminance();
  } catch (error) {
    return 0.5;
  }
}

export function getTextColor(backgroundColor: string): string {
  const luminance = getColorLuminance(backgroundColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function hexToColor(hex: string): Color {
  try {
    const color = chroma(hex);
    return {
      hex,
      rgb: color.css('rgb'),
      hsl: color.css('hsl'),
      name: findColorName(hex),
    };
  } catch (error) {
    console.error('Error converting hex to color:', error);
    return { hex: '#000000', rgb: 'rgb(0,0,0)', hsl: 'hsl(0,0%,0%)', name: 'Black' };
  }
}