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

// Palette Variation Functions
export function generatePaletteVariations(colors: Color[]): {
  shades: Color[][];
  hueShifts: Color[][];
  temperature: Color[][];
  blindness: Color[][];
  luminance: Color[][];
} {
  return {
    shades: generateShadesVariations(colors),
    hueShifts: generateHueVariations(colors),
    temperature: generateTemperatureVariations(colors),
    blindness: generateBlindnessVariations(colors),
    luminance: generateLuminanceVariations(colors),
  };
}

function generateShadesVariations(colors: Color[]): Color[][] {
  const variations: Color[][] = [];
  
  for (let i = 0; i < 5; i++) {
    const variation: Color[] = [];
    const lightnessAdjustment = (i - 2) * 0.15; // -0.3, -0.15, 0, 0.15, 0.3
    
    colors.forEach(color => {
      try {
        const c = chroma(color.hex);
        const adjusted = lightnessAdjustment > 0 
          ? c.brighten(lightnessAdjustment * 2)
          : c.darken(-lightnessAdjustment * 2);
        variation.push(hexToColor(adjusted.hex()));
      } catch (error) {
        variation.push(color);
      }
    });
    
    variations.push(variation);
  }
  
  return variations;
}

function generateHueVariations(colors: Color[]): Color[][] {
  const variations: Color[][] = [];
  const hueShifts = [-60, -30, 0, 30, 60]; // Degrees to shift hue
  
  hueShifts.forEach(shift => {
    const variation: Color[] = [];
    
    colors.forEach(color => {
      try {
        const c = chroma(color.hex);
        const [h, s, l] = c.hsl();
        const newHue = (h + shift + 360) % 360;
        const adjusted = chroma.hsl(newHue, s, l);
        variation.push(hexToColor(adjusted.hex()));
      } catch (error) {
        variation.push(color);
      }
    });
    
    variations.push(variation);
  });
  
  return variations;
}

function generateTemperatureVariations(colors: Color[]): Color[][] {
  const variations: Color[][] = [];
  const temperatureAdjustments = [
    { name: 'Very Cool', temp: -0.4 },
    { name: 'Cool', temp: -0.2 },
    { name: 'Neutral', temp: 0 },
    { name: 'Warm', temp: 0.2 },
    { name: 'Very Warm', temp: 0.4 }
  ];
  
  temperatureAdjustments.forEach(({ temp }) => {
    const variation: Color[] = [];
    
    colors.forEach(color => {
      try {
        const c = chroma(color.hex);
        const [h, s, l] = c.hsl();
        
        // Adjust hue towards blue (cool) or orange/red (warm)
        let newHue = h;
        if (temp < 0) {
          // Cool: shift towards blue (240°)
          newHue = h + (240 - h) * Math.abs(temp) * 0.3;
        } else if (temp > 0) {
          // Warm: shift towards orange/red (30°)
          newHue = h + (30 - h) * temp * 0.3;
        }
        
        const adjusted = chroma.hsl(newHue, s, l);
        variation.push(hexToColor(adjusted.hex()));
      } catch (error) {
        variation.push(color);
      }
    });
    
    variations.push(variation);
  });
  
  return variations;
}

function generateBlindnessVariations(colors: Color[]): Color[][] {
  const variations: Color[][] = [];
  const blindnessTypes: Array<'normal' | 'deuteranomaly' | 'protanomaly' | 'tritanopia' | 'tritanomaly'> = [
    'normal', 'deuteranomaly', 'protanomaly', 'tritanopia', 'tritanomaly'
  ];
  
  blindnessTypes.forEach(type => {
    const variation: Color[] = [];
    
    colors.forEach(color => {
      if (type === 'normal') {
        variation.push(color);
      } else {
        const adjustedHex = simulateColorBlind(color.hex, type);
        variation.push(hexToColor(adjustedHex));
      }
    });
    
    variations.push(variation);
  });
  
  return variations;
}

function generateLuminanceVariations(colors: Color[]): Color[][] {
  const variations: Color[][] = [];
  const luminanceTargets = [0.1, 0.3, 0.5, 0.7, 0.9]; // Target luminance values
  
  luminanceTargets.forEach(targetLuminance => {
    const variation: Color[] = [];
    
    colors.forEach(color => {
      try {
        const c = chroma(color.hex);
        const currentLuminance = c.luminance();
        
        // Adjust lightness to reach target luminance
        if (targetLuminance > currentLuminance) {
          // Need to brighten
          const brightenAmount = Math.min(3, (targetLuminance - currentLuminance) * 5);
          const adjusted = c.brighten(brightenAmount);
          variation.push(hexToColor(adjusted.hex()));
        } else if (targetLuminance < currentLuminance) {
          // Need to darken
          const darkenAmount = Math.min(3, (currentLuminance - targetLuminance) * 5);
          const adjusted = c.darken(darkenAmount);
          variation.push(hexToColor(adjusted.hex()));
        } else {
          variation.push(color);
        }
      } catch (error) {
        variation.push(color);
      }
    });
    
    variations.push(variation);
  });
  
  return variations;
}