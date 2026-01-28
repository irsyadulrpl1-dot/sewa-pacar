import { useState, useRef, useCallback } from "react";
import { Camera, X, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadSuccess?: (url: string) => void;
  className?: string;
}

export function AvatarUpload({ currentAvatarUrl, onUploadSuccess, className }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, status, progress, resetStatus } = useAvatarUpload();
  const { updateProfile, refetch } = useProfile();

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error("Ukuran file melebihi 2MB. Silakan pilih file yang lebih kecil.");
      return;
    }

    if (file.size === 0) {
      toast.error("File kosong. Silakan pilih file yang valid.");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.onerror = () => {
      toast.error("Gagal membaca file gambar.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Silakan pilih foto terlebih dahulu");
      return;
    }

    try {
      const { url, error } = await uploadAvatar(selectedFile);

      if (error || !url) {
        console.error("Upload error:", error);
        return;
      }

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: url });

      if (updateError) {
        console.error("Error updating profile:", updateError);
        toast.error("Foto berhasil diupload, tetapi gagal menyimpan ke profil. Silakan refresh halaman.");
        return;
      }

      // Refetch profile to get latest data
      await refetch();

      // Update preview with new URL
      setPreviewUrl(url);
      setSelectedFile(null);
      resetStatus();

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(url);
      }

      toast.success("Foto profil berhasil diupload!");
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast.error(err?.message || "Terjadi kesalahan saat mengupload foto");
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(currentAvatarUrl || null);
    resetStatus();
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const isUploading = status === "uploading";
  const hasNewFile = selectedFile !== null;
  const canUpload = hasNewFile && !isUploading;

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="relative">
        <div
          className={cn(
            "relative aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden border-2 border-dashed border-border/50 bg-muted/30 cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50",
            className
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6">
              <ImageIcon className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Klik atau drag & drop foto di sini
              </p>
              <p className="text-xs text-muted-foreground/70">
                JPG, PNG, WebP (max 2MB)
              </p>
            </div>
          )}

          {/* Upload Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-foreground">Mengupload...</p>
              {progress > 0 && (
                <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Success Overlay */}
          {status === "success" && (
            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          )}

          {/* Camera Button */}
          {!isUploading && (
            <div className="absolute bottom-4 right-4 p-3 bg-primary rounded-full text-primary-foreground shadow-lg hover:shadow-xl transition-shadow z-10 pointer-events-none">
              <Camera className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Actions */}
      {hasNewFile && (
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Batal
          </Button>
          <Button
            variant="gradient"
            onClick={handleUpload}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Upload Foto
              </>
            )}
          </Button>
        </div>
      )}

      {/* File Info */}
      {selectedFile && (
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium">{selectedFile.name}</p>
          <p>{(selectedFile.size / 1024).toFixed(1)} KB</p>
        </div>
      )}
    </div>
  );
}

