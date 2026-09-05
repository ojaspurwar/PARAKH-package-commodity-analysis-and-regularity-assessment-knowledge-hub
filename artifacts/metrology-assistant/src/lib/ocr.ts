import { createWorker } from 'tesseract.js';

/**
 * Client-side OCR of a package photo.
 *
 * Runs Tesseract.js in a web worker (engine + English traineddata load from
 * the jsDelivr CDN on first use). Returns the transcribed label text plus
 * structured word boxes + confidence so the rule engine can also verify font
 * size, readability and placement of the mandatory declarations.
 */

export interface OcrWordBox {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface OcrResult {
  text: string;
  engine: 'tesseract.js';
  imageWidth: number;
  imageHeight: number;
  words: OcrWordBox[];
  elapsedMs: number;
}

export interface OcrProgress {
  status: string;
  progress: number; // 0..1, -1 while loading (indeterminate)
}

/**
 * Downscale the chosen photo so the evidence copy stays small and OCR runs
 * fast, then return it as a JPEG data URL (what gets stored with the scan).
 */
export async function preparePhoto(file: File, maxDim = 1200): Promise<{ dataUrl: string; width: number; height: number }> {
  let bitmap: ImageBitmap;
  if (typeof createImageBitmap === 'function') {
    bitmap = await createImageBitmap(file);
  } else {
    // Older Safari fallback: decode via an <img> element.
    bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        // Cast: HTMLCanvasElement is accepted by Tesseract even if the
        // ImageBitmap type name differs here.
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
  return { dataUrl: canvas.toDataURL('image/jpeg', 0.78), width, height };
}

/**
 * Run OCR over the prepared photo. onProgress is invoked with the Tesseract
 * worker's status messages so the UI can show a live progress bar.
 */
export async function runImageOcr(
  image: string,
  dims: { width: number; height: number },
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrResult> {
  const startedAt = performance.now();
  const worker = await createWorker('eng', undefined, {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        onProgress?.({ status: 'Reading label text…', progress: message.progress });
      } else {
        onProgress?.({ status: message.status, progress: -1 });
      }
    },
  });

  try {
    const { data } = await worker.recognize(image, {}, { blocks: true, text: true });
    const words: OcrWordBox[] = (data.blocks ?? [])
      .flatMap((block) => block.paragraphs ?? [])
      .flatMap((paragraph) => paragraph.lines ?? [])
      .flatMap((line) => line.words ?? [])
      .map((word) => ({
        text: word.text,
        x: Math.max(0, word.bbox.x0),
        y: Math.max(0, word.bbox.y0),
        width: Math.max(0, word.bbox.x1 - word.bbox.x0),
        height: Math.max(0, word.bbox.y1 - word.bbox.y0),
        confidence: word.confidence,
      }))
      .filter((word) => word.text.trim().length > 0);

    return {
      text: (data.text ?? '').trim(),
      engine: 'tesseract.js',
      imageWidth: dims.width,
      imageHeight: dims.height,
      words,
      elapsedMs: Math.round(performance.now() - startedAt),
    };
  } finally {
    await worker.terminate();
  }
}