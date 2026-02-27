import type { OutputFormat } from "@/types"

const SUPPORTED_FORMATS = new Set<string>(["mp4", "webm", "mov", "avi", "mkv"])

// extracts output format from a filename, defaults to mp4 if unsupported
export function getFileFormat(filename: string): OutputFormat {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  return SUPPORTED_FORMATS.has(ext) ? (ext as OutputFormat) : "mp4"
}
