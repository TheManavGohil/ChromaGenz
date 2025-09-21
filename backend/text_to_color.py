"""
Text-to-Color Service using Groq's model
Converts text descriptions to seed colors for palette generation
"""

import os
import re
import json
from typing import Optional, Dict, Any, List
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


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
        
        # Initialize the Groq model
        self.llm = ChatGroq(
            groq_api_key=self.api_key,
            model_name="openai/gpt-oss-120b",  # Using openai/gpt-oss-120b model
            temperature=0.7,  # temperature for creativity color extraction
            max_tokens=150,   # Increased for more detailed responses
        )

        # Initialize a separate LLM instance for explanations with higher token limit
        self.explanation_llm = ChatGroq(
            groq_api_key=self.api_key,
            model_name="openai/gpt-oss-120b",
            temperature=0.8,  # Higher temperature for more creative explanations
            max_tokens=500,   # More tokens for detailed explanations
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

    def evolve_palette(self, current_palette: List[str], user_feedback: str, target_mood: Optional[str] = None) -> Dict[str, Any]:
        """
        Evolve an existing color palette based on user feedback using AI

        Args:
            current_palette: List of hex color codes in the current palette
            user_feedback: User's feedback on how to modify the palette
            target_mood: Optional target mood/theme for the evolution

        Returns:
            Dictionary containing the evolved palette and explanation
        """
        try:
            # Create system prompt for palette evolution
            evolution_prompt = """You are an expert color designer. Modify the given color palette based on user feedback.

Return ONLY a valid JSON object with this exact structure:
{
  "evolved_palette": ["#RRGGBB", "#RRGGBB", "#RRGGBB"],
  "changes_made": "Brief description",
  "reasoning": "Brief explanation"
}

Rules:
- Use only valid 6-digit hex colors with # prefix
- Keep the same number of colors as input
- Make changes that address the user feedback
- Ensure colors work well together

Example response:
{
  "evolved_palette": ["#FF5733", "#33FF57", "#3357FF"],
  "changes_made": "Increased saturation",
  "reasoning": "More vibrant colors for energy"
}"""

            # Prepare the user message
            palette_str = ", ".join(current_palette)
            mood_context = f" Target mood: {target_mood}." if target_mood else ""

            user_message = f"""Current palette: {palette_str}
User feedback: {user_feedback}{mood_context}

Please evolve this palette based on the feedback."""

            # Create messages for the LLM
            messages = [
                SystemMessage(content=evolution_prompt),
                HumanMessage(content=user_message)
            ]

            # Get response from the model
            response = self.llm(messages)
            response_content = response.content.strip()

            # Try to parse JSON response
            try:
                # Clean and extract JSON from response
                cleaned_response = self._extract_and_clean_json(response_content)
                result = json.loads(cleaned_response)

                # Validate the response structure
                if 'evolved_palette' not in result:
                    raise ValueError("Missing evolved_palette in response")

                # Validate hex colors
                evolved_palette = []
                for color in result['evolved_palette']:
                    if re.match(r'^#[0-9A-Fa-f]{6}$', color):
                        evolved_palette.append(color.upper())
                    else:
                        # Try to fix common issues
                        if not color.startswith('#'):
                            color = '#' + color
                        if re.match(r'^#[0-9A-Fa-f]{6}$', color):
                            evolved_palette.append(color.upper())

                if not evolved_palette:
                    raise ValueError("No valid colors in evolved palette")

                return {
                    'success': True,
                    'original_palette': current_palette,
                    'evolved_palette': evolved_palette,
                    'user_feedback': user_feedback,
                    'changes_made': result.get('changes_made', 'Palette evolved based on feedback'),
                    'reasoning': result.get('reasoning', 'Colors adjusted to better match requirements'),
                    'method': 'ai_evolution'
                }

            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing evolution response: {e}")
                # Fallback to rule-based evolution
                return self._fallback_palette_evolution(current_palette, user_feedback)

        except Exception as e:
            print(f"Error in palette evolution: {e}")
            # Fallback to rule-based evolution
            return self._fallback_palette_evolution(current_palette, user_feedback)

    def _fallback_palette_evolution(self, current_palette: List[str], user_feedback: str) -> Dict[str, Any]:
        """
        Fallback method for palette evolution using rule-based approach
        """
        from generate_color import generate_smart_palette
        import colorsys

        feedback_lower = user_feedback.lower()
        evolved_palette = current_palette.copy()
        changes_made = []

        # Rule-based modifications based on common feedback patterns
        if any(word in feedback_lower for word in ['brighter', 'lighter', 'more vibrant']):
            # Increase brightness/saturation
            evolved_palette = self._adjust_palette_brightness(current_palette, increase=True)
            changes_made.append("Increased brightness and vibrancy")

        elif any(word in feedback_lower for word in ['darker', 'muted', 'subtle']):
            # Decrease brightness/saturation
            evolved_palette = self._adjust_palette_brightness(current_palette, increase=False)
            changes_made.append("Made colors more muted and subtle")

        elif any(word in feedback_lower for word in ['warmer', 'warm']):
            # Shift towards warmer colors
            evolved_palette = self._shift_palette_temperature(current_palette, warmer=True)
            changes_made.append("Shifted palette towards warmer tones")

        elif any(word in feedback_lower for word in ['cooler', 'cool']):
            # Shift towards cooler colors
            evolved_palette = self._shift_palette_temperature(current_palette, warmer=False)
            changes_made.append("Shifted palette towards cooler tones")

        elif any(word in feedback_lower for word in ['more contrast', 'contrast']):
            # Increase contrast by regenerating with different harmony
            if len(current_palette) > 0:
                evolved_palette = generate_smart_palette(current_palette[0], len(current_palette))
            changes_made.append("Increased color contrast")

        return {
            'success': True,
            'original_palette': current_palette,
            'evolved_palette': evolved_palette,
            'user_feedback': user_feedback,
            'changes_made': ', '.join(changes_made) if changes_made else 'Applied general improvements',
            'reasoning': 'Used rule-based evolution algorithm',
            'method': 'fallback_evolution'
        }

    def _adjust_palette_brightness(self, palette: List[str], increase: bool = True) -> List[str]:
        """
        Adjust the brightness/saturation of a color palette
        """
        import colorsys

        adjusted_palette = []
        factor = 1.2 if increase else 0.8

        for hex_color in palette:
            # Convert hex to RGB
            hex_clean = hex_color.lstrip('#')
            r, g, b = [int(hex_clean[i:i+2], 16) / 255.0 for i in (0, 2, 4)]

            # Convert to HSV
            h, s, v = colorsys.rgb_to_hsv(r, g, b)

            # Adjust saturation and value
            s = min(1.0, max(0.0, s * factor))
            v = min(1.0, max(0.0, v * factor))

            # Convert back to RGB and hex
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            hex_adjusted = f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}".upper()
            adjusted_palette.append(hex_adjusted)

        return adjusted_palette

    def _shift_palette_temperature(self, palette: List[str], warmer: bool = True) -> List[str]:
        """
        Shift the color temperature of a palette (warmer or cooler)
        """
        import colorsys

        shifted_palette = []
        hue_shift = 0.05 if warmer else -0.05  # Shift towards red/orange or blue

        for hex_color in palette:
            # Convert hex to RGB
            hex_clean = hex_color.lstrip('#')
            r, g, b = [int(hex_clean[i:i+2], 16) / 255.0 for i in (0, 2, 4)]

            # Convert to HSV
            h, s, v = colorsys.rgb_to_hsv(r, g, b)

            # Shift hue
            h = (h + hue_shift) % 1.0

            # Convert back to RGB and hex
            r, g, b = colorsys.hsv_to_rgb(h, s, v)
            hex_shifted = f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}".upper()
            shifted_palette.append(hex_shifted)

        return shifted_palette

    def explain_colors(self, palette: List[str], context: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate AI-powered explanations for colors in a palette

        Args:
            palette: List of hex color codes to explain
            context: Optional context about the palette's intended use

        Returns:
            Dictionary containing explanations for each color and overall palette analysis
        """
        try:
            # Create system prompt for color explanation
            explanation_prompt = """You are a color expert. Analyze the given color palette and provide explanations.

Return ONLY a valid JSON object with this exact structure:
{
  "palette_analysis": {
    "overall_mood": "Brief mood description",
    "harmony_type": "Color harmony type",
    "applications": ["App1", "App2", "App3"],
    "user_experience": "UX impact description"
  },
  "color_explanations": [
    {
      "color": "#RRGGBB",
      "name": "Color name",
      "psychology": "Psychological impact",
      "cultural": "Cultural meaning",
      "design_use": "Design application",
      "emotion": "Emotional effect"
    }
  ]
}

Keep descriptions concise and professional. Ensure valid JSON format."""

            # Prepare the user message
            palette_str = ", ".join(palette)
            context_str = f" Context: {context}" if context else ""

            user_message = f"""Please analyze and explain this color palette: {palette_str}{context_str}

Provide detailed explanations for each color and overall palette analysis."""

            # Create messages for the LLM
            messages = [
                SystemMessage(content=explanation_prompt),
                HumanMessage(content=user_message)
            ]

            # Get response from the explanation model
            response = self.explanation_llm(messages)
            response_content = response.content.strip()

            # Try to parse JSON response
            try:
                # Clean and extract JSON from response
                cleaned_response = self._extract_and_clean_json(response_content)
                result = json.loads(cleaned_response)

                # Validate the response structure
                if 'palette_analysis' not in result or 'color_explanations' not in result:
                    raise ValueError("Invalid response structure")

                return {
                    'success': True,
                    'palette': palette,
                    'context': context,
                    'palette_analysis': result['palette_analysis'],
                    'color_explanations': result['color_explanations'],
                    'method': 'ai_explanation'
                }

            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing explanation response: {e}")
                # Fallback to basic explanations
                return self._fallback_color_explanation(palette, context)

        except Exception as e:
            print(f"Error in color explanation: {e}")
            # Fallback to basic explanations
            return self._fallback_color_explanation(palette, context)

    def _fallback_color_explanation(self, palette: List[str], context: Optional[str] = None) -> Dict[str, Any]:
        """
        Fallback method for color explanation using predefined knowledge
        """
        color_knowledge = {
            # Red family
            'red': {
                'psychology': 'Energy, passion, urgency, excitement',
                'cultural': 'Love, danger, power, celebration',
                'design_use': 'Call-to-action buttons, alerts, branding',
                'emotion': 'Stimulating, attention-grabbing'
            },
            # Blue family
            'blue': {
                'psychology': 'Trust, stability, calm, professionalism',
                'cultural': 'Peace, loyalty, wisdom, technology',
                'design_use': 'Corporate branding, healthcare, finance',
                'emotion': 'Calming, trustworthy'
            },
            # Green family
            'green': {
                'psychology': 'Growth, nature, harmony, freshness',
                'cultural': 'Money, environment, health, luck',
                'design_use': 'Eco-friendly brands, health, finance',
                'emotion': 'Refreshing, balanced'
            },
            # Add more color families as needed
        }

        explanations = []
        for hex_color in palette:
            # Simple color classification based on hue
            color_name = self._classify_color(hex_color)
            knowledge = color_knowledge.get(color_name, {
                'psychology': 'Unique psychological impact',
                'cultural': 'Varied cultural associations',
                'design_use': 'Versatile design applications',
                'emotion': 'Distinctive emotional response'
            })

            explanations.append({
                'color': hex_color,
                'name': color_name.title(),
                'psychology': knowledge['psychology'],
                'cultural': knowledge['cultural'],
                'design_use': knowledge['design_use'],
                'emotion': knowledge['emotion']
            })

        return {
            'success': True,
            'palette': palette,
            'context': context,
            'palette_analysis': {
                'overall_mood': 'Harmonious and balanced',
                'harmony_type': 'Complementary color scheme',
                'applications': ['Web design', 'Branding', 'Print media'],
                'user_experience': 'Creates visual interest while maintaining readability'
            },
            'color_explanations': explanations,
            'method': 'fallback_explanation'
        }

    def _classify_color(self, hex_color: str) -> str:
        """
        Classify a hex color into basic color families
        """
        import colorsys

        # Convert hex to RGB
        hex_clean = hex_color.lstrip('#')
        r, g, b = [int(hex_clean[i:i+2], 16) / 255.0 for i in (0, 2, 4)]

        # Convert to HSV
        h, s, v = colorsys.rgb_to_hsv(r, g, b)

        # Classify based on hue
        hue_degrees = h * 360

        if s < 0.2:  # Low saturation
            if v > 0.8:
                return 'white'
            elif v < 0.2:
                return 'black'
            else:
                return 'gray'

        # Color classification based on hue
        if hue_degrees < 15 or hue_degrees >= 345:
            return 'red'
        elif 15 <= hue_degrees < 45:
            return 'orange'
        elif 45 <= hue_degrees < 75:
            return 'yellow'
        elif 75 <= hue_degrees < 165:
            return 'green'
        elif 165 <= hue_degrees < 195:
            return 'cyan'
        elif 195 <= hue_degrees < 255:
            return 'blue'
        elif 255 <= hue_degrees < 285:
            return 'purple'
        else:  # 285 <= hue_degrees < 345
            return 'magenta'

    def _extract_and_clean_json(self, response_content: str) -> str:
        """
        Extract and clean JSON from LLM response
        """
        # Remove markdown code blocks
        if "```json" in response_content:
            json_start = response_content.find("```json") + 7
            json_end = response_content.find("```", json_start)
            if json_end != -1:
                response_content = response_content[json_start:json_end].strip()
        elif "```" in response_content:
            json_start = response_content.find("```") + 3
            json_end = response_content.rfind("```")
            if json_end != -1:
                response_content = response_content[json_start:json_end].strip()

        # Find JSON object boundaries
        start_brace = response_content.find('{')
        if start_brace == -1:
            raise ValueError("No JSON object found")

        # Find the matching closing brace
        brace_count = 0
        end_brace = -1
        for i in range(start_brace, len(response_content)):
            if response_content[i] == '{':
                brace_count += 1
            elif response_content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_brace = i
                    break

        if end_brace == -1:
            raise ValueError("Incomplete JSON object")

        json_str = response_content[start_brace:end_brace + 1]

        # Basic cleanup
        json_str = json_str.replace('\n', ' ').replace('\r', ' ')
        json_str = re.sub(r'\s+', ' ', json_str)  # Normalize whitespace

        return json_str


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
