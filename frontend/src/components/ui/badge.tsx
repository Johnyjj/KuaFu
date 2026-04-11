import * as React from 'react'
import { cn } from '@/lib/utils'
import type { TaskStatus, TaskPriority } from '@/api/types'

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo:        { label: '待办',   className: 'bg-amber-50 text-amber-800 border-amber-200' },
  in_progress: { label: '进行中', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  done:        { label: '已完成', className: 'bg-green-50 text-green-700 border-green-200' },
  blocked:     { label: '阻塞',   className: 'bg-red-50 text-red-600 border-red-200' },
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low:    { label: '低',   className: 'bg-gray-100 text-gray-600 border-gray-200' },
  medium: { label: '中',   className: 'bg-blue-50 text-blue-700 border-blue-200' },
  high:   { label: '高',   className: 'bg-orange-50 text-orange-700 border-orange-200' },
  urgent: { label: '紧急', className: 'bg-red-50 text-red-600 border-red-200' },
}

function Badge({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', className)}
      {...props}
    >
      {children}
    </span>
  )
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = statusConfig[status]
  return <Badge className={cfg.className}>{cfg.label}</Badge>
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = priorityConfig[priority]
  return <Badge className={cfg.className}>{cfg.label}</Badge>
}

export { Badge, StatusBadge, PriorityBadge }
