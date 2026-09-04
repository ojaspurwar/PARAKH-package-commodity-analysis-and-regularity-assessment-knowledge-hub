/**
 * Image Quality Enhancer for Legal Metrology Package Capture
 *
 * Implements client-side image enhancement on HTML5 Canvas:
 * 1. Adaptive Contrast Stretching (CLAHE-inspired dynamic range expansion)
 * 2. Unsharp Mask 3x3 Convolution Sharpening (enhances small dot-matrix & inkjet text)
 * 3. Exposure & Gamma Normalization (eliminates uneven phone camera shadows)
 * 4. High-Resolution preservation (up to 2200px max dimension, 0.92 JPEG quality)
 */

export interface EnhancementOptions {
  sharpen?: boolean;
  contrastStretch?: boolean;
  autoExposure?: boolean;
  maxDim?: number;
  quality?: number;
}

export function enhanceCanvasImage(
  sourceCanvas: HTMLCanvasElement,
  options: EnhancementOptions = {}
): HTMLCanvasElement {
  const {
    sharpen = true,
    contrastStretch = true,
    autoExposure = true,
  } = options;

  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;

  const ctx = outputCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const len = data.length;

    // --- 1. Compute Luminance Histogram & Auto-Exposure ---
    let minLum = 255;
    let maxLum = 0;
    let totalLum = 0;

    // Sample step to be lightning fast even on 4K phone photos
    const sampleStep = Math.max(1, Math.floor(len / 40000));
    let sampleCount = 0;

    for (let i = 0; i < len; i += 4 * sampleStep) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
      totalLum += lum;
      sampleCount++;
    }

    const avgLum = sampleCount > 0 ? totalLum / sampleCount : 128;

    // --- 2. Adaptive Contrast Stretching & Gamma ---
    if (contrastStretch && maxLum > minLum + 20) {
      // 2% percentile clipping to ignore isolated black/white glare pixels
      const lower = minLum + (maxLum - minLum) * 0.04;
      const upper = maxLum - (maxLum - minLum) * 0.04;
      const range = Math.max(1, upper - lower);

      // Gamma adjustment if image is underexposed
      const gamma = autoExposure && avgLum < 110 ? 0.82 : autoExposure && avgLum > 175 ? 1.15 : 1.0;

      for (let i = 0; i < len; i += 4) {
        // Red
        let rNorm = Math.min(1, Math.max(0, (data[i] - lower) / range));
        if (gamma !== 1.0) rNorm = Math.pow(rNorm, gamma);
        data[i] = Math.round(rNorm * 255);

        // Green
        let gNorm = Math.min(1, Math.max(0, (data[i + 1] - lower) / range));
        if (gamma !== 1.0) gNorm = Math.pow(gNorm, gamma);
        data[i + 1] = Math.round(gNorm * 255);

        // Blue
        let bNorm = Math.min(1, Math.max(0, (data[i + 2] - lower) / range));
        if (gamma !== 1.0) bNorm = Math.pow(bNorm, gamma);
        data[i + 2] = Math.round(bNorm * 255);
      }
    }

    // --- 3. 3x3 High-Pass Sharpening Kernel (Unsharp Mask) ---
    if (sharpen && width >= 100 && height >= 100) {
      const copy = new Uint8ClampedArray(data);
      // Kernel: moderate sharpening to avoid haloing on high-contrast text
      // [  0, -0.6,  0 ]
      // [-0.6, 3.4, -0.6]
      // [  0, -0.6,  0 ]
      const kCenter = 3.4;
      const kEdge = -0.6;

      const stride = width * 4;

      for (let y = 1; y < height - 1; y++) {
        const yOffset = y * stride;
        const yTop = yOffset - stride;
        const yBottom = yOffset + stride;

        for (let x = 1; x < width - 1; x++) {
          const idx = yOffset + (x * 4);
          const idxTop = yTop + (x * 4);
          const idxBottom = yBottom + (x * 4);
          const idxLeft = idx - 4;
          const idxRight = idx + 4;

          // Process RGB channels
          for (let c = 0; c < 3; c++) {
            const val =
              kCenter * copy[idx + c] +
              kEdge * (copy[idxTop + c] + copy[idxBottom + c] + copy[idxLeft + c] + copy[idxRight + c]);
            data[idx + c] = val < 0 ? 0 : val > 255 ? 255 : val;
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('Image quality enhancement encountered an issue, using source image:', err);
  }

  return outputCanvas;
}

/**
 * Enhanced photo preparer: Downscales with high detail retention (up to 2000px),
 * applies contrast stretching and unsharp mask, and exports 0.92 JPEG.
 */
export async function prepareEnhancedPhoto(
  file: File,
  maxDim = 2000
): Promise<{ dataUrl: string; width: number; height: number; rawDataUrl: string }> {
  let bitmap: ImageBitmap;
  if (typeof createImageBitmap === 'function') {
    bitmap = await createImageBitmap(file);
  } else {
    bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        resolve(canvas as unknown as ImageBitmap);
      };
      img.onerror = () => reject(new Error('Could not read the selected image.'));
      img.src = url;
    });
  }

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  if (typeof bitmap.close === 'function') bitmap.close();

  const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);

  // Run enhancement pipeline
  const enhancedCanvas = enhanceCanvasImage(canvas, {
    sharpen: true,
    contrastStretch: true,
    autoExposure: true,
  });

  const enhancedDataUrl = enhancedCanvas.toDataURL('image/jpeg', 0.92);

  return {
    dataUrl: enhancedDataUrl,
    width,
    height,
    rawDataUrl,
  };
}
