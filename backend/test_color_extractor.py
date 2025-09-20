"""
Test suite for the Color Extractor functionality
"""

import unittest
import numpy as np
from PIL import Image
import io
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from color_extractor import ColorExtractor


class TestColorExtractor(unittest.TestCase):
    """Test cases for ColorExtractor class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.extractor = ColorExtractor()
    
    def create_test_image(self, colors, size=(100, 100)):
        """
        Create a test image with specific colors
        
        Args:
            colors: List of RGB tuples
            size: Image size (width, height)
            
        Returns:
            PIL Image object
        """
        image = Image.new('RGB', size)
        pixels = []
        
        # Create image with equal sections of each color
        section_height = size[1] // len(colors)
        
        for i, color in enumerate(colors):
            start_y = i * section_height
            end_y = (i + 1) * section_height if i < len(colors) - 1 else size[1]
            
            for y in range(start_y, end_y):
                for x in range(size[0]):
                    pixels.append(color)
        
        image.putdata(pixels)
        return image
    
    def test_preprocess_image(self):
        """Test image preprocessing"""
        # Create a large test image
        large_image = Image.new('RGB', (1000, 1000), (255, 0, 0))
        
        # Preprocess the image
        processed = self.extractor.preprocess_image(large_image)
        
        # Check that image was resized
        self.assertLessEqual(processed.width, 500)
        self.assertLessEqual(processed.height, 500)
        
        # Check that image is in RGB mode
        self.assertEqual(processed.mode, 'RGB')
    
    def test_image_to_rgb_array(self):
        """Test conversion of image to RGB array"""
        # Create a simple 2x2 test image
        test_image = Image.new('RGB', (2, 2))
        test_image.putdata([(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 255)])
        
        # Convert to RGB array
        rgb_array = self.extractor.image_to_rgb_array(test_image)
        
        # Check shape
        self.assertEqual(rgb_array.shape, (4, 3))
        
        # Check values
        expected = np.array([[255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 255]])
        np.testing.assert_array_equal(rgb_array, expected)
    
    def test_extract_colors_basic(self):
        """Test basic color extraction"""
        # Create test image with known colors
        test_colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255)]
        test_image = self.create_test_image(test_colors)
        
        # Extract colors
        extracted_colors = self.extractor.extract_colors(test_image, n_colors=3)
        
        # Check that we got the right number of colors
        self.assertEqual(len(extracted_colors), 3)
        
        # Check that all extracted colors are RGB tuples
        for color in extracted_colors:
            self.assertIsInstance(color, tuple)
            self.assertEqual(len(color), 3)
            for component in color:
                self.assertIsInstance(component, int)
                self.assertGreaterEqual(component, 0)
                self.assertLessEqual(component, 255)
    
    def test_extract_colors_with_bytes(self):
        """Test color extraction with bytes input"""
        # Create test image
        test_image = self.create_test_image([(255, 0, 0), (0, 255, 0)])
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        test_image.save(img_bytes, format='PNG')
        img_bytes = img_bytes.getvalue()
        
        # Extract colors
        extracted_colors = self.extractor.extract_colors(img_bytes, n_colors=2)
        
        # Check results
        self.assertEqual(len(extracted_colors), 2)
    
    def test_get_color_percentages(self):
        """Test color extraction with percentages"""
        # Create test image with known colors
        test_colors = [(255, 0, 0), (0, 255, 0)]
        test_image = self.create_test_image(test_colors, size=(100, 100))
        
        # Extract colors with percentages
        color_percentages = self.extractor.get_color_percentages(test_image, n_colors=2)
        
        # Check that we got the right number of colors
        self.assertEqual(len(color_percentages), 2)
        
        # Check format
        for color_data in color_percentages:
            self.assertIsInstance(color_data, tuple)
            self.assertEqual(len(color_data), 2)
            
            color, percentage = color_data
            self.assertIsInstance(color, tuple)
            self.assertEqual(len(color), 3)
            self.assertIsInstance(percentage, float)
            self.assertGreaterEqual(percentage, 0)
            self.assertLessEqual(percentage, 100)
        
        # Check that percentages sum to approximately 100%
        total_percentage = sum(data[1] for data in color_percentages)
        self.assertAlmostEqual(total_percentage, 100.0, places=1)
    
    def test_rgb_to_hex(self):
        """Test RGB to hex conversion"""
        # Test known conversions
        self.assertEqual(ColorExtractor.rgb_to_hex((255, 0, 0)), "#ff0000")
        self.assertEqual(ColorExtractor.rgb_to_hex((0, 255, 0)), "#00ff00")
        self.assertEqual(ColorExtractor.rgb_to_hex((0, 0, 255)), "#0000ff")
        self.assertEqual(ColorExtractor.rgb_to_hex((255, 255, 255)), "#ffffff")
        self.assertEqual(ColorExtractor.rgb_to_hex((0, 0, 0)), "#000000")
    
    def test_hex_to_rgb(self):
        """Test hex to RGB conversion"""
        # Test known conversions
        self.assertEqual(ColorExtractor.hex_to_rgb("#ff0000"), (255, 0, 0))
        self.assertEqual(ColorExtractor.hex_to_rgb("#00ff00"), (0, 255, 0))
        self.assertEqual(ColorExtractor.hex_to_rgb("#0000ff"), (0, 0, 255))
        self.assertEqual(ColorExtractor.hex_to_rgb("#ffffff"), (255, 255, 255))
        self.assertEqual(ColorExtractor.hex_to_rgb("#000000"), (0, 0, 0))
        
        # Test without # prefix
        self.assertEqual(ColorExtractor.hex_to_rgb("ff0000"), (255, 0, 0))
    
    def test_invalid_input(self):
        """Test handling of invalid inputs"""
        # Test invalid image data
        with self.assertRaises(ValueError):
            self.extractor.extract_colors("invalid_data")

        # Test invalid n_colors (K-means requires at least 1 cluster)
        test_image = self.create_test_image([(255, 0, 0)])
        with self.assertRaises(Exception):  # Should raise an error for n_colors=0
            self.extractor.extract_colors(test_image, n_colors=0)
    
    def test_single_color_image(self):
        """Test extraction from single-color image"""
        # Create single-color image
        single_color_image = Image.new('RGB', (100, 100), (128, 64, 192))
        
        # Extract colors
        extracted_colors = self.extractor.extract_colors(single_color_image, n_colors=3)
        
        # Should get the single color (possibly with slight variations due to clustering)
        self.assertEqual(len(extracted_colors), 3)
        
        # All colors should be similar to the original
        for color in extracted_colors:
            # Allow some tolerance due to clustering
            self.assertAlmostEqual(color[0], 128, delta=10)
            self.assertAlmostEqual(color[1], 64, delta=10)
            self.assertAlmostEqual(color[2], 192, delta=10)


if __name__ == '__main__':
    # Run the tests
    unittest.main(verbosity=2)
