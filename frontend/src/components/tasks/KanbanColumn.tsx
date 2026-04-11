import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Task, TaskStatus } from '@/api/types'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
}

const statusConfig: Record<TaskStatus, { label: string; dotColor: string }> = {
  todo:        { label: '待办',   dotColor: '#92400e' },
  in_progress: { label: '进行中', dotColor: '#2563eb' },
  done:        { label: '已完成', dotColor: '#16a34a' },
  blocked:     { label: '阻塞',   dotColor: '#dc2626' },
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const cfg = statusConfig[status]

  return (
    <div className="min-w-[240px] flex-1 bg-[#f7f7f5] rounded-lg p-3 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.dotColor }}
        />
        <span className="text-sm font-semibold text-[#191919]">{cfg.label}</span>
        <span className="ml-auto text-[11px] font-semibold bg-[#e8e8e6] text-[#555] rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-[#aaa]">
              暂无任务
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}
