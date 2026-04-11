import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { tasksApi } from '@/api/tasks'
import { Button } from '@/components/ui/button'
import { PriorityBadge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/store/uiStore'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { Task, TaskStatus } from '@/api/types'

interface TaskDrawerProps {
  taskId: string
  projectId: string
  tasks: Task[]
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: '待办' },
  { value: 'in_progress', label: '进行中' },
  { value: 'done', label: '已完成' },
  { value: 'blocked', label: '阻塞' },
]

export function TaskDrawer({ taskId, projectId, tasks }: TaskDrawerProps) {
  const closeDrawer = useUIStore((s) => s.closeDrawer)
  const queryClient = useQueryClient()

  const task = tasks.find((t) => t.id === taskId)

  const [logContent, setLogContent] = React.useState('')
  const [progress, setProgress] = React.useState(task?.progress ?? 0)
  const [status, setStatus] = React.useState<TaskStatus>(task?.status ?? 'todo')

  React.useEffect(() => {
    if (task) {
      setProgress(task.progress)
      setStatus(task.status)
    }
  }, [task])

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs', taskId],
    queryFn: () => tasksApi.getLogs(taskId).then((r) => r.data),
    enabled: !!taskId,
  })

  const addLogMutation = useMutation({
    mutationFn: () =>
      tasksApi.addLog(taskId, { content: logContent, progress, status }),
    onSuccess: () => {
      toast.success('进展已记录')
      setLogContent('')
      queryClient.invalidateQueries({ queryKey: ['logs', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
    onError: () => {
      toast.error('提交失败，请重试')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!logContent.trim()) return
    addLogMutation.mutate()
  }

  if (!task) return null

  const sortedLogs = logs ? [...logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) : []

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-lg z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-[#e8e8e6]">
          <h2 className="text-base font-semibold text-[#191919] leading-snug flex-1">
            {task.title}
          </h2>
          <button
            onClick={closeDrawer}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#f0f0ee] text-[#555] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-5">
          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[#8c8c8c] text-xs">状态</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="text-xs border border-[#e8e8e6] rounded-md px-2 py-1 bg-white text-[#191919] outline-none focus:ring-1 focus:ring-blue-400"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#8c8c8c] text-xs">优先级</span>
              <PriorityBadge priority={task.priority} />
            </div>
            {task.assignee && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#8c8c8c] text-xs">负责人</span>
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-[#e8e8e6] flex items-center justify-center text-[10px] font-semibold text-[#555]">
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-[#191919]">{task.assignee.name}</span>
                </div>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#8c8c8c] text-xs">截止日</span>
                <span className="text-xs text-[#191919]">{formatDate(task.due_date)}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-[#555]">进度</span>
              <span className="text-xs font-semibold text-[#191919]">{progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-1.5 accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Log entry form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <p className="text-xs font-medium text-[#555]">记录进展</p>
            <textarea
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              placeholder="记录今日进展…"
              rows={3}
              className="w-full text-sm border border-[#e8e8e6] rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-blue-400 resize-none text-[#191919] placeholder:text-[#bbb]"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!logContent.trim() || addLogMutation.isPending}
                className="text-xs h-8 px-4"
              >
                {addLogMutation.isPending ? '提交中…' : '提交进展'}
              </Button>
            </div>
          </form>

          {/* Log history */}
          <div>
            <p className="text-xs font-medium text-[#555] mb-2">进展历史</p>
            {logsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : sortedLogs.length === 0 ? (
              <p className="text-xs text-[#aaa] py-4 text-center">暂无进展记录</p>
            ) : (
              <div className="space-y-3">
                {sortedLogs.map((log) => (
                  <div key={log.id} className="border border-[#e8e8e6] rounded-md p-3 bg-[#fafafa]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#e8e8e6] flex items-center justify-center text-[10px] font-semibold text-[#555]">
                          {log.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-[#191919]">{log.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#8c8c8c] font-medium">{log.progress}%</span>
                        <span className="text-[10px] text-[#aaa]">{formatDateTime(log.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#555] leading-relaxed">{log.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
