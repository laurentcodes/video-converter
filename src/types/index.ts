export type OutputFormat = "mp4" | "webm" | "mov" | "avi" | "mkv"

export type ProcessingMode = "convert" | "compress"

export type CompressionPreset = "none" | "light" | "medium" | "heavy"

export type TaskStatus = "queued" | "processing" | "done" | "error"

export interface FileTask {
  id: string
  file: File
  status: TaskStatus
  progress: number
  outputFormat: OutputFormat
  compression: CompressionPreset
  outputBlob: Blob | null
  outputUrl: string | null
  outputSize: number | null
  error: string | null
}
