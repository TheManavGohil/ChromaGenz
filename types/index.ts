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
  role: 'user' | 'admin';
}

// NextAuth type extensions
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: 'user' | 'admin';
      image?: string;
      name?: string;
    };
  }

  interface User {
    id: string;
    username?: string;
    role?: 'user' | 'admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: 'user' | 'admin';
    username?: string;
  }
}