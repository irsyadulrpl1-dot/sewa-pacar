import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadResult {
  url: string | null;
  error: Error | null;
}

export function useAvatarUpload() {
  const { user } = useAuth();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);

  const uploadAvatar = async (file: File): Promise<UploadResult> => {
    if (!user) {
      const error = new Error("Silakan login terlebih dahulu");
      toast.error(error.message);
      return { url: null, error };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      const error = new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WebP.");
      toast.error(error.message);
      return { url: null, error };
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      const error = new Error("Ukuran file melebihi 2MB. Silakan pilih file yang lebih kecil.");
      toast.error(error.message);
      return { url: null, error };
    }

    if (file.size === 0) {
      const error = new Error("File kosong. Silakan pilih file yang valid.");
      toast.error(error.message);
      return { url: null, error };
    }

    setStatus("uploading");
    setProgress(0);

    try {
      // Generate unique filename: {userId}-{timestamp}.{ext}
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // Store directly in bucket root, not in subfolder

      console.log("Uploading avatar:", {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type,
      });

      // Delete old avatar if exists
      const { data: oldFiles } = await supabase.storage
        .from("avatars")
        .list("", {
          search: user.id,
        });

      if (oldFiles && oldFiles.length > 0) {
        const oldFilePaths = oldFiles
          .filter((f) => f.name.startsWith(user.id))
          .map((f) => f.name);
        
        if (oldFilePaths.length > 0) {
          console.log("Deleting old avatars:", oldFilePaths);
          await supabase.storage.from("avatars").remove(oldFilePaths);
        }
      }

      // Upload new file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        
        let errorMessage = "Gagal mengupload foto profil.";
        if (uploadError.message?.includes("permission") || uploadError.message?.includes("policy")) {
          errorMessage = "Tidak memiliki izin untuk mengupload. Pastikan kamu sudah login.";
        } else if (uploadError.message?.includes("duplicate") || uploadError.message?.includes("already exists")) {
          // File already exists, continue to get URL
          console.log("File already exists, getting URL...");
        } else {
          errorMessage = `Gagal mengupload: ${uploadError.message || "Terjadi kesalahan pada server"}`;
        }

        if (!uploadError.message?.includes("duplicate") && !uploadError.message?.includes("already exists")) {
          const error = new Error(errorMessage);
          setStatus("error");
          toast.error(errorMessage);
          return { url: null, error };
        }
      }

      if (!uploadData) {
        const error = new Error("Upload gagal: Tidak ada data yang dikembalikan");
        setStatus("error");
        toast.error(error.message);
        return { url: null, error };
      }

      setProgress(100);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        const error = new Error("Gagal mendapatkan URL foto yang diupload");
        setStatus("error");
        toast.error(error.message);
        return { url: null, error };
      }

      const publicUrl = urlData.publicUrl;
      console.log("Avatar uploaded successfully:", publicUrl);

      setStatus("success");
      return { url: publicUrl, error: null };
    } catch (err: any) {
      console.error("Unexpected error uploading avatar:", err);
      const error = new Error(err?.message || "Terjadi kesalahan saat mengupload foto");
      setStatus("error");
      toast.error(error.message);
      return { url: null, error };
    }
  };

  const resetStatus = () => {
    setStatus("idle");
    setProgress(0);
  };

  return {
    uploadAvatar,
    status,
    progress,
    resetStatus,
  };
}

