import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentProofUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  currentProofUrl?: string | null;
}

export function PaymentProofUpload({
  onUpload,
  isUploading,
  currentProofUrl,
}: PaymentProofUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentProofUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await onUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-foreground text-sm">Upload Bukti Pembayaran</h4>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all p-6",
          dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/30",
          previewUrl && "p-2"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          id="payment-proof-input"
        />

        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <img
                src={previewUrl}
                alt="Bukti pembayaran"
                className="w-full h-48 object-contain rounded-lg"
              />
              {!isUploading && !currentProofUrl && (
                <button
                  onClick={clearPreview}
                  className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {currentProofUrl && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-green-500/90 text-white rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Terupload
                </div>
              )}
            </motion.div>
          ) : (
            <motion.label
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              htmlFor="payment-proof-input"
              className="flex flex-col items-center justify-center cursor-pointer py-4"
            >
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : (
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
              )}
              <p className="text-sm font-medium text-foreground">
                {isUploading ? "Mengunggah..." : "Klik atau drop gambar di sini"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Format: JPG, PNG (Max 5MB)
              </p>
            </motion.label>
          )}
        </AnimatePresence>
      </div>

      {!previewUrl && !isUploading && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => inputRef.current?.click()}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Pilih dari Galeri
        </Button>
      )}
    </div>
  );
}
