"use client"

const TOTAL_STEPS = 11

export function AdvanceStepForm({
  id,
  currentStep,
}: {
  id: string
  currentStep: number
}) {
  async function advance() {
    const nextStep = Math.min(currentStep + 1, TOTAL_STEPS)
    const notes = window.prompt(
      `Move to step ${nextStep}? Optional notes:`,
      ""
    )
    const res = await fetch(`/api/products/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepNumber: nextStep, notes: notes || undefined }),
    })
    if (!res.ok) {
      alert("Failed to update step")
      return
    }
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={advance}
      className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
    >
      Mark next step complete
    </button>
  )
}

