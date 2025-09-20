"""
Color Extractor Module using K-Means Clustering
Extracts dominant colors from images using scikit-learn's KMeans algorithm
"""

import numpy as np
from PIL import Image
from sklearn.cluster import KMeans
from typing import List, Tuple, Union
import io


class ColorExtractor:
    """
    A class to extract dominant colors from images using K-means clustering.
    """
    
    def __init__(self, max_size: Tuple[int, int] = (500, 500)):
        """
        Initialize the ColorExtractor.
        
        Args:
            max_size: Maximum size to resize images to for processing (width, height)
        """
        self.max_size = max_size
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess the image by resizing and converting to RGB.
        
        Args:
            image: PIL Image object
            
        Returns:
            Preprocessed PIL Image object
        """
        # Convert to RGB if not already
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image to manageable size while maintaining aspect ratio
        image.thumbnail(self.max_size, Image.Resampling.LANCZOS)
        
        return image
    
    def image_to_rgb_array(self, image: Image.Image) -> np.ndarray:
        """
        Convert PIL Image to numpy array of RGB values.
        
        Args:
            image: PIL Image object
            
        Returns:
            Numpy array of shape (n_pixels, 3) containing RGB values
        """
        # Convert image to numpy array
        img_array = np.array(image)
        
        # Reshape to (n_pixels, 3) for RGB values
        rgb_array = img_array.reshape(-1, 3)
        
        return rgb_array
    
    def extract_colors(self, image_data: Union[bytes, Image.Image], n_colors: int = 5) -> List[Tuple[int, int, int]]:
        """
        Extract dominant colors from an image using K-means clustering.

        Args:
            image_data: Either bytes of image data or PIL Image object
            n_colors: Number of dominant colors to extract

        Returns:
            List of RGB tuples representing dominant colors
        """
        # Validate n_colors
        if n_colors < 1:
            raise ValueError("n_colors must be at least 1")

        # Handle different input types
        if isinstance(image_data, bytes):
            image = Image.open(io.BytesIO(image_data))
        elif isinstance(image_data, Image.Image):
            image = image_data
        else:
            raise ValueError("image_data must be bytes or PIL Image object")
        
        # Preprocess the image
        processed_image = self.preprocess_image(image)
        
        # Convert to RGB array
        rgb_array = self.image_to_rgb_array(processed_image)
        
        # Apply K-means clustering
        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
        kmeans.fit(rgb_array)
        
        # Get cluster centers (dominant colors)
        colors = kmeans.cluster_centers_
        
        # Convert to integers and return as list of tuples
        dominant_colors = [tuple(map(int, color)) for color in colors]
        
        return dominant_colors
    
    def get_color_percentages(self, image_data: Union[bytes, Image.Image], n_colors: int = 5) -> List[Tuple[Tuple[int, int, int], float]]:
        """
        Extract dominant colors with their percentage representation in the image.

        Args:
            image_data: Either bytes of image data or PIL Image object
            n_colors: Number of dominant colors to extract

        Returns:
            List of tuples containing (RGB color, percentage)
        """
        # Validate n_colors
        if n_colors < 1:
            raise ValueError("n_colors must be at least 1")

        # Handle different input types
        if isinstance(image_data, bytes):
            image = Image.open(io.BytesIO(image_data))
        elif isinstance(image_data, Image.Image):
            image = image_data
        else:
            raise ValueError("image_data must be bytes or PIL Image object")
        
        # Preprocess the image
        processed_image = self.preprocess_image(image)
        
        # Convert to RGB array
        rgb_array = self.image_to_rgb_array(processed_image)
        
        # Apply K-means clustering
        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
        labels = kmeans.fit_predict(rgb_array)
        
        # Get cluster centers (dominant colors)
        colors = kmeans.cluster_centers_
        
        # Calculate percentages
        _, counts = np.unique(labels, return_counts=True)
        total_pixels = len(labels)
        percentages = (counts / total_pixels) * 100
        
        # Combine colors with percentages and sort by percentage (descending)
        color_percentages = []
        for color, percentage in zip(colors, percentages):
            rgb_color = tuple(map(int, color))
            color_percentages.append((rgb_color, round(percentage, 2)))
        
        # Sort by percentage (descending)
        color_percentages.sort(key=lambda x: x[1], reverse=True)
        
        return color_percentages
    
    @staticmethod
    def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
        """
        Convert RGB tuple to hexadecimal color code.
        
        Args:
            rgb: RGB tuple (r, g, b)
            
        Returns:
            Hexadecimal color code string
        """
        return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
    
    @staticmethod
    def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
        """
        Convert hexadecimal color code to RGB tuple.
        
        Args:
            hex_color: Hexadecimal color code string (with or without #)
            
        Returns:
            RGB tuple (r, g, b)
        """
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
