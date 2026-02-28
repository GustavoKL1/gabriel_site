from PIL import Image
import os

input_path = 'app/public/images/hero-bg.jpg'
output_dir = 'app/public/images'

img = Image.open(input_path)
width, height = img.size

# Resize to 640w
wpercent = (640 / float(width))
hsize = int((float(height) * float(wpercent)))
img_640 = img.resize((640, hsize), Image.Resampling.LANCZOS)
img_640.save(os.path.join(output_dir, 'hero-bg-640.jpg'), optimize=True, quality=85)

# Resize to 1024w
wpercent = (1024 / float(width))
hsize = int((float(height) * float(wpercent)))
img_1024 = img.resize((1024, hsize), Image.Resampling.LANCZOS)
img_1024.save(os.path.join(output_dir, 'hero-bg-1024.jpg'), optimize=True, quality=85)

print("Images resized successfully.")
