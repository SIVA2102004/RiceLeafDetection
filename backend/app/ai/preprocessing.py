import io
import numpy as np
from PIL import Image, ImageStat
from typing import Tuple

def validate_image_quality(image_bytes: bytes) -> Tuple[bool, bool, str, float, float]:
    """
    Validates uploaded image quality:
    - Verifies image is readable by PIL
    - Calculates brightness: flag if extremely dark (< 30) or bright (> 240)
    - Estimates sharpness via Laplacian-like variance
    - Detects dominant color presence (green/yellow/brown hues) to check if plant foliage
    Returns: (is_valid, is_rice_plant, message, brightness_score, sharpness_score)
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return False, False, "Corrupted or unsupported image file. Please upload a valid JPG, PNG, or WebP photo.", 0.0, 0.0

    width, height = image.size
    if width < 50 or height < 50:
        return False, False, "Image resolution is too low. Please provide a clear image of the rice leaf.", 0.0, 0.0

    # Brightness check
    stat = ImageStat.Stat(image)
    r, g, b = stat.mean[:3]
    brightness = (r + g + b) / 3.0

    if brightness < 20.0:
        return False, False, "The image appears too dark. Please take a photo of the rice leaf under daylight or sufficient illumination.", brightness, 0.0
    if brightness > 245.0:
        return False, False, "The image appears excessively bright or washed out. Please avoid direct intense glare or camera flash flare.", brightness, 0.0

    # Sharpness / Blur check via 2D gradient on grayscale image
    gray = image.convert("L")
    arr = np.array(gray, dtype=np.float32)
    laplacian = (
        -4 * arr[1:-1, 1:-1]
        + arr[:-2, 1:-1]
        + arr[2:, 1:-1]
        + arr[1:-1, :-2]
        + arr[1:-1, 2:]
    )
    sharpness = float(np.var(laplacian))

    # In PIL HSV: Hue for green/yellow is mapped to 0-255
    hsv_image = image.convert("HSV")
    hsv_arr = np.array(hsv_image)
    h = hsv_arr[:, :, 0]
    s = hsv_arr[:, :, 1]
    
    # Vegetation hue in PIL HSV: (15 to 135 out of 255) with moderate saturation
    vegetation_mask = ((h >= 15) & (h <= 135) & (s >= 15))
    vegetation_ratio = float(np.sum(vegetation_mask) / (width * height))

    # If it has strong vegetation ratio, allow it even with lower sharpness (e.g. smooth leaf surface)
    if sharpness < 5.0 and vegetation_ratio < 0.20:
        return False, False, "The image appears too blurry. Please steady your camera and ensure the leaf surface is sharply focused.", brightness, sharpness

    is_rice_plant = vegetation_ratio >= 0.10

    if not is_rice_plant:
        return True, False, "This image does not appear to contain a rice leaf or crop foliage. Please capture a clear photo of the rice plant.", brightness, sharpness

    return True, True, "Image passed quality and foliage validation.", brightness, sharpness
