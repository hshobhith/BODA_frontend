"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useUploadImage } from "../hooks";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface PendingUpload {
  id: string;
  previewUrl: string;
  status: "uploading" | "error";
}

interface ImageUploaderProps {
  /** Already-uploaded image URLs, in display order. */
  value: string[];
  onChange: (urls: string[]) => void;
  /** Allow more than one image. Defaults to `true`. Pass `false` for a single logo/banner slot. */
  multiple?: boolean;
  folder?: string;
  maxImages?: number;
  label?: string;
  className?: string;
}

/**
 * Shared multi-image uploader: selecting a file uploads it immediately via
 * `POST /uploads/image`, showing a spinner over its preview until the URL
 * comes back. Already-uploaded thumbnails can be removed from the list
 * (client-side only — this never deletes the underlying upload) before the
 * parent form is submitted. Used both for a single store logo/banner
 * (`multiple={false}`) and a product's image gallery (`multiple` — the
 * default).
 */
export function ImageUploader({
  value,
  onChange,
  multiple = true,
  folder,
  maxImages,
  label = "Images",
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadImage();
  const [pending, setPending] = useState<PendingUpload[]>([]);

  const atLimit = typeof maxImages === "number" && value.length >= maxImages;
  const canAddMore = (multiple || value.length + pending.length === 0) && !atLimit;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = multiple ? Array.from(fileList) : Array.from(fileList).slice(0, 1);

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} isn't a supported image type (JPEG, PNG, or WebP).`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name} is larger than 10MB.`);
        continue;
      }

      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setPending((prev) => [...prev, { id, previewUrl, status: "uploading" }]);

      try {
        const { url } = await uploadImage.mutateAsync({ file, folder });
        setPending((prev) => prev.filter((p) => p.id !== id));
        URL.revokeObjectURL(previewUrl);
        onChange(multiple ? [...value, url] : [url]);
      } catch {
        setPending((prev) => prev.map((p) => (p.id === id ? { ...p, status: "error" } : p)));
      }
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function dismissPending(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
          >
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground focus-visible:opacity-100"
              aria-label="Remove image"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {pending.map((p) => (
          <div
            key={p.id}
            className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
          >
            <Image src={p.previewUrl} alt="" fill sizes="80px" className="object-cover opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              {p.status === "uploading" ? (
                <Loader2 className="size-5 animate-spin text-foreground" />
              ) : (
                <button
                  type="button"
                  onClick={() => dismissPending(p.id)}
                  className="flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                  aria-label="Dismiss failed upload"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <ImagePlus className="size-5" />
            <span className="text-[10px]">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
