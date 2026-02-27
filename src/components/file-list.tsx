import { FileItem } from "@/components/file-item"
import type { FileTask } from "@/types"

interface FileListProps {
  files: FileTask[]
  onRemove: (id: string) => void
  isProcessing: boolean
}

export function FileList({ files, onRemove, isProcessing }: FileListProps) {
  if (files.length === 0) return null

  return (
    <div className="space-y-2">
      {files.map((task, index) => (
        <div
          key={task.id}
          className="animate-[fade-in-up_0.3s_ease-out_both]"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <FileItem
            task={task}
            onRemove={onRemove}
            isProcessing={isProcessing}
          />
        </div>
      ))}
    </div>
  )
}
