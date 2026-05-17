import os
import sys
from pathlib import Path
from google import genai
from google.genai import types

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not set")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    prompt = "Soft editorial photograph of a simple kitchen counter with a glass of water, a small bowl of fresh fruit, and morning light streaming through a window. Warm tones, shallow depth of field, no pills, no supplements, no bottles, no people, no text. Modern lifestyle editorial style, 16:10 aspect ratio"

    output_dir = Path("public/blog/glp1-supplements-nutrient-gaps")
    output_dir.mkdir(parents=True, exist_ok=True)

    for i in range(1, 3):
        output_path = output_dir / f"hero-{i}.png"
        print(f"Generating image {i}/2...")

        try:
            response = client.models.generate_content(
                model="gemini-3.1-flash-image-preview",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio="16:9" # Using 16:9 as a fallback if 16:10 is not supported
                    )
                )
            )
            
            image_data = None
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    if part.inline_data.mime_type.startswith('image/'):
                        image_data = part.inline_data.data
                        break
            
            if image_data:
                output_path.write_bytes(image_data)
                print(f"Saved image to: {output_path}")
                print(f"MEDIA: {output_path.absolute()}")
            else:
                print(f"No image generated for variant {i}.")
                
        except Exception as e:
            print(f"Error generating image {i}: {e}")

if __name__ == "__main__":
    main()
