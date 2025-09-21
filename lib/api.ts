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
    const response = await fetch(`${API_BASE_URL}/extract-colors-from-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        n_colors,
      }),
    });

    if (!response.ok) {
      // Get specific error message from response if available
      let errorMessage = 'Failed to extract colors from URL';
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If we can't parse the error response, use status-based messages
        switch (response.status) {
          case 404:
            errorMessage = 'Website not found (404)';
            break;
          case 408:
            errorMessage = 'Request timeout';
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
          case 503:
            errorMessage = 'Service temporarily unavailable';
            break;
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
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
