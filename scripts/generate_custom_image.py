import os
import sys
import argparse
from pathlib import Path
from google import genai
from google.genai import types

def main():
    parser = argparse.ArgumentParser(description="Generate an image using Gemini API")
    parser.add_argument("--prompt", required=True, help="The prompt for image generation")
    parser.add_argument("--filename", required=True, help="The output filename")
    parser.add_argument("--model", default="gemini-3.1-flash-image-preview", help="The model to use")
    parser.add_argument("--aspect_ratio", default="16:9", help="Aspect ratio (e.g., 16:9, 1:1)")
    
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not set")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    output_path = Path(args.filename)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Generating image with model {args.model} and prompt: {args.prompt}")

    try:
        response = client.models.generate_content(
            model=args.model,
            contents=args.prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
                image_config=types.ImageConfig(
                    aspect_ratio=args.aspect_ratio
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
            print(f"No image generated.")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error generating image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
