"use client"

import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  stepNumber: number
  stepName: string
  description?: string | null
}

interface StatusTimelineProps {
  steps: Step[]
  currentStep: number
}

export function StatusTimeline({ steps, currentStep }: StatusTimelineProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = step.stepNumber < currentStep
        const isCurrent = step.stepNumber === currentStep
        const isUpcoming = step.stepNumber > currentStep

        return (
          <div key={step.stepNumber} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary bg-primary/10 text-primary",
                  isUpcoming && "border-muted bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "mt-2 h-12 w-0.5",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div
                className={cn(
                  "font-semibold",
                  isCurrent && "text-primary",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                Step {step.stepNumber}: {step.stepName}
              </div>
              {step.description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </div>
              )}
              {isCurrent && (
                <div className="mt-2 text-sm font-medium text-primary">
                  Current Step
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

