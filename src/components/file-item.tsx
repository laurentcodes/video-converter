import { FileVideo, Download, X, AlertCircle, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { formatBytes } from "@/lib/format-bytes"
import type { FileTask } from "@/types"

interface FileItemProps {
  task: FileTask
  onRemove: (id: string) => void
  isProcessing: boolean
}

export function FileItem({ task, onRemove, isProcessing }: FileItemProps) {
  const statusConfig = {
    queued: { label: "Queued", variant: "secondary" as const, icon: null },
    processing: { label: "Processing", variant: "default" as const, icon: Loader2 },
    done: { label: "Done", variant: "default" as const, icon: Check },
    error: { label: "Error", variant: "destructive" as const, icon: AlertCircle },
  }

  const config = statusConfig[task.status]
  const StatusIcon = config.icon

  const handleDownload = () => {
    if (!task.outputUrl) return
    const a = document.createElement("a")
    a.href = task.outputUrl
    const baseName = task.file.name.replace(/\.[^.]+$/, "")
    a.download = `${baseName}.${task.outputFormat}`
    a.click()
  }

  // left border color based on status
  const borderClass =
    task.status === "done"
      ? "border-l-2 border-l-primary"
      : task.status === "error"
        ? "border-l-2 border-l-destructive"
        : task.status === "processing"
          ? "border-l-2 border-l-primary/50"
          : ""

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 bg-muted/30 hover:bg-muted/50 transition-colors ${borderClass}`}>
      <FileVideo className={`h-5 w-5 shrink-0 ${task.status === "done" ? "text-primary" : "text-muted-foreground"}`} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{task.file.name}</p>
          {task.status === "done" ? (
            <Badge variant={config.variant} className="shrink-0 gap-1 bg-primary/15 text-primary border border-primary/20">
              {StatusIcon && <StatusIcon className="h-3 w-3" />}
              {config.label}
            </Badge>
          ) : (
            <Badge variant={config.variant} className="shrink-0 gap-1">
              {StatusIcon && (
                <StatusIcon
                  className={`h-3 w-3 ${task.status === "processing" ? "animate-spin" : ""}`}
                />
              )}
              {config.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatBytes(task.file.size)}
          </span>
          {task.outputSize !== null && (
            <>
              <span className="text-xs text-muted-foreground">→</span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(task.outputSize)}
              </span>
            </>
          )}
          <span className="text-xs text-muted-foreground uppercase">
            → {task.outputFormat}
          </span>
        </div>

        {task.status === "processing" && (
          <Progress value={task.progress} className="mt-2 h-1.5 progress-amber" />
        )}

        {task.error && (
          <p className="text-xs text-destructive mt-1">{task.error}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {task.status === "done" && task.outputUrl && (
          <Button variant="ghost" size="icon" onClick={handleDownload} className="hover:text-primary">
            <Download className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(task.id)}
          disabled={task.status === "processing" || isProcessing}
          className="hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
