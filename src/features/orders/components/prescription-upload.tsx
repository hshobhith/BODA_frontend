"use client";

import { useRef } from "react";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useUploadPrescription } from "../hooks";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 5;

export interface UploadedPrescription {
  key: string;
  name: string;
}

interface PrescriptionUploadProps {
  value: UploadedPrescription[];
  onChange: (value: UploadedPrescription[]) => void;
}

/** Checkout uploader for prescriptions. Files are stored privately; only storage keys come back. */
export function PrescriptionUpload({ value, onChange }: PrescriptionUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadPrescription();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    let next = value;
    for (const file of Array.from(fileList)) {
      if (next.length >= MAX_FILES) {
        toast.error(`You can attach up to ${MAX_FILES} files.`);
        break;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} isn't a photo (JPEG, PNG, WebP) or PDF.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name} is larger than 10MB.`);
        continue;
      }
      try {
        const { key } = await upload.mutateAsync(file);
        next = [...next, { key, name: file.name }];
        onChange(next);
      } catch {
        // useUploadPrescription already toasts the error.
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((file, index) => (
            <li
              key={file.key}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={`Remove ${file.name}`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        type="button"
        variant="outline"
        className="w-fit gap-2"
        disabled={upload.isPending || value.length >= MAX_FILES}
        onClick={() => inputRef.current?.click()}
      >
        {upload.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {value.length > 0 ? "Add another page" : "Upload prescription"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Photo or PDF, up to 10MB each. Only you and the pharmacy can see it.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
