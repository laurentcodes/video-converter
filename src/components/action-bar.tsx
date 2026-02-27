import { Button } from "@/components/ui/button"
import { Play, DownloadCloud, Trash2 } from "lucide-react"
import type { FileTask, ProcessingMode } from "@/types"

interface ActionBarProps {
  files: FileTask[]
  isProcessing: boolean
  mode: ProcessingMode
  onStart: () => void
  onDownloadAll: () => void
  onClear: () => void
}

export function ActionBar({
  files,
  isProcessing,
  mode,
  onStart,
  onDownloadAll,
  onClear,
}: ActionBarProps) {
  const hasQueued = files.some((f) => f.status === "queued")
  const hasDone = files.some((f) => f.status === "done")

  if (files.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Button onClick={onStart} disabled={!hasQueued || isProcessing} className="amber-glow">
        <Play className="h-4 w-4 mr-2" />
        {isProcessing
          ? "Processing..."
          : mode === "convert"
            ? "Start Conversion"
            : "Start Compression"}
      </Button>

      <Button variant="outline" onClick={onDownloadAll} disabled={!hasDone}>
        <DownloadCloud className="h-4 w-4 mr-2" />
        Download All
      </Button>

      <Button
        variant="outline"
        onClick={onClear}
        disabled={isProcessing}
        className="hover:border-destructive/50 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear
      </Button>
    </div>
  )
}
