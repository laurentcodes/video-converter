import { useState, useCallback, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { DropZone } from "@/components/drop-zone"
import { ConversionSettings } from "@/components/conversion-settings"
import { FileList } from "@/components/file-list"
import { ActionBar } from "@/components/action-bar"
import { useFFmpeg } from "@/hooks/use-ffmpeg"
import { useTheme } from "@/hooks/use-theme"
import { LARGE_FILE_THRESHOLD } from "@/constants"
import { getFileFormat } from "@/lib/get-file-format"
import type { FileTask, OutputFormat, CompressionPreset, ProcessingMode } from "@/types"

function App() {
  const { loaded, load, processFile } = useFFmpeg()
  const { theme, toggleTheme } = useTheme()

  const defaultSettings = {
    format: "mp4" as OutputFormat,
    compression: "none" as CompressionPreset,
  }

  const [mode, setMode] = useState<ProcessingMode>("convert")
  const [files, setFiles] = useState<FileTask[]>([])
  const [globalFormat, setGlobalFormat] = useState<OutputFormat>(defaultSettings.format)
  const [globalCompression, setGlobalCompression] = useState<CompressionPreset>(
    defaultSettings.compression
  )
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const isProcessingRef = useRef<boolean>(false)
  const filesRef = useRef<FileTask[]>(files)
  filesRef.current = files

  // detect sharedarraybuffer support
  const hasSharedArrayBuffer = typeof SharedArrayBuffer !== "undefined"

  // auto-load ffmpeg on mount
  useEffect(() => {
    load()
  }, [load])

  // beforeunload warning during processing
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isProcessingRef.current) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  const handleFilesAdded = useCallback(
    (newFiles: File[]) => {
      const tasks: FileTask[] = newFiles.map((file) => {
        if (file.size > LARGE_FILE_THRESHOLD) {
          toast.warning(`"${file.name}" is larger than 500MB — processing may be slow`)
        }

        return {
          id: crypto.randomUUID(),
          file,
          status: "queued",
          progress: 0,
          outputFormat: mode === "compress" ? getFileFormat(file.name) : globalFormat,
          compression: globalCompression,
          outputBlob: null,
          outputUrl: null,
          outputSize: null,
          error: null,
        }
      })

      setFiles((prev) => [...prev, ...tasks])
      toast.success(`Added ${tasks.length} file${tasks.length > 1 ? "s" : ""}`)
    },
    [mode, globalFormat, globalCompression]
  )

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => {
      const task = prev.find((t) => t.id === id)
      // revoke blob url on remove
      if (task?.outputUrl) URL.revokeObjectURL(task.outputUrl)
      return prev.filter((t) => t.id !== id)
    })
  }, [])

  const handleClear = useCallback(() => {
    // revoke all blob urls
    setFiles((prev) => {
      prev.forEach((t) => {
        if (t.outputUrl) URL.revokeObjectURL(t.outputUrl)
      })
      return []
    })
  }, [])

  const handleStart = useCallback(async () => {
    setIsProcessing(true)
    isProcessingRef.current = true

    // get current queued files from ref to avoid stale closure
    const queuedIds = filesRef.current.filter((f) => f.status === "queued").map((f) => f.id)

    if (mode === "convert" && globalFormat === "webm") {
      toast.info("WebM encoding can be significantly slower than other formats")
    }

    for (const id of queuedIds) {
      // set status to processing
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "processing" as const, progress: 0 } : f))
      )

      try {
        // get the latest task data from ref to avoid stale closure
        const task = filesRef.current.find((f) => f.id === id)
        if (!task) continue

        // in compress mode, use the file's own format; in convert mode, use global format
        const outputFormat = mode === "compress" ? task.outputFormat : globalFormat

        const blob = await processFile(
          { ...task, outputFormat, compression: globalCompression },
          (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === id ? { ...f, progress } : f))
            )
          }
        )

        const url = URL.createObjectURL(blob)

        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: "done" as const,
                  progress: 100,
                  outputBlob: blob,
                  outputUrl: url,
                  outputSize: blob.size,
                  outputFormat,
                  compression: globalCompression,
                }
              : f
          )
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : "Conversion failed"
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, status: "error" as const, error: message }
              : f
          )
        )
        toast.error(`Failed to convert file: ${message}`)
      }
    }

    setIsProcessing(false)
    isProcessingRef.current = false
    toast.success(mode === "convert" ? "All conversions complete" : "All compressions complete")
  }, [processFile, mode, globalFormat, globalCompression])

  const handleDownloadAll = useCallback(() => {
    const doneTasks = filesRef.current.filter((f) => f.status === "done" && f.outputUrl)
    doneTasks.forEach((task) => {
      const a = document.createElement("a")
      a.href = task.outputUrl!
      const baseName = task.file.name.replace(/\.[^.]+$/, "")
      a.download = `${baseName}.${task.outputFormat}`
      a.click()
    })
  }, [])

  const handleModeChange = useCallback(
    (newMode: ProcessingMode) => {
      setMode(newMode)

      if (newMode === "compress") {
        // default to medium compression if currently set to none
        if (globalCompression === "none") {
          setGlobalCompression("medium")
          setFiles((prev) =>
            prev.map((f) =>
              f.status === "queued" ? { ...f, compression: "medium" } : f
            )
          )
        }
        // update queued files' output format to match their input extension
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "queued"
              ? { ...f, outputFormat: getFileFormat(f.file.name) }
              : f
          )
        )
      } else {
        // switching to convert mode — update queued files to use global format
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "queued" ? { ...f, outputFormat: globalFormat } : f
          )
        )
      }
    },
    [globalFormat, globalCompression]
  )

  // update queued files when global settings change
  const handleFormatChange = useCallback((format: OutputFormat) => {
    setGlobalFormat(format)
    setFiles((prev) =>
      prev.map((f) => (f.status === "queued" ? { ...f, outputFormat: format } : f))
    )
  }, [])

  const handleCompressionChange = useCallback((compression: CompressionPreset) => {
    setGlobalCompression(compression)
    setFiles((prev) =>
      prev.map((f) => (f.status === "queued" ? { ...f, compression } : f))
    )
  }, [])

  if (!loaded) {
    return (
      <div className="film-grain min-h-screen bg-background flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.75_0.16_75_/_0.05)_0%,_transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium tracking-wide">Loading engine...</p>
        </div>
        <Toaster />
      </div>
    )
  }

  return (
    <div className="film-grain min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.75_0.16_75_/_0.05)_0%,_transparent_70%)]" />

      <div className="relative z-10 mx-auto w-full max-w-3xl space-y-6">
        <div className="animate-[fade-in-up_0.5s_ease-out_both]">
          <Header theme={theme} onToggleTheme={toggleTheme} />
        </div>

        {!hasSharedArrayBuffer && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>
              SharedArrayBuffer is not available. This app requires Cross-Origin Isolation headers.
              Please make sure you are running the dev server with COOP/COEP headers enabled.
            </p>
          </div>
        )}

        <div className="animate-[fade-in-up_0.5s_ease-out_0.15s_both]">
          <Card className="glass-card">
            <CardContent className="space-y-4 pt-6">
              <DropZone onFilesAdded={handleFilesAdded} disabled={isProcessing} />

              <Separator />

              <ConversionSettings
                mode={mode}
                onModeChange={handleModeChange}
                format={globalFormat}
                compression={globalCompression}
                onFormatChange={handleFormatChange}
                onCompressionChange={handleCompressionChange}
                disabled={isProcessing}
              />

              <FileList
                files={files}
                onRemove={handleRemove}
                isProcessing={isProcessing}
              />

              <ActionBar
                files={files}
                isProcessing={isProcessing}
                mode={mode}
                onStart={handleStart}
                onDownloadAll={handleDownloadAll}
                onClear={handleClear}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

export default App
