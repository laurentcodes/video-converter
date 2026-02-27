import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FORMAT_OPTIONS, COMPRESSION_OPTIONS } from "@/constants"
import type { OutputFormat, CompressionPreset, ProcessingMode } from "@/types"

interface ConversionSettingsProps {
  mode: ProcessingMode
  onModeChange: (mode: ProcessingMode) => void
  format: OutputFormat
  compression: CompressionPreset
  onFormatChange: (format: OutputFormat) => void
  onCompressionChange: (preset: CompressionPreset) => void
  disabled: boolean
}

export function ConversionSettings({
  mode,
  onModeChange,
  format,
  compression,
  onFormatChange,
  onCompressionChange,
  disabled,
}: ConversionSettingsProps) {
  // filter out "none" in compress mode since it would be pointless
  const compressionOptions =
    mode === "compress"
      ? COMPRESSION_OPTIONS.filter((opt) => opt.value !== "none")
      : COMPRESSION_OPTIONS

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/50 p-1 w-fit">
        <Button
          variant={mode === "convert" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("convert")}
          disabled={disabled}
          className={mode === "convert" ? "shadow-[0_0_10px_oklch(0.75_0.16_75/0.2)]" : ""}
        >
          Convert
        </Button>

        <Button
          variant={mode === "compress" ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange("compress")}
          disabled={disabled}
          className={mode === "compress" ? "shadow-[0_0_10px_oklch(0.75_0.16_75/0.2)]" : ""}
        >
          Compress
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {mode === "convert" && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">Output Format</label>
            <Select
              value={format}
              onValueChange={(v) => onFormatChange(v as OutputFormat)}
              disabled={disabled}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium whitespace-nowrap">Compression</label>
          <Select
            value={compression}
            onValueChange={(v) => onCompressionChange(v as CompressionPreset)}
            disabled={disabled}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {compressionOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
