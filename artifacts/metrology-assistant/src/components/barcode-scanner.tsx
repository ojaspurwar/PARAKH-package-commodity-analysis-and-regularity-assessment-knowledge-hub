import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, ScanBarcode, X } from 'lucide-react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';

/**
 * Barcode / QR scanner for product packages — works in every browser.
 *
 * Decoding tiers:
 *  1. Native BarcodeDetector API (Chromium: Chrome, Edge, Android) — fastest.
 *  2. ZXing JS decoder (@zxing/browser) — pure-JS fallback for Firefox,
 *     Safari and any other browser without BarcodeDetector.
 *  3. Manual entry — always available if the camera can't be opened.
 */

interface DetectedBarcode {
  rawValue: string;
  format: string;
}

// BarcodeDetector is not yet in the standard TS DOM lib, so type it minimally.
interface BarcodeDetectorInstance {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats(): Promise<string[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorCtor;
  }
}

const COMMON_FORMATS = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39',
  'code_93',
  'codabar',
  'itf',
  'qr_code',
  'data_matrix',
  'aztec',
  'pdf417',
];

const ZXING_FORMATS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.CODABAR,
  BarcodeFormat.ITF,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.AZTEC,
  BarcodeFormat.PDF_417,
];

// Reverse-map the numeric BarcodeFormat enum to its name (e.g. 7 → "EAN_13").
function zxingFormatName(value: BarcodeFormat): string {
  const name = (BarcodeFormat as unknown as Record<number, string>)[value];
  return name ? name.toLowerCase().replace('_', '-') : 'barcode';
}

type ScannerState =
  | { phase: 'starting' }
  | { phase: 'scanning' }
  | { phase: 'error'; message: string }
  | { phase: 'detected'; barcode: DetectedBarcode };

// Browsers only allow camera access on secure contexts — https:// or
// localhost. When the app is opened over plain http://<LAN-IP> (e.g. on a
// phone), getUserMedia is silently blocked without ever showing a prompt.
// Detect that case and tell the user exactly how to fix it.
function cameraBlockedMessage(): string | null {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return (
      'Your browser blocks the camera on this connection — it needs HTTPS. ' +
      'Run the app with pnpm dev:https and open the printed https:// link (accept ' +
      'the certificate warning once), or use localhost on this computer.'
    );
  }
  if (
    typeof navigator !== 'undefined' &&
    (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function')
  ) {
    return 'This browser does not expose a camera API. You can still enter the barcode number manually below.';
  }
  return null;
}
export function BarcodeScanner({
  onDetected,
  onCancel,
}: {
  onDetected: (barcode: DetectedBarcode) => void;
  onCancel: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stateRef = useRef<ScannerState>({ phase: 'starting' });
  const [state, setState] = useState<ScannerState>({ phase: 'starting' });
  const [manualValue, setManualValue] = useState('');
  const manualRef = useRef<HTMLInputElement | null>(null);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  const updateState = (next: ScannerState) => {
    stateRef.current = next;
    setState(next);
  };

  // ------------------------------------------------------------------
  // Camera + decode loop (native BarcodeDetector tier)
  // ------------------------------------------------------------------
  async function startNative(detectorCtor: BarcodeDetectorCtor, stream: MediaStream) {
    const video = videoRef.current;
    if (!video) return;

    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      // Autoplay failed — the detect loop simply won't have frames yet.
    }

    let detector: BarcodeDetectorInstance;
    try {
      detector = new detectorCtor({ formats: COMMON_FORMATS });
    } catch {
      detector = new detectorCtor();
    }

    if (stateRef.current.phase === 'starting') {
      updateState({ phase: 'scanning' });
    }

    return new Promise<void>((resolve) => {
      let done = false;
      const finish = (barcode: DetectedBarcode) => {
        if (done) return;
        done = true;
        updateState({ phase: 'detected', barcode });
        onDetectedRef.current(barcode);
        resolve();
      };
      const tick = async () => {
        if (done) return;
        if (detector && video.readyState >= 2) {
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0 && !done) {
              finish({ rawValue: codes[0].rawValue, format: codes[0].format });
              return;
            }
          } catch {
            // Transient detection error — keep scanning.
          }
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // ------------------------------------------------------------------
  // ZXing tier (Firefox / Safari / anything without BarcodeDetector)
  // ------------------------------------------------------------------
  async function startZxing(stream: MediaStream) {
    const video = videoRef.current;
    if (!video) return;

    // Reuse the stream ZXing would open itself is not possible, so feed the
    // already-obtained stream directly through a canvas-based decode loop.
    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      // Ignore — frames are drawn manually below.
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, ZXING_FORMATS);
    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 120,
    });

    if (stateRef.current.phase === 'starting') {
      updateState({ phase: 'scanning' });
    }

    return new Promise<void>((resolve) => {
      let done = false;
      let lastAttempt = 0;
      const finish = (barcode: DetectedBarcode) => {
        if (done) return;
        done = true;
        updateState({ phase: 'detected', barcode });
        onDetectedRef.current(barcode);
        resolve();
      };
      const tick = async () => {
        if (done) return;
        // Decoding every animation frame is wasteful; attempt a few times a
        // second so the loop stays responsive on lower-end phones.
        const now = performance.now();
        if (now - lastAttempt >= 150 && video.readyState >= 2 && video.videoWidth > 0 && context) {
          lastAttempt = now;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            const result = reader.decodeFromCanvas(canvas);
            if (result && result.getText() && !done) {
              finish({
                rawValue: result.getText(),
                format: zxingFormatName(result.getBarcodeFormat()),
              });
              return;
            }
          } catch {
            // ZXing throws when nothing decodes — keep scanning.
          }
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let stopRequested = false;

    const finish = () => {
      if (stopRequested) return;
      stopRequested = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
    };

    async function boot() {
      // Surface a precise reason before even touching the camera: on plain
      // http:// the browser silently refuses getUserMedia (no prompt appears),
      // which is the classic "phone says allow camera but never asks" issue.
      const blocked = cameraBlockedMessage();
      if (blocked) {
        updateState({ phase: 'error', message: blocked });
        return;
      }

      // Ask for the rear-facing camera (falls back to any camera).
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        if (!cancelled) {
          const hint =
            cameraBlockedMessage() ??
            'Camera access was denied or could not be opened. Check the browser\'s site settings (allow camera for this site), then retry — or enter the barcode manually below.';
          updateState({ phase: 'error', message: hint });
        }
        return;
      }

      if (cancelled) {
        stream?.getTracks().forEach((track) => track.stop());
        return;
      }

      try {
        if (typeof window.BarcodeDetector === 'function') {
          await startNative(window.BarcodeDetector, stream);
        } else {
          await startZxing(stream);
        }
      } catch {
        // Any unexpected failure — surface the manual-entry fallback.
        if (!cancelled && stateRef.current.phase !== 'detected') {
          updateState({
            phase: 'error',
            message: 'The barcode reader could not start in this browser. Enter the barcode manually below.',
          });
        }
      } finally {
        finish();
      }
    }

    void boot();

    return () => {
      cancelled = true;
      finish();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitManual = () => {
    const value = manualValue.trim();
    if (!value) return;
    updateState({ phase: 'detected', barcode: { rawValue: value, format: 'manual' } });
    onDetectedRef.current({ rawValue: value, format: 'manual' });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card" data-testid="card-barcode-scanner">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-secondary">Package barcode</p>
          <h3 className="mt-1 text-base font-semibold">Point the camera at the barcode</h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          aria-label="Close barcode scanner"
          data-testid="button-close-scanner"
        >
          <X size={17} />
        </button>
      </div>

      {state.phase === 'error' ? (
        /* Errors (camera blocked on http, denied, unsupported) get room to
           explain — no tiny viewfinder box. Manual entry stays below. */
        <div className="w-full bg-slate-950 px-6 py-10 text-center text-white" data-testid="state-scanner-error">
          <ScanBarcode size={22} className="mx-auto text-white/70" />
          <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-white/85">{state.message}</p>
        </div>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            muted
            playsInline
            data-testid="video-barcode-feed"
          />
          {/* Viewfinder reticle */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-32 w-64">
              <span className="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-white/90" />
              <span className="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-white/90" />
              <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-white/90" />
              <span className="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-white/90" />
            </div>
          </div>

          {state.phase === 'starting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/70 text-white" data-testid="state-scanner-starting">
              <LoaderCircle size={22} className="animate-spin" />
              <p className="text-xs font-medium">Opening camera…</p>
            </div>
          )}

          {state.phase === 'scanning' && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/80 to-transparent px-4 pb-3 pt-8 text-white">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium"><ScanBarcode size={13} /> Detecting…</span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-[10px]">EAN · UPC · Code 128 · QR</span>
            </div>
          )}

          {state.phase === 'detected' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-950/80 px-6 text-center text-white" data-testid="state-scanner-detected">
              <span className="text-2xl">✓</span>
              <p className="font-mono text-sm font-semibold tracking-wider">{state.barcode.rawValue}</p>
              <p className="text-[11px] text-white/70">{state.barcode.format.toUpperCase()}</p>
            </div>
          )}
        </div>
      )}

      {/* Manual entry fallback — always available */}
      <div className="flex items-center gap-2 border-t border-border px-5 py-4">
        <input
          ref={manualRef}
          value={manualValue}
          onChange={(event) => setManualValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submitManual();
            }
          }}
          inputMode="numeric"
          placeholder="Or type a barcode number…"
          className="field-input min-w-0 flex-1"
          data-testid="input-manual-barcode"
        />
        <button
          type="button"
          onClick={submitManual}
          disabled={!manualValue.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          data-testid="button-add-manual-barcode"
        >
          Add
        </button>
      </div>
    </div>
  );
}