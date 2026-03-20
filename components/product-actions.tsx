"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ProductActions({
  productId,
  productName,
  archived,
}: {
  productId: string
  productName: string
  archived: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<"archive" | "delete" | null>(null)
  const [confirm, setConfirm] = useState<"archive" | "unarchive" | "delete" | null>(null)

  async function handleArchive(value: boolean) {
    setLoading("archive")
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: value }),
      })
      if (!res.ok) throw new Error("Failed to update")
      setConfirm(null)
      if (value) router.push("/products")
      router.refresh()
    } catch {
      setLoading(null)
    }
  }

  async function handleDelete() {
    setLoading("delete")
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      setConfirm(null)
      router.push("/products")
      router.refresh()
    } catch {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirm(archived ? "unarchive" : "archive")}
          disabled={!!loading}
        >
          {archived ? "Unarchive" : "Archive"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirm("delete")}
          disabled={!!loading}
        >
          Delete
        </Button>
      </div>

      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirm === "archive" && "Archive product?"}
              {confirm === "unarchive" && "Unarchive product?"}
              {confirm === "delete" && "Delete product?"}
            </DialogTitle>
            <DialogDescription>
              {confirm === "archive" &&
                `"${productName}" will be hidden from the main list. You can show archived items with the filter.`}
              {confirm === "unarchive" &&
                `"${productName}" will appear in the main list again.`}
              {confirm === "delete" &&
                `Permanently delete "${productName}"? This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant={confirm === "delete" ? "destructive" : "default"}
              onClick={() => {
                if (confirm === "archive") handleArchive(true)
                else if (confirm === "unarchive") handleArchive(false)
                else handleDelete()
              }}
              disabled={!!loading}
            >
              {loading ? "…" : confirm === "archive" ? "Archive" : confirm === "unarchive" ? "Unarchive" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
