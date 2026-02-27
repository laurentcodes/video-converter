import type { CompressionPreset, OutputFormat } from "@/types"

export const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "mp4", label: "MP4" },
  { value: "webm", label: "WebM" },
  { value: "mov", label: "MOV" },
  { value: "avi", label: "AVI" },
  { value: "mkv", label: "MKV" },
]

export const COMPRESSION_OPTIONS: { value: CompressionPreset; label: string }[] = [
  { value: "none", label: "No Compression" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
]

// maps format to codec/container args
export const CODEC_MAP: Record<OutputFormat, string[]> = {
  mp4: ["-c:v", "libx264", "-c:a", "aac"],
  webm: ["-c:v", "libvpx", "-c:a", "libvorbis"],
  mov: ["-c:v", "libx264", "-c:a", "aac"],
  avi: ["-c:v", "mpeg4", "-c:a", "mp3"],
  mkv: ["-c:v", "libx264", "-c:a", "aac"],
}

// maps compression level to crf values (lower = better quality, bigger file)
export const CRF_MAP: Record<CompressionPreset, number> = {
  none: 18,
  light: 28,
  medium: 33,
  heavy: 40,
}

// libvpx uses a wider crf scale (4-63), needs higher values than x264
export const WEBM_CRF_MAP: Record<CompressionPreset, number> = {
  none: 15,
  light: 30,
  medium: 40,
  heavy: 50,
}

// avi uses -q:v instead of crf
export const AVI_QUALITY_MAP: Record<CompressionPreset, number> = {
  none: 2,
  light: 8,
  medium: 14,
  heavy: 22,
}

// audio bitrate for transparent quality across codecs
export const AUDIO_BITRATE = "192k"

// pixel format for universal playback compatibility
export const PIXEL_FORMAT = "yuv420p"

export const ACCEPTED_VIDEO_TYPES = "video/*,.mp4,.webm,.mov,.avi,.mkv,.flv,.wmv,.m4v"

export const LARGE_FILE_THRESHOLD = 500 * 1024 * 1024 // 500mb
