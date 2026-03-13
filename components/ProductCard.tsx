"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

interface ProductCardProps {
  id: string
  name: string
  photoUrl?: string | null
  currentStep: number
  stepName?: string
}

export function ProductCard({
  id,
  name,
  photoUrl,
  currentStep,
  stepName,
}: ProductCardProps) {
  return (
    <Link href={`/admin/products/${id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-lg">
        <CardContent className="p-0">
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold truncate">{name}</h3>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary">Step {currentStep}</Badge>
              {stepName && (
                <span className="text-sm text-muted-foreground truncate">
                  {stepName}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

