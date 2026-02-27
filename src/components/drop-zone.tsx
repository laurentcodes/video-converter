import { useCallback, useRef, useState } from "react"
import { Upload } from "lucide-react"
import { ACCEPTED_VIDEO_TYPES } from "@/constants"

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void
  disabled: boolean
}

export function DropZone({ onFilesAdded, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("video/")
      )
      if (files.length > 0) onFilesAdded(files)
    },
    [disabled, onFilesAdded]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) onFilesAdded(files)
    // reset so the same file can be selected again
    e.target.value = ""
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10
        cursor-pointer transition-all duration-300
        ${isDragging ? "animated-border amber-glow bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/[0.02]"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div className={`rounded-full p-3 transition-colors duration-300 ${isDragging ? "bg-primary/15" : "bg-muted"}`}>
        <Upload className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">Drop video files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports MP4, WebM, MOV, AVI, MKV, and more
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_VIDEO_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
