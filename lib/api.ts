// API service for color-related backend calls

const API_BASE_URL = process.env.BACKEND_URL;

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

export interface ColorExplanation {
  color: string;
  name: string;
  description: string;
  psychology: string;
  common_uses: string[];
}

export interface PaletteExplanation {
  colors: ColorExplanation[];
  palette_analysis: {
    harmony: string;
    mood: string;
    use_cases: string[];
  };
}

export interface PaletteEvolution {
  success: boolean;
  evolved_palette: string[];
  changes_made: string[];
  explanation: string;
}

export interface WorkflowResult {
  success: boolean;
  text_description: string;
  palette_mode: string;
  num_colors: number;
  initial_palette: {
    seed_color: string;
    palette: string[];
  };
  evolution?: {
    evolved_palette: string[];
    changes_made: string[];
    explanation: string;
  };
  explanation?: PaletteExplanation;
  final_palette: string[];
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

  // Evolve an existing palette based on user feedback
  evolvePalette: async (
    current_palette: string[],
    user_feedback: string,
    target_mood?: string
  ): Promise<PaletteEvolution> => {
    const response = await fetch(`${API_BASE_URL}/evolve-palette`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_palette,
        user_feedback,
        target_mood,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to evolve palette');
    }

    return response.json();
  },

  // Get AI-powered explanations for colors
  explainColors: async (
    palette: string[],
    context?: string
  ): Promise<PaletteExplanation> => {
    // Ensure all colors are properly formatted
    const validPalette = palette.map(color => color.startsWith('#') ? color : `#${color}`);
    
    console.log('Sending request to explain-colors:', {
      palette: validPalette,
      context: context || undefined
    });

    const response = await fetch(`${API_BASE_URL}/explain-colors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        palette: validPalette,
        context: context || undefined,
      }),
    });

    if (!response.ok) {
      // Try to get more detailed error message
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to explain colors');
      } catch {
        throw new Error(`Failed to explain colors (${response.status})`);
      }
    }

    const data = await response.json();
    console.log('Raw API Response:', data); // Log the raw response
    
    // Check if we have the expected data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format');
    }
    
    // Validate response structure and provide default values
    const defaultColor = {
      color: '#000000',
      name: 'Unnamed Color',
      description: 'No description available',
      psychology: 'No psychology information available',
      common_uses: []
    };

    const defaultPaletteAnalysis = {
      harmony: 'No harmony information available',
      mood: 'No mood information available',
      use_cases: []
    };

    // Return the explanation data with proper type checking and defaults
    return {
      colors: Array.isArray(data?.colors) ? data.colors.map((color: any) => ({
        color: color?.color || color?.hex || defaultColor.color,
        name: color?.name || defaultColor.name,
        description: color?.description || defaultColor.description,
        psychology: color?.psychology || defaultColor.psychology,
        common_uses: Array.isArray(color?.common_uses) ? color.common_uses : defaultColor.common_uses
      })) : [defaultColor],
      palette_analysis: {
        harmony: data?.palette_analysis?.harmony || defaultPaletteAnalysis.harmony,
        mood: data?.palette_analysis?.mood || defaultPaletteAnalysis.mood,
        use_cases: Array.isArray(data?.palette_analysis?.use_cases) ? 
          data.palette_analysis.use_cases : defaultPaletteAnalysis.use_cases
      }
    };
  },

  // Complete palette workflow
  paletteWorkflow: async (
    text_description: string,
    palette_mode: 'smart' | 'analogous' | 'split_complementary' | 'triadic' | 'tetradic' = 'smart',
    num_colors: number = 5,
    evolution_feedback?: string,
    include_explanation: boolean = true
  ): Promise<WorkflowResult> => {
    const response = await fetch(`${API_BASE_URL}/palette-workflow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_description,
        palette_mode,
        num_colors,
        evolution_feedback,
        include_explanation,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to execute palette workflow');
    }

    return response.json();
  },
};


