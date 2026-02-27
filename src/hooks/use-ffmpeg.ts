import { useState, useRef, useCallback } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL, fetchFile } from "@ffmpeg/util"
import type { FileTask } from "@/types"
import {
  CODEC_MAP,
  CRF_MAP,
  WEBM_CRF_MAP,
  AVI_QUALITY_MAP,
  AUDIO_BITRATE,
  PIXEL_FORMAT,
} from "@/constants"

const BASE_URL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm"

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [loaded, setLoaded] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const load = useCallback(async () => {
    if (ffmpegRef.current && loaded) return
    setLoading(true)

    const ffmpeg = new FFmpeg()
    ffmpegRef.current = ffmpeg

    // load multi-threaded core from cdn via blob urls (required for coop/coep)
    await ffmpeg.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, "application/wasm"),
      workerURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.worker.js`, "text/javascript"),
    })

    setLoaded(true)
    setLoading(false)
  }, [loaded])

  const processFile = useCallback(
    async (
      task: FileTask,
      onProgress: (progress: number) => void
    ): Promise<Blob> => {
      const ffmpeg = ffmpegRef.current
      if (!ffmpeg) throw new Error("FFmpeg not loaded")

      // preserve input extension so ffmpeg can detect format reliably
      const inputExt = task.file.name.split(".").pop() || "mp4"
      const inputName = `input_${task.id}.${inputExt}`
      const ext = task.outputFormat
      const outputName = `output_${task.id}.${ext}`

      // write input file to wasm filesystem
      const fileData = await fetchFile(task.file)
      await ffmpeg.writeFile(inputName, fileData)

      // listen for progress
      const progressHandler = ({ progress }: { progress: number }) => {
        const pct = Math.min(100, Math.max(0, Math.round(progress * 100)))
        onProgress(pct)
      }
      ffmpeg.on("progress", progressHandler)

      // build ffmpeg arguments
      const args: string[] = ["-y", "-i", inputName]

      // add codec args
      args.push(...CODEC_MAP[task.outputFormat])

      // add speed presets per codec
      if (["mp4", "mov", "mkv"].includes(task.outputFormat)) {
        args.push("-preset", "ultrafast")
      } else if (task.outputFormat === "webm") {
        args.push("-deadline", "good", "-cpu-used", "5")
      }

      // ensure universal playback compatibility
      args.push("-pix_fmt", PIXEL_FORMAT)

      // add quality args
      if (task.outputFormat === "avi") {
        args.push("-q:v", String(AVI_QUALITY_MAP[task.compression]))
      } else if (task.outputFormat === "webm") {
        // libvpx uses -crf with -b:v 0 for constant quality mode
        args.push("-crf", String(WEBM_CRF_MAP[task.compression]), "-b:v", "0")
      } else {
        args.push("-crf", String(CRF_MAP[task.compression]))
      }

      // set audio bitrate for transparent quality
      args.push("-b:a", AUDIO_BITRATE)

      args.push(outputName)

      const exitCode = await ffmpeg.exec(args)
      if (exitCode !== 0) {
        // cleanup input before throwing
        await ffmpeg.deleteFile(inputName).catch(() => {})
        ffmpeg.off("progress", progressHandler)
        throw new Error(`FFmpeg exited with code ${exitCode}`)
      }

      // read output
      const data = await ffmpeg.readFile(outputName)

      // cleanup wasm filesystem
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)

      // remove progress listener
      ffmpeg.off("progress", progressHandler)

      const mimeMap: Record<string, string> = {
        mp4: "video/mp4",
        webm: "video/webm",
        mov: "video/quicktime",
        avi: "video/x-msvideo",
        mkv: "video/x-matroska",
      }

      // ffmpeg returns FileData (Uint8Array) — slice to get a plain ArrayBuffer
      const bytes = data as Uint8Array
      if (bytes.length === 0) {
        throw new Error("FFmpeg produced an empty output file")
      }
      return new Blob([bytes.slice().buffer], { type: mimeMap[ext] || "video/mp4" })
    },
    []
  )

  return { loaded, loading, load, processFile }
}
