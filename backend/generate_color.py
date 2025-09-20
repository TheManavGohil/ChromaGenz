"""
this file is used to generate color palettes from a seed color.
"""
import colorsys
import random

def hex_to_rgb(hex_color: str) -> tuple:
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def rgb_to_hex(rgb_color: tuple) -> str:
    r, g, b = [int(c * 255) for c in rgb_color]
    return f'#{r:02x}{g:02x}{b:02x}'

def generate_palette(seed_hex: str, mode: str, num_colors: int = 5, randomness_factor: float = 0.05) -> list[str]:
    r, g, b = hex_to_rgb(seed_hex)
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    generated_hues = [h]
    if mode == 'analogous':
        step = 30.0 / 360.0
        for i in range(1, num_colors): generated_hues.append((h + i * step) % 1.0)
    elif mode == 'split_complementary':
        complement_hue = (h + 0.5) % 1.0
        generated_hues.append((complement_hue - 30.0 / 360.0) % 1.0)
        generated_hues.append((complement_hue + 30.0 / 360.0) % 1.0)
    elif mode == 'triadic':
        step = 120.0 / 360.0
        for i in range(1, 3): generated_hues.append((h + i * step) % 1.0)
    elif mode == 'tetradic':
        generated_hues.append((h + 60.0 / 360.0) % 1.0)
        generated_hues.append((h + 180.0 / 360.0) % 1.0)
        generated_hues.append((h + 240.0 / 360.0) % 1.0)
    while len(generated_hues) < num_colors:
        generated_hues.append((generated_hues[-1] + 30.0/360.0) % 1.0)
    palette = []
    for hue in generated_hues[:num_colors]:
        new_s = max(0.4, min(1.0, s + random.uniform(-randomness_factor, randomness_factor)))
        new_v = max(0.5, min(1.0, v + random.uniform(-randomness_factor, randomness_factor)))
        r_new, g_new, b_new = colorsys.hsv_to_rgb(hue, new_s, new_v)
        palette.append(rgb_to_hex((r_new, g_new, b_new)))
    return palette


# === THE NEW "SMART" GENERATOR ===
def generate_smart_palette(seed_hex: str, n: int = 5) -> list[str]:
    """
    Generates a large pool of colors and intelligently selects the best n.
    """
    # 1. Generate the Pool
    # Create colors from all harmony rules
    analogous_colors = generate_palette(seed_hex, mode='analogous', num_colors=5)
    split_comp_colors = generate_palette(seed_hex, mode='split_complementary', num_colors=3)
    tetradic_colors = generate_palette(seed_hex, mode='tetradic', num_colors=4)
    triadic_colors = generate_palette(seed_hex, mode='triadic', num_colors=3)
    
    # Combine all generated colors into a tagged pool
    # We use a dictionary to automatically handle duplicate colors
    color_pool = {}
    for color in analogous_colors: color_pool[color] = 'analogous'
    for color in split_comp_colors: color_pool[color] = 'split_complementary'
    for color in tetradic_colors: color_pool[color] = 'tetradic'
    for color in triadic_colors: color_pool[color] = 'triadic'

    # The seed color is not in the pool, it's our starting point
    if seed_hex in color_pool:
        del color_pool[seed_hex]

    # 2. Score Every Color
    # Define the base score for each harmony rule
    base_weights = {
        'analogous': 5.0,
        'split_complementary': 3.0,
        'tetradic': 1.0,
        'triadic': 1.0
    }
    
    scored_colors = []
    for color, rule in color_pool.items():
        # Add a random bonus to the base score
        randomized_score = base_weights.get(rule, 1.0) + random.random()
        scored_colors.append((color, randomized_score))
        
    # 3. Select with Weighted Randomness
    # Sort the colors by their randomized score in descending order
    scored_colors.sort(key=lambda x: x[1], reverse=True)
    
    # The final palette starts with the user's seed color
    final_palette = [seed_hex]
    
    # Add the top n-1 colors from the sorted list
    for color, score in scored_colors:
        if len(final_palette) < n:
            final_palette.append(color)
            
    return final_palette
    