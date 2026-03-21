"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"

type PhotoFilePickerProps = {
  file: File | null
  onFileChange: (file: File | null) => void
  accept?: string
  disabled?: boolean
  placeholder?: string
}

export function PhotoFilePicker({
  file,
  onFileChange,
  accept = "image/jpeg,image/png,image/webp",
  disabled,
  placeholder = "No file chosen",
}: PhotoFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function openPicker() {
    if (disabled) return
    inputRef.current?.click()
  }

  return (
    <div className="flex min-h-10 w-full items-center gap-3 rounded-md border bg-background px-3 py-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const picked = e.target.files?.[0] ?? null
          onFileChange(picked)
          // Allow picking the same file again.
          e.currentTarget.value = ""
        }}
      />

      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={openPicker}
        disabled={disabled}
        className="shrink-0"
      >
        Choose File
      </Button>

      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
        {file?.name ?? placeholder}
      </span>
    </div>
  )
}

