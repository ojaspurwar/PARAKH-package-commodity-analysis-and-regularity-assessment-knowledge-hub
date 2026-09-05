import { useEffect, useRef, useState } from 'react';
import { Camera, Check, FlipHorizontal, Layers, Lightbulb, LoaderCircle, Plus, RefreshCw, Sparkles, Upload, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { enhanceCanvasImage } from '@/lib/image-enhancer';

export interface CapturedPanel {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  label: string;
  timestamp: number;
}

interface LiveCameraCaptureProps {
  onCapture: (image: { dataUrl: string; width: number; height: number; panelsCount?: number }) => void;
  onCancel: () => void;
}

// Play a subtle realistic camera shutter sound via Web Audio API synthesizer
function playShutterSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const bufferSize = Math.floor(ctx.sampleRate * 0.05); // 50ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
  } catch {
    // Audio context may be restricted before user gesture, safe to ignore
  }
}

export function LiveCameraCapture({ onCapture, onCancel }: LiveCameraCaptureProps) {
  const { language } = useI18n();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [starting, setStarting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  // Multi-panel capture state
  const [panels, setPanels] = useState<CapturedPanel[]>([]);
  const [shutterFlashing, setShutterFlashing] = useState(false);
  const [processingDone, setProcessingDone] = useState(false);

  // Stop current stream cleanly
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async (facing: 'environment' | 'user') => {
    setStarting(true);
    setError(null);
    stopStream();

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError(
        language === 'hi'
          ? 'कैमरा उपयोग के लिए सुरक्षित कनेक्शन (HTTPS या localhost) आवश्यक है।'
          : 'Camera access requires a secure connection (HTTPS or localhost).'
      );
      setStarting(false);
      return;
    }

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      setError(
        language === 'hi'
          ? 'यह ब्राउज़र लाइव कैमरा का समर्थन नहीं करता है।'
          : 'Live camera is not supported in this browser.'
      );
      setStarting(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check if torch/flashlight is supported
      const track = stream.getVideoTracks()[0];
      const capabilities = (track?.getCapabilities ? track.getCapabilities() : {}) as any;
      if ('torch' in capabilities) {
        setTorchAvailable(true);
      }

      setStarting(false);
    } catch (err: any) {
      console.warn('Camera error:', err);
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setError(
        isDenied
          ? (language === 'hi'
              ? 'कैमरा अनुमति अस्वीकार कर दी गई। कृपया ब्राउज़र सेटिंग्स में कैमरा की अनुमति दें।'
              : 'Camera permission denied. Please allow camera access in browser site settings.')
          : (language === 'hi'
              ? 'कैमरा शुरू करने में असमर्थ। कृपया पुनः प्रयास करें या फ़ाइल अपलोड करें।'
              : 'Unable to start camera. Please verify device camera or upload an image.')
      );
      setStarting(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopStream();
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch toggle error:', err);
    }
  };

  // Get default suggested label for panel based on index
  const getPanelLabel = (idx: number) => {
    if (language === 'hi') {
      if (idx === 0) return 'पैनल 1: सामने का भाग (ब्रांड व शुद्ध मात्रा)';
      if (idx === 1) return 'पैनल 2: पीछे का भाग (MRP, तिथि व सामग्री)';
      if (idx === 2) return 'पैनल 3: साइड पैनल (निर्माता व कस्टमर केयर)';
      return `पैनल ${idx + 1}`;
    }
    if (idx === 0) return 'Panel 1: Front (Brand & Net Qty)';
    if (idx === 1) return 'Panel 2: Back (MRP, Date & Ingredients)';
    if (idx === 2) return 'Panel 3: Side (Manufacturer & Care)';
    return `Panel ${idx + 1}`;
  };

  // Capture a snapshot frame from the live video feed
  const handleSnap = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    // Trigger visual shutter flash & vibration
    setShutterFlashing(true);
    setTimeout(() => setShutterFlashing(false), 140);
    playShutterSound();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply adaptive contrast stretching and unsharp mask sharpening so faint inkjet/dot-matrix MRP and dates become crisp
    const enhanced = enhanceCanvasImage(canvas, {
      sharpen: true,
      contrastStretch: true,
      autoExposure: true,
    });
    const dataUrl = enhanced.toDataURL('image/jpeg', 0.92);

    const newPanel: CapturedPanel = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      label: getPanelLabel(panels.length),
      timestamp: Date.now(),
    };

    setPanels((prev) => [...prev, newPanel]);
  };

  const removePanel = (id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
  };

  // Stitch multiple panels vertically into a single consolidated high-res composite image
  const stitchPanels = async (panelsList: CapturedPanel[]): Promise<{ dataUrl: string; width: number; height: number }> => {
    if (panelsList.length === 1) {
      return {
        dataUrl: panelsList[0].dataUrl,
        width: panelsList[0].width,
        height: panelsList[0].height,
      };
    }

    // Load HTMLImageElement for all panels
    const loadedImages = await Promise.all(
      panelsList.map((p) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = p.dataUrl;
        });
      })
    );

    // Target width for composite image (preserve high clarity for OCR without bloating payload)
    const targetWidth = Math.min(1200, Math.max(...loadedImages.map((img) => img.naturalWidth || 1000)));
    const dividerHeight = 4; // Thin separator strip between panels without artificial text

    // Compute scaled heights and total canvas height
    const scaledHeights = loadedImages.map((img) => {
      const ratio = targetWidth / (img.naturalWidth || 1);
      return Math.round((img.naturalHeight || 800) * ratio);
    });

    const totalHeight = scaledHeights.reduce((sum, h, i) => sum + h + (i > 0 ? dividerHeight : 0), 0);

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = targetWidth;
    compositeCanvas.height = totalHeight;
    const ctx = compositeCanvas.getContext('2d');

    if (!ctx) {
      return {
        dataUrl: panelsList[0].dataUrl,
        width: panelsList[0].width,
        height: panelsList[0].height,
      };
    }

    let currentY = 0;
    loadedImages.forEach((img, idx) => {
      if (idx > 0) {
        // Thin subtle divider line between consecutive panels
        ctx.fillStyle = '#065f46';
        ctx.fillRect(0, currentY, targetWidth, dividerHeight);
        currentY += dividerHeight;
      }

      const panelHeight = scaledHeights[idx];
      ctx.drawImage(img, 0, currentY, targetWidth, panelHeight);
      currentY += panelHeight;
    });

    const enhancedComposite = enhanceCanvasImage(compositeCanvas, {
      sharpen: true,
      contrastStretch: true,
      autoExposure: true,
    });
    const compositeDataUrl = enhancedComposite.toDataURL('image/jpeg', 0.80);
    return {
      dataUrl: compositeDataUrl,
      width: targetWidth,
      height: totalHeight,
    };
  };

  // Finalize capture: combine all panels and send for AI analysis
  const handleDone = async () => {
    if (panels.length === 0) return;
    setProcessingDone(true);
    stopStream();

    try {
      const consolidated = await stitchPanels(panels);
      onCapture({
        ...consolidated,
        panelsCount: panels.length,
      });
    } catch (err) {
      console.error('Error stitching panels:', err);
      // Fallback to first panel if composite fails
      onCapture({
        dataUrl: panels[0].dataUrl,
        width: panels[0].width,
        height: panels[0].height,
        panelsCount: 1,
      });
    }
  };

  // Support multiple file uploads from gallery
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    fileList.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newPanel: CapturedPanel = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            dataUrl,
            width: img.naturalWidth || 1200,
            height: img.naturalHeight || 800,
            label: getPanelLabel(panels.length + index),
            timestamp: Date.now(),
          };
          setPanels((prev) => [...prev, newPanel]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-secondary/30 bg-card shadow-xl" data-testid="live-camera-scanner">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-secondary text-secondary-foreground shadow-sm">
            <Camera size={16} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">
                {language === 'hi' ? 'मल्टी-पैनल लाइव कैमरा' : 'Multi-Panel Live Camera'}
              </h3>
              {panels.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary">
                  <Layers size={11} />
                  {panels.length} {language === 'hi' ? 'कैप्चर' : panels.length === 1 ? 'panel' : 'panels'}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {panels.length === 0
                ? (language === 'hi'
                    ? 'सामने का भाग (ब्रांड व शुद्ध मात्रा) फ्रेम में रखें'
                    : 'Frame Front label (brand & net quantity) first')
                : (language === 'hi'
                    ? 'अब पीछे या साइड का भाग (MRP, तिथि, सामग्री) लें'
                    : 'Now snap Back / Side label (MRP, dates, ingredients)')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {torchAvailable && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`rounded-lg p-2 text-xs font-medium transition-colors ${
                torchOn ? 'bg-amber-500/20 text-amber-500' : 'text-muted-foreground hover:bg-muted'
              }`}
              title="Toggle Torch"
            >
              <Lightbulb size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={toggleCamera}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            title={language === 'hi' ? 'कैमरा बदलें' : 'Switch Camera'}
          >
            <FlipHorizontal size={16} />
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Video Viewfinder Area */}
      <div className="relative aspect-[4/3] w-full max-h-[460px] overflow-hidden bg-slate-950 sm:aspect-[16/9]">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          autoPlay
          data-testid="video-live-feed"
        />

        {/* Shutter White Flash Animation */}
        <div
          className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${
            shutterFlashing ? 'opacity-90' : 'opacity-0'
          }`}
        />

        {/* Viewfinder Reticle Overlay */}
        {!starting && !error && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="relative h-44 w-68 max-w-[85%] rounded-xl sm:h-60 sm:w-96">
              {/* Reticle corner marks */}
              <span className="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-secondary shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
              <span className="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-secondary shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
              <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-secondary shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
              <span className="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-secondary shadow-[0_0_8px_rgba(20,184,166,0.6)]" />

              {/* Scanning horizontal line */}
              <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent animate-pulse" />
            </div>

            <p className="mt-3 rounded-full bg-slate-900/85 px-3.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-md shadow">
              {panels.length === 0
                ? (language === 'hi'
                    ? '1. सामने का लेबल (ब्रांड व उत्पाद नाम) कैप्चर करें'
                    : '1. Capture Front panel (Brand & Net Qty)')
                : (language === 'hi'
                    ? `2. पैकेट घुमाएं और अगला पैनल (${panels.length + 1}) कैप्चर करें`
                    : `2. Flip package to capture Panel ${panels.length + 1} (MRP, Ingredients, etc.)`)}
            </p>
          </div>
        )}

        {/* Starting indicator */}
        {starting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 text-white">
            <LoaderCircle size={26} className="animate-spin text-secondary" />
            <p className="text-xs font-medium">
              {language === 'hi' ? 'कैमरा चालू हो रहा है…' : 'Initializing camera…'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/95 p-6 text-center text-white">
            <p className="max-w-md text-xs leading-5 text-white/85">{error}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground"
              >
                <RefreshCw size={14} />
                {language === 'hi' ? 'पुनः प्रयास करें' : 'Retry Camera'}
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">
                <Upload size={14} />
                {language === 'hi' ? 'फ़ाइलें चुनें' : 'Choose Photo Files'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Captured Panels Thumbnail Strip (when at least 1 panel is snapped) */}
      {panels.length > 0 && (
        <div className="border-t border-border bg-muted/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Layers size={13} className="text-secondary" />
              <span>
                {language === 'hi'
                  ? `कैप्चर किए गए पैनल (${panels.length})`
                  : `Captured Package Panels (${panels.length})`}
              </span>
            </span>
            <span className="text-[10px] text-muted-foreground">
              {language === 'hi'
                ? 'सभी साइड एक साथ एआई द्वारा जांची जाएंगी'
                : 'All sides will be audited together by AI'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
            {panels.map((p, idx) => (
              <div
                key={p.id}
                className="group relative flex-shrink-0 overflow-hidden rounded-xl border border-secondary/40 bg-card shadow-sm transition-transform hover:scale-[1.02]"
              >
                <img
                  src={p.dataUrl}
                  alt={`Panel ${idx + 1}`}
                  className="h-16 w-20 object-cover sm:h-20 sm:w-24"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 text-[9px] font-bold text-white">
                  #{idx + 1}
                </div>
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removePanel(p.id)}
                  className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-destructive text-destructive-foreground shadow hover:scale-110 active:scale-95"
                  title={language === 'hi' ? 'हटाएं' : 'Delete'}
                >
                  <X size={11} />
                </button>
              </div>
            ))}

            {/* Quick Add hint card */}
            <div className="flex h-16 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 text-[10px] text-muted-foreground sm:h-20 sm:w-24">
              <Plus size={16} className="text-secondary mb-1" />
              <span>{language === 'hi' ? 'अगला पैनल' : 'Next Side'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Shutter & Action Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-4 py-3.5 sm:px-6">
        {/* Left: Gallery upload fallback (supports multiple files) */}
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Upload size={15} />
          <span className="hidden xs:inline">
            {language === 'hi' ? 'गैलरी / फ़ाइल' : 'Upload photos'}
          </span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
        </label>

        {/* Center: Main Snap / Shutter Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSnap}
            disabled={starting || !!error || processingDone}
            className="group relative flex items-center justify-center rounded-full bg-secondary p-1 text-secondary-foreground shadow-lg shadow-secondary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title={language === 'hi' ? 'वर्तमान पैनल की फोटो लें' : 'Snap Current Panel'}
            data-testid="button-camera-shutter"
          >
            <div className="flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-xs sm:text-sm">
              <Camera size={18} className="group-hover:rotate-6 transition-transform" />
              <span>
                {panels.length === 0
                  ? (language === 'hi' ? 'फोटो लें' : 'Capture Panel')
                  : (language === 'hi' ? '+ और पैनल जोड़ें' : '+ Snap Another Panel')}
              </span>
            </div>
          </button>

          {/* Right: Done & Analyze All Panels (Enabled when at least 1 panel captured) */}
          {panels.length > 0 && (
            <button
              type="button"
              onClick={handleDone}
              disabled={processingDone}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:opacity-95 active:scale-95 transition-all animate-pulse"
              data-testid="button-finish-multi-capture"
            >
              {processingDone ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-300" />
                  <span>
                    {language === 'hi'
                      ? `स्कैन करें (${panels.length})`
                      : `Analyze All (${panels.length})`}
                  </span>
                  <Check size={14} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Cancel button */}
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {language === 'hi' ? 'रद्द करें' : 'Cancel'}
        </button>
      </div>
    </div>
  );
}
