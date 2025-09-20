// API service for color-related backend calls

const API_BASE_URL = 'https://bit-byte-rmtv.onrender.com';

export interface ColorResponse {
  hex: string;
  rgb: [number, number, number];
}

export interface PaletteResponse {
  success: boolean;
  text_description?: string;
  seed_color: string;
  palette: ColorResponse[];
  palette_mode: string;
  num_colors: number;
  method?: string;
}

export interface ExtractColorsResponse {
  success: boolean;
  colors: ColorResponse[];
  n_colors: number;
  include_percentages: boolean;
}

export const colorApi = {
  // Generate palette from text description
  generatePaletteFromText: async (
    text_description: string,
    palette_mode: 'smart' | 'analogous' | 'split_complementary' | 'triadic' | 'tetradic' = 'smart',
    num_colors: number = 5
  ): Promise<PaletteResponse> => {
    const response = await fetch(`${API_BASE_URL}/generate-palette-from-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_description,
        palette_mode,
        num_colors,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate palette from text');
    }

    return response.json();
  },

  // Generate palette from seed color
  generatePaletteFromSeed: async (
    seed_color: string,
    palette_mode: 'smart' | 'analogous' | 'split_complementary' | 'triadic' | 'tetradic' = 'smart',
    num_colors: number = 5
  ): Promise<PaletteResponse> => {
    const response = await fetch(`${API_BASE_URL}/generate-palette-from-seed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seed_color,
        palette_mode,
        num_colors,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate palette from seed color');
    }

    return response.json();
  },

  // Extract colors from image file
  extractColorsFromImage: async (
    imageFile: File,
    n_colors: number = 5,
    include_percentages: boolean = false
  ): Promise<ExtractColorsResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('n_colors', n_colors.toString());
    formData.append('include_percentages', include_percentages.toString());

    const response = await fetch(`${API_BASE_URL}/extract-colors`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to extract colors from image');
    }

    return response.json();
  },

  // Extract colors from URL
  extractColorsFromUrl: async (
    url: string,
    n_colors: number = 5
  ): Promise<ExtractColorsResponse> => {
    // First fetch the image from the URL
    const imageResponse = await fetch(url);
    const imageBlob = await imageResponse.blob();
    const imageFile = new File([imageBlob], 'image.jpg', { type: imageBlob.type });

    // Then extract colors using the same method as file upload
    return colorApi.extractColorsFromImage(imageFile, n_colors);
  },

  // Generate a single color from text description
  generateColorFromText: async (text_description: string): Promise<{ success: boolean; seed_color: string }> => {
    const response = await fetch(`${API_BASE_URL}/text-to-color`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_description,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate color from text');
    }

    return response.json();
  },
};
