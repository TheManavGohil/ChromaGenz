"""
Text-to-Color Service using Groq's LLaMA model
Converts text descriptions to seed colors for palette generation
"""

import os
import re
import json
from typing import Optional, Dict, Any
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage


class TextToColorService:
    """
    Service to convert text descriptions to seed colors using Groq's LLaMA model
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the TextToColorService
        
        Args:
            api_key: Groq API key. If None, will try to get from environment variable GROQ_API_KEY
        """
        self.api_key = api_key or os.getenv('GROQ_API_KEY')
        if not self.api_key:
            raise ValueError("Groq API key is required. Set GROQ_API_KEY environment variable or pass api_key parameter.")
        
        # Initialize the Groq LLaMA model
        self.llm = ChatGroq(
            groq_api_key=self.api_key,
            model_name="llama-3.1-70b-versatile",  # Using LLaMA 3.1 70B model
            temperature=0.3,  # Low temperature for more consistent color extraction
            max_tokens=100,   # We only need a short response
        )
        
        # System prompt for color extraction
        self.system_prompt = """You are a professional color expert and designer. Your task is to analyze text descriptions and extract ONE primary seed color that best represents the theme, mood, or concept described.

IMPORTANT RULES:
1. Return ONLY a valid hexadecimal color code (e.g., #FF5733)
2. Do NOT include any explanation, reasoning, or additional text
3. The color should be the most representative primary color for the theme
4. Consider psychological associations, cultural meanings, and visual impact
5. Choose colors that work well as seed colors for palette generation

Examples:
- "tropical sunset" → #FF6B35 (warm orange)
- "ocean depths" → #1B4F72 (deep blue)
- "forest morning" → #27AE60 (fresh green)
- "elegant luxury" → #8E44AD (rich purple)
- "energetic fitness" → #E74C3C (vibrant red)
- "calm meditation" → #3498DB (serene blue)
- "autumn leaves" → #D35400 (burnt orange)
- "minimalist modern" → #34495E (sophisticated gray-blue)

Respond with ONLY the hex color code, nothing else."""

    def extract_seed_color(self, text_description: str) -> str:
        """
        Extract a seed color from text description using LLaMA
        
        Args:
            text_description: Text description of the desired color theme
            
        Returns:
            Hexadecimal color code (e.g., "#FF5733")
            
        Raises:
            ValueError: If unable to extract a valid color
            Exception: If API call fails
        """
        try:
            # Create messages for the LLM
            messages = [
                SystemMessage(content=self.system_prompt),
                HumanMessage(content=f"Extract the primary seed color for: {text_description}")
            ]
            
            # Get response from LLaMA
            response = self.llm(messages)
            color_response = response.content.strip()
            
            # Extract hex color from response
            hex_color = self._extract_hex_color(color_response)
            
            if not hex_color:
                # Fallback: try to get any color mentioned in the response
                hex_color = self._fallback_color_extraction(text_description)
            
            return hex_color
            
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            # Fallback to predefined color mapping
            return self._fallback_color_extraction(text_description)
    
    def _extract_hex_color(self, response: str) -> Optional[str]:
        """
        Extract hex color code from LLM response
        
        Args:
            response: Raw response from LLM
            
        Returns:
            Hex color code if found, None otherwise
        """
        # Look for hex color pattern
        hex_pattern = r'#[0-9A-Fa-f]{6}'
        matches = re.findall(hex_pattern, response)
        
        if matches:
            return matches[0].upper()
        
        # Look for hex color without #
        hex_pattern_no_hash = r'\b[0-9A-Fa-f]{6}\b'
        matches = re.findall(hex_pattern_no_hash, response)
        
        if matches:
            return f"#{matches[0].upper()}"
        
        return None
    
    def _fallback_color_extraction(self, text_description: str) -> str:
        """
        Fallback method using predefined color mappings
        
        Args:
            text_description: Text description
            
        Returns:
            Hex color code
        """
        text_lower = text_description.lower()
        
        # Predefined color mappings for common themes
        color_mappings = {
            # Nature themes
            'ocean': '#1B4F72', 'sea': '#1B4F72', 'water': '#3498DB', 'blue': '#3498DB',
            'forest': '#27AE60', 'green': '#27AE60', 'nature': '#27AE60', 'plant': '#27AE60',
            'sunset': '#FF6B35', 'sunrise': '#FF6B35', 'orange': '#FF6B35',
            'fire': '#E74C3C', 'red': '#E74C3C', 'passion': '#E74C3C',
            'sky': '#87CEEB', 'cloud': '#F0F8FF',
            
            # Mood themes
            'calm': '#3498DB', 'peaceful': '#3498DB', 'serene': '#3498DB',
            'energetic': '#E74C3C', 'vibrant': '#E74C3C', 'dynamic': '#E74C3C',
            'elegant': '#8E44AD', 'luxury': '#8E44AD', 'sophisticated': '#8E44AD',
            'warm': '#FF6B35', 'cozy': '#FF6B35', 'comfort': '#FF6B35',
            'cool': '#3498DB', 'fresh': '#3498DB', 'crisp': '#3498DB',
            
            # Seasonal themes
            'spring': '#27AE60', 'summer': '#F1C40F', 'autumn': '#D35400', 'winter': '#85C1E9',
            
            # Style themes
            'modern': '#34495E', 'minimalist': '#34495E', 'contemporary': '#34495E',
            'vintage': '#8E44AD', 'retro': '#8E44AD', 'classic': '#8E44AD',
            'industrial': '#7F8C8D', 'urban': '#7F8C8D',
            
            # Business themes
            'corporate': '#2C3E50', 'professional': '#2C3E50', 'business': '#2C3E50',
            'tech': '#3498DB', 'technology': '#3498DB', 'digital': '#3498DB',
            'finance': '#27AE60', 'money': '#27AE60', 'success': '#27AE60',
            
            # Emotion themes
            'happy': '#F1C40F', 'joy': '#F1C40F', 'cheerful': '#F1C40F',
            'sad': '#3498DB', 'melancholy': '#3498DB',
            'angry': '#E74C3C', 'intense': '#E74C3C',
            'mysterious': '#8E44AD', 'dark': '#2C3E50',
        }
        
        # Find matching keywords
        for keyword, color in color_mappings.items():
            if keyword in text_lower:
                return color
        
        # Default fallback color (neutral blue)
        return '#3498DB'
    
    def generate_palette_from_text(self, text_description: str, palette_mode: str = 'smart', num_colors: int = 5) -> Dict[str, Any]:
        """
        Generate a complete color palette from text description
        
        Args:
            text_description: Text description of desired theme
            palette_mode: Palette generation mode ('smart', 'analogous', 'complementary', etc.)
            num_colors: Number of colors in the palette
            
        Returns:
            Dictionary containing seed color and generated palette
        """
        from generate_color import generate_smart_palette, generate_palette
        
        # Extract seed color
        seed_color = self.extract_seed_color(text_description)
        
        # Generate palette based on mode
        if palette_mode == 'smart':
            palette = generate_smart_palette(seed_color, num_colors)
        else:
            palette = generate_palette(seed_color, palette_mode, num_colors)
        
        return {
            'text_description': text_description,
            'seed_color': seed_color,
            'palette': palette,
            'palette_mode': palette_mode,
            'num_colors': len(palette)
        }


# Example usage and testing
if __name__ == '__main__':
    # Test the service (requires GROQ_API_KEY environment variable)
    try:
        service = TextToColorService()
        
        test_descriptions = [
            "tropical sunset beach vacation",
            "elegant luxury brand for jewelry",
            "energetic fitness app for young athletes",
            "calm meditation and wellness center",
            "modern tech startup with innovation focus"
        ]
        
        print("🎨 Text-to-Color Service Test")
        print("=" * 50)
        
        for description in test_descriptions:
            try:
                result = service.generate_palette_from_text(description)
                print(f"\n📝 Description: {description}")
                print(f"🎯 Seed Color: {result['seed_color']}")
                print(f"🎨 Palette: {', '.join(result['palette'])}")
            except Exception as e:
                print(f"❌ Error processing '{description}': {e}")
                
    except ValueError as e:
        print(f"❌ Setup Error: {e}")
        print("💡 Please set your GROQ_API_KEY environment variable")
