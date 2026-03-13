"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhotoUpload } from "./PhotoUpload"
import { useToast } from "@/hooks/use-toast"

interface ProductFormProps {
  productId?: string
  initialData?: {
    name: string
    photoUrl?: string | null
    currentStep: number
  }
  onSuccess: () => void
  onCancel?: () => void
}

export function ProductForm({
  productId,
  initialData,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState(initialData?.name || "")
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = productId
        ? `/api/products/${productId}`
        : "/api/products"
      const method = productId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          photoUrl: photoUrl || undefined,
          currentStep: initialData?.currentStep || 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save product")
      }

      toast({
        title: "Success",
        description: productId
          ? "Product updated successfully"
          : "Product created successfully",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Enter product name"
        />
      </div>

      <PhotoUpload
        value={photoUrl}
        onChange={setPhotoUrl}
        disabled={isSubmitting}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : productId
            ? "Update Product"
            : "Create Product"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

