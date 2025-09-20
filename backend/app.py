"""
Flask API for Color Extraction Service
Provides endpoints for extracting dominant colors from uploaded images
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from color_extractor import ColorExtractor
from text_to_color import TextToColorService
from generate_color import generate_smart_palette, generate_palette
import io
from PIL import Image
import traceback
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize services
color_extractor = ColorExtractor()

# Initialize text-to-color service (will use fallback if no API key)
try:
    text_to_color_service = TextToColorService()
    text_service_available = True
except ValueError:
    text_to_color_service = None
    text_service_available = False
    print("⚠️  Groq API key not found. Text-to-color will use fallback method.")

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Color Extraction API is running',
        'version': '2.0.0',
        'features': {
            'image_color_extraction': True,
            'text_to_color': text_service_available,
            'palette_generation': True
        }
    })

@app.route('/extract-colors', methods=['POST'])
def extract_colors():
    """
    Extract dominant colors from uploaded image
    
    Expected form data:
    - image: Image file
    - n_colors: Number of colors to extract (optional, default: 5)
    - include_percentages: Whether to include color percentages (optional, default: false)
    
    Returns:
    JSON response with extracted colors
    """
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image file provided',
                'message': 'Please upload an image file'
            }), 400
        
        image_file = request.files['image']
        
        # Check if file is selected
        if image_file.filename == '':
            return jsonify({
                'error': 'No image file selected',
                'message': 'Please select an image file'
            }), 400
        
        # Get optional parameters
        n_colors = int(request.form.get('n_colors', 5))
        include_percentages = request.form.get('include_percentages', 'false').lower() == 'true'
        
        # Validate n_colors
        if n_colors < 1 or n_colors > 20:
            return jsonify({
                'error': 'Invalid number of colors',
                'message': 'Number of colors must be between 1 and 20'
            }), 400
        
        # Read image data
        image_data = image_file.read()
        
        # Validate image format
        try:
            Image.open(io.BytesIO(image_data))
        except Exception:
            return jsonify({
                'error': 'Invalid image format',
                'message': 'Please upload a valid image file (JPEG, PNG, etc.)'
            }), 400
        
        # Extract colors
        if include_percentages:
            color_data = color_extractor.get_color_percentages(image_data, n_colors)
            colors = []
            for (r, g, b), percentage in color_data:
                colors.append({
                    'rgb': [r, g, b],
                    'hex': color_extractor.rgb_to_hex((r, g, b)),
                    'percentage': percentage
                })
        else:
            color_data = color_extractor.extract_colors(image_data, n_colors)
            colors = []
            for r, g, b in color_data:
                colors.append({
                    'rgb': [r, g, b],
                    'hex': color_extractor.rgb_to_hex((r, g, b))
                })
        
        return jsonify({
            'success': True,
            'colors': colors,
            'n_colors': len(colors),
            'include_percentages': include_percentages
        })
    
    except Exception as e:
        # Log the error for debugging
        print(f"Error processing image: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while processing the image'
        }), 500

@app.route('/extract-colors-batch', methods=['POST'])
def extract_colors_batch():
    """
    Extract colors from multiple images
    
    Expected form data:
    - images: Multiple image files
    - n_colors: Number of colors to extract per image (optional, default: 5)
    
    Returns:
    JSON response with extracted colors for each image
    """
    try:
        # Check if image files are present
        if 'images' not in request.files:
            return jsonify({
                'error': 'No image files provided',
                'message': 'Please upload image files'
            }), 400
        
        image_files = request.files.getlist('images')
        
        if not image_files or all(f.filename == '' for f in image_files):
            return jsonify({
                'error': 'No image files selected',
                'message': 'Please select image files'
            }), 400
        
        # Get optional parameters
        n_colors = int(request.form.get('n_colors', 5))
        
        # Validate n_colors
        if n_colors < 1 or n_colors > 20:
            return jsonify({
                'error': 'Invalid number of colors',
                'message': 'Number of colors must be between 1 and 20'
            }), 400
        
        results = []
        
        for i, image_file in enumerate(image_files):
            if image_file.filename == '':
                continue
                
            try:
                # Read image data
                image_data = image_file.read()
                
                # Validate image format
                Image.open(io.BytesIO(image_data))
                
                # Extract colors
                color_data = color_extractor.extract_colors(image_data, n_colors)
                colors = []
                for r, g, b in color_data:
                    colors.append({
                        'rgb': [r, g, b],
                        'hex': color_extractor.rgb_to_hex((r, g, b))
                    })
                
                results.append({
                    'filename': image_file.filename,
                    'index': i,
                    'success': True,
                    'colors': colors,
                    'n_colors': len(colors)
                })
                
            except Exception as e:
                results.append({
                    'filename': image_file.filename,
                    'index': i,
                    'success': False,
                    'error': f'Error processing image: {str(e)}'
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'total_images': len(results)
        })
    
    except Exception as e:
        print(f"Error in batch processing: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while processing the images'
        }), 500

@app.route('/text-to-color', methods=['POST'])
def text_to_color():
    """
    Generate a seed color from text description

    Expected JSON data:
    - text_description: Text description of desired color theme

    Returns:
    JSON response with extracted seed color
    """
    try:
        # Get JSON data
        data = request.get_json()

        if not data or 'text_description' not in data:
            return jsonify({
                'error': 'Missing text description',
                'message': 'Please provide a text_description in the request body'
            }), 400

        text_description = data['text_description'].strip()

        if not text_description:
            return jsonify({
                'error': 'Empty text description',
                'message': 'Please provide a non-empty text description'
            }), 400

        # Extract seed color
        if text_service_available and text_to_color_service:
            seed_color = text_to_color_service.extract_seed_color(text_description)
        else:
            # Use fallback method
            from text_to_color import TextToColorService
            temp_service = TextToColorService.__new__(TextToColorService)
            seed_color = temp_service._fallback_color_extraction(text_description)

        return jsonify({
            'success': True,
            'text_description': text_description,
            'seed_color': seed_color,
            'method': 'groq_llama' if text_service_available else 'fallback'
        })

    except Exception as e:
        print(f"Error in text-to-color: {str(e)}")
        print(traceback.format_exc())

        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while processing the text'
        }), 500

@app.route('/generate-palette-from-text', methods=['POST'])
def generate_palette_from_text():
    """
    Generate a complete color palette from text description

    Expected JSON data:
    - text_description: Text description of desired color theme
    - palette_mode: Palette generation mode (optional, default: 'smart')
    - num_colors: Number of colors in palette (optional, default: 5)

    Returns:
    JSON response with seed color and generated palette
    """
    try:
        # Get JSON data
        data = request.get_json()

        if not data or 'text_description' not in data:
            return jsonify({
                'error': 'Missing text description',
                'message': 'Please provide a text_description in the request body'
            }), 400

        text_description = data['text_description'].strip()
        palette_mode = data.get('palette_mode', 'smart')
        num_colors = int(data.get('num_colors', 5))

        if not text_description:
            return jsonify({
                'error': 'Empty text description',
                'message': 'Please provide a non-empty text description'
            }), 400

        # Validate parameters
        if num_colors < 1 or num_colors > 20:
            return jsonify({
                'error': 'Invalid number of colors',
                'message': 'Number of colors must be between 1 and 20'
            }), 400

        valid_modes = ['smart', 'analogous', 'split_complementary', 'triadic', 'tetradic']
        if palette_mode not in valid_modes:
            return jsonify({
                'error': 'Invalid palette mode',
                'message': f'Palette mode must be one of: {", ".join(valid_modes)}'
            }), 400

        # Generate palette
        if text_service_available and text_to_color_service:
            result = text_to_color_service.generate_palette_from_text(
                text_description, palette_mode, num_colors
            )
        else:
            # Use fallback method
            from text_to_color import TextToColorService
            temp_service = TextToColorService.__new__(TextToColorService)
            seed_color = temp_service._fallback_color_extraction(text_description)

            # Generate palette
            if palette_mode == 'smart':
                palette = generate_smart_palette(seed_color, num_colors)
            else:
                palette = generate_palette(seed_color, palette_mode, num_colors)

            result = {
                'text_description': text_description,
                'seed_color': seed_color,
                'palette': palette,
                'palette_mode': palette_mode,
                'num_colors': len(palette)
            }

        # Convert palette to detailed format
        detailed_palette = []
        for hex_color in result['palette']:
            # Convert hex to RGB
            hex_clean = hex_color.lstrip('#')
            rgb = tuple(int(hex_clean[i:i+2], 16) for i in (0, 2, 4))

            detailed_palette.append({
                'hex': hex_color,
                'rgb': list(rgb)
            })

        return jsonify({
            'success': True,
            'text_description': result['text_description'],
            'seed_color': result['seed_color'],
            'palette': detailed_palette,
            'palette_mode': result['palette_mode'],
            'num_colors': result['num_colors'],
            'method': 'groq_llama' if text_service_available else 'fallback'
        })

    except Exception as e:
        print(f"Error in generate-palette-from-text: {str(e)}")
        print(traceback.format_exc())

        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while generating the palette'
        }), 500

@app.route('/generate-palette-from-seed', methods=['POST'])
def generate_palette_from_seed():
    """
    Generate a color palette from a seed color

    Expected JSON data:
    - seed_color: Hex color code (e.g., "#FF5733")
    - palette_mode: Palette generation mode (optional, default: 'smart')
    - num_colors: Number of colors in palette (optional, default: 5)

    Returns:
    JSON response with generated palette
    """
    try:
        # Get JSON data
        data = request.get_json()

        if not data or 'seed_color' not in data:
            return jsonify({
                'error': 'Missing seed color',
                'message': 'Please provide a seed_color in the request body'
            }), 400

        seed_color = data['seed_color'].strip()
        palette_mode = data.get('palette_mode', 'smart')
        num_colors = int(data.get('num_colors', 5))

        # Validate hex color format
        import re
        if not re.match(r'^#[0-9A-Fa-f]{6}$', seed_color):
            return jsonify({
                'error': 'Invalid seed color format',
                'message': 'Seed color must be a valid hex color (e.g., #FF5733)'
            }), 400

        # Validate parameters
        if num_colors < 1 or num_colors > 20:
            return jsonify({
                'error': 'Invalid number of colors',
                'message': 'Number of colors must be between 1 and 20'
            }), 400

        valid_modes = ['smart', 'analogous', 'split_complementary', 'triadic', 'tetradic']
        if palette_mode not in valid_modes:
            return jsonify({
                'error': 'Invalid palette mode',
                'message': f'Palette mode must be one of: {", ".join(valid_modes)}'
            }), 400

        # Generate palette
        if palette_mode == 'smart':
            palette = generate_smart_palette(seed_color, num_colors)
        else:
            palette = generate_palette(seed_color, palette_mode, num_colors)

        # Convert palette to detailed format
        detailed_palette = []
        for hex_color in palette:
            # Convert hex to RGB
            hex_clean = hex_color.lstrip('#')
            rgb = tuple(int(hex_clean[i:i+2], 16) for i in (0, 2, 4))

            detailed_palette.append({
                'hex': hex_color,
                'rgb': list(rgb)
            })

        return jsonify({
            'success': True,
            'seed_color': seed_color,
            'palette': detailed_palette,
            'palette_mode': palette_mode,
            'num_colors': len(palette)
        })

    except Exception as e:
        print(f"Error in generate-palette-from-seed: {str(e)}")
        print(traceback.format_exc())

        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred while generating the palette'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
