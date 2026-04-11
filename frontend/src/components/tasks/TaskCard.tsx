import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PriorityBadge } from '@/components/ui/badge'
import { useUIStore } from '@/store/uiStore'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/api/types'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const openDrawer = useUIStore((s) => s.openDrawer)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  }

  const isOverdue = task.due_date ? new Date(task.due_date) < new Date() && task.status !== 'done' : false

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openDrawer(task.id)}
      className="bg-white border border-[#e8e8e6] rounded-md p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-sm text-[#191919] leading-snug flex-1">{task.title}</p>
        {task.assignee && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#e8e8e6] flex items-center justify-center text-[11px] font-semibold text-[#555]">
            {task.assignee.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mb-2">
        <PriorityBadge priority={task.priority} />
      </div>

      {task.progress > 0 && (
        <div className="mb-2">
          <div className="h-[3px] w-full bg-[#e8e8e6] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {task.due_date && (
        <p className={`text-[11px] ${isOverdue ? 'text-red-500' : 'text-[#8c8c8c]'}`}>
          {formatDate(task.due_date)}
        </p>
      )}
    </div>
  )
}
