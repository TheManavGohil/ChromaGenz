export interface Color {
  hex: string;
  rgb: string;
  hsl: string;
  name?: string;
}

export interface Palette {
  id: string;
  name: string;
  colors: Color[];
  createdAt: string;
  tags?: string[];
  locked?: boolean[];
}

export interface ContrastCheck {
  ratio: number;
  aa: boolean;
  aaa: boolean;
}

export interface ColorBlindType {
  name: string;
  type: 'deuteranomaly' | 'protanomaly' | 'tritanopia' | 'tritanomaly';
}

export interface User {
  id: string;
  username: string;
  email: string;
}