# Video Converter

A browser-based video converter and compressor powered by FFmpeg.wasm. Convert and compress videos entirely client-side with no server uploads required.

## Features

- **Convert** videos between formats (MP4, WebM, MOV, AVI, MKV, and more)
- **Compress** videos with adjustable presets (light, medium, heavy)
- **Batch processing** — queue multiple files at once
- **Download all** completed files in one click
- **100% client-side** — files never leave your browser
- **Dark cinematic UI** with amber/gold accents, film grain overlay, and glass morphism

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- FFmpeg.wasm
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

The dev server must serve with Cross-Origin Isolation headers (COOP/COEP) for `SharedArrayBuffer` support, which FFmpeg.wasm requires. The Vite config handles this automatically.

### Build

```bash
npm run build
npm run preview
```

## Usage

1. Drop video files onto the drop zone or click to browse
2. Choose **Convert** or **Compress** mode
3. Select an output format and/or compression preset
4. Click **Start Conversion** / **Start Compression**
5. Download individual files or use **Download All**

## License

MIT
