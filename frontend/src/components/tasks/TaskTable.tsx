import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { useUIStore } from '@/store/uiStore'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/api/types'

interface TaskTableProps {
  tasks: Task[]
}

export function TaskTable({ tasks }: TaskTableProps) {
  const openDrawer = useUIStore((s) => s.openDrawer)

  return (
    <div className="bg-white border border-[#e8e8e6] rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e8e8e6] bg-[#f7f7f5]">
            <th className="text-left px-4 py-3 font-semibold text-[#555] text-xs">任务名</th>
            <th className="text-left px-4 py-3 font-semibold text-[#555] text-xs">状态</th>
            <th className="text-left px-4 py-3 font-semibold text-[#555] text-xs">优先级</th>
            <th className="text-left px-4 py-3 font-semibold text-[#555] text-xs">负责人</th>
            <th className="text-left px-4 py-3 font-semibold text-[#555] text-xs">截止日</th>
            <th className="text-left px-4 py-3 font-semibold text-[#555] text-xs">进度</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-10 text-[#aaa]">
                暂无任务
              </td>
            </tr>
          ) : (
            tasks.map((task) => {
              const isOverdue =
                task.due_date ? new Date(task.due_date) < new Date() && task.status !== 'done' : false

              return (
                <tr
                  key={task.id}
                  onClick={() => openDrawer(task.id)}
                  className="border-b border-[#e8e8e6] last:border-0 hover:bg-[#fafafa] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[#191919]">{task.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#e8e8e6] flex items-center justify-center text-[11px] font-semibold text-[#555] flex-shrink-0">
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[#191919]">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-[#aaa]">未分配</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 ${isOverdue ? 'text-red-500' : 'text-[#8c8c8c]'}`}>
                    {task.due_date ? formatDate(task.due_date) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#555]">{task.progress}%</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
