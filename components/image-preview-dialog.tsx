"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ImagePreviewDialogProps = {
  src: string
  alt: string
  title?: string
  /** Wrapper around the thumbnail (e.g. rounded border) */
  className?: string
  /** Classes on the thumbnail img */
  imgClassName?: string
  /** Show a short hint under the thumb (better for larger previews) */
  showHint?: boolean
}

/**
 * Tap/click thumbnail to open a large preview (mobile-friendly).
 */
export function ImagePreviewDialog({
  src,
  alt,
  title = "Image preview",
  className,
  imgClassName,
  showHint = false,
}: ImagePreviewDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative overflow-hidden rounded-md border bg-muted text-left transition hover:ring-2 hover:ring-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-label={`Enlarge image: ${alt}`}
        title="Tap to enlarge"
      >
        <img src={src} alt={alt} className={cn("h-full w-full object-cover", imgClassName)} />
      </button>
      {showHint && (
        <p className="mt-1 text-center text-xs text-muted-foreground">Tap to enlarge</p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95vh] max-w-[min(100vw-2rem,56rem)] gap-2 border-0 p-2 sm:p-4">
          <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[85vh] items-center justify-center overflow-auto rounded-md bg-muted/30 p-1">
            <img
              src={src}
              alt={alt}
              className="max-h-[min(85vh,800px)] w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
