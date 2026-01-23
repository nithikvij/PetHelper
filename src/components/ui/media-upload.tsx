"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface MediaFile {
  id: string;
  type: "image" | "video";
  data: string; // base64
  name: string;
}

interface MediaUploadProps {
  onMediaChange: (media: MediaFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function MediaUpload({
  onMediaChange,
  maxFiles = 3,
  maxSizeMB = 5,
}: MediaUploadProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsProcessing(true);

    const newMedia: MediaFile[] = [];
    const maxSize = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check if we've reached max files
      if (media.length + newMedia.length >= maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`);
        break;
      }

      // Validate file type
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setError("Only image and video files are allowed");
        continue;
      }

      // Validate file size
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      // Convert to base64
      try {
        const base64 = await fileToBase64(file);
        newMedia.push({
          id: `${Date.now()}-${i}`,
          type: isImage ? "image" : "video",
          data: base64,
          name: file.name,
        });
      } catch {
        setError(`Failed to process "${file.name}"`);
      }
    }

    const updatedMedia = [...media, ...newMedia];
    setMedia(updatedMedia);
    onMediaChange(updatedMedia);
    setIsProcessing(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (id: string) => {
    const updatedMedia = media.filter((m) => m.id !== id);
    setMedia(updatedMedia);
    onMediaChange(updatedMedia);
    setError(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Add Photos/Videos (Optional)
        </label>
        <span className="text-xs text-muted-foreground">
          {media.length}/{maxFiles} files
        </span>
      </div>

      {/* Upload Area */}
      {media.length < maxFiles && (
        <div
          onClick={triggerFileInput}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm text-muted-foreground">
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                Click to add photos or videos of symptoms
                <br />
                <span className="text-xs">
                  Max {maxSizeMB}MB per file • {maxFiles - media.length} slots remaining
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">{error}</p>
      )}

      {/* Media Preview Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted border border-border"
            >
              {item.type === "image" ? (
                <Image
                  src={item.data}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <video
                    src={item.data}
                    className="max-w-full max-h-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">🎬</span>
                  </div>
                </div>
              )}

              {/* Remove Button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeMedia(item.id)}
                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </Button>

              {/* File Type Badge */}
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                {item.type === "image" ? "IMG" : "VID"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        Adding clear photos or videos of visible symptoms (skin issues, injuries, swelling, etc.)
        helps provide more accurate analysis.
      </p>
    </div>
  );
}
