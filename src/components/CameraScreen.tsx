import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, RotateCcw, X, Zap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CameraScreenProps {
  onCapture: (imageBlob: Blob, imageUrl: string) => void;
  onCancel: () => void;
}

export function CameraScreen({ onCapture, onCancel }: CameraScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] =
    useState<"user" | "environment">("environment");
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------------------------------
  // CAMERA START
  // -------------------------------
  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please ensure camera permissions are granted.");
    }
  }, [facingMode, stream]);

  useEffect(() => {
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // -------------------------------
  // CAMERA CAPTURE
  // -------------------------------
const handleCapture = async () => {
  if (!videoRef.current) return;

  const video = videoRef.current;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0);

  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 1.0)
  );

  const imageUrl = URL.createObjectURL(blob);
  onCapture(blob, imageUrl);
};
  // -------------------------------
  // FILE UPLOAD
  // -------------------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    // Stop camera stream when uploading file
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    onCapture(file, imageUrl);
  };

  // -------------------------------
  // ERROR STATE
  // -------------------------------
  if (error) {
    return (
      <div className="fixed inset-0 bg-foreground flex flex-col items-center justify-center p-6">
        <div className="text-center text-card">
          <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-6">{error}</p>
          <Button variant="outline" onClick={onCancel}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="fixed inset-0 bg-foreground">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Overlay */}
      <div className="absolute inset-0 camera-overlay pointer-events-none" />

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-10">
        <Button variant="icon" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2 bg-card/20 rounded-full px-3 py-1.5">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm text-card font-medium">Snap Food</span>
        </div>

        <Button variant="icon" size="icon" onClick={handleFlipCamera}>
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Viewfinder */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 border-2 border-card/30 rounded-3xl" />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 pb-12 pt-8 flex flex-col items-center z-10">
        <p className="text-card/80 text-sm mb-4">
          Scan food or upload an image
        </p>

        <div className="flex items-center gap-6">
          {/* Upload */}
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="text-card border-card/30"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload
          </Button>

          {/* Capture */}
          <div className="relative">
            <div
              className={cn(
                "absolute inset-0 rounded-full bg-primary/30",
                isCapturing && "animate-pulse-ring"
              )}
            />

            <Button
              variant="capture"
              onClick={handleCapture}
              disabled={isCapturing}
              className="relative z-10"
            >
              <Camera className="h-7 w-7" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
