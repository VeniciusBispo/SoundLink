/**
 * Utilities for client-side image processing.
 */

/**
 * Compresses a Data URL image to fit within a maximum character limit.
 * Uses a canvas to downscale and re-encode as JPEG with variable quality.
 */
export async function compressImage(
  dataUrl: string, 
  maxChars: number = 2000000, 
  initialQuality: number = 0.8
): Promise<string> {
  if (dataUrl.length <= maxChars) return dataUrl;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Initial downscale if very large
      const maxDimension = 1200;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const attemptCompression = (q: number, scale: number): string => {
        canvas.width = width * scale;
        canvas.height = height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', q);
      };

      let quality = initialQuality;
      let scale = 1.0;
      let result = attemptCompression(quality, scale);

      // Iteratively reduce quality then scale until it fits
      while (result.length > maxChars && quality > 0.3) {
        quality -= 0.1;
        result = attemptCompression(quality, scale);
      }

      while (result.length > maxChars && scale > 0.2) {
        scale -= 0.1;
        result = attemptCompression(quality, scale);
      }

      resolve(result);
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
  });
}
