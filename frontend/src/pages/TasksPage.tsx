import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BarChart2, Users, Plus, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { tasksApi } from '@/api/tasks'
import { projectsApi } from '@/api/projects'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskTable } from '@/components/tasks/TaskTable'
import { TaskDrawer } from '@/components/tasks/TaskDrawer'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { TaskPriority } from '@/api/types'

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low',    label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high',   label: '高' },
  { value: 'urgent', label: '紧急' },
]

function CreateTaskDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const queryClient = useQueryClient()

  const { data: members } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => projectsApi.getMembers(projectId).then((r) => r.data),
    enabled: open && !!projectId,
  })

  const mutation = useMutation({
    mutationFn: () => tasksApi.create(projectId, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
      assignee_id: assigneeId || undefined,
    } as Parameters<typeof tasksApi.create>[1]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('任务创建成功')
      setOpen(false)
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      setAssigneeId('')
    },
    onError: () => toast.error('创建失败，请重试'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#191919] text-white hover:bg-[#333] h-9 px-4 text-sm font-medium rounded-md flex items-center gap-1.5">
          <Plus size={15} />
          新建任务
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建任务</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) mutation.mutate() }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">任务标题 *</label>
            <Input placeholder="请输入任务标题" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">描述</label>
            <textarea
              placeholder="任务描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] placeholder:text-[#8c8c8c] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#191919]">优先级</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#191919]">截止日期</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">指派给</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <option value="">不指派</option>
              {members?.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-[#e8e8e6] text-[#555555] h-9 px-4 text-sm">取消</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={mutation.isPending || !title.trim()}
              className="bg-[#191919] text-white hover:bg-[#333] h-9 px-4 text-sm font-medium rounded-md disabled:opacity-60"
            >
              {mutation.isPending ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />创建中...</span> : '创建'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TasksPage() {
  const { id: projectId = '' } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const drawerTaskId = useUIStore((s) => s.drawerTaskId)

  async function handleExport() {
    try {
      const response = await projectsApi.export(projectId)
      const blob = response.data as Blob
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'project-report.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('导出成功')
    } catch {
      toast.error('导出失败')
    }
  }

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksApi.list(projectId).then((r) => r.data),
    enabled: !!projectId,
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list().then((r) => r.data),
  })

  const project = projectsData?.find((p) => p.id === projectId)
  const tasks = tasksData ?? []

  return (
    <div className="min-h-full bg-[#fafafa]">
      <div className="px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            {project ? (
              <>
                <h1 className="text-xl font-bold text-[#191919]">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-[#8c8c8c] mt-0.5">{project.description}</p>
                )}
              </>
            ) : (
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && <CreateTaskDialog projectId={projectId} />}
            {isAdmin && (
              <>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#191919] border border-[#e8e8e6] rounded-md px-3 py-1.5 bg-white hover:bg-[#f7f7f5] transition-colors"
                >
                  <Download size={14} />
                  导出
                </button>
                <Link
                  to={`/projects/${projectId}/stats`}
                  className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#191919] border border-[#e8e8e6] rounded-md px-3 py-1.5 bg-white hover:bg-[#f7f7f5] transition-colors"
                >
                  <BarChart2 size={14} />
                  统计
                </Link>
                <Link
                  to={`/projects/${projectId}/members`}
                  className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#191919] border border-[#e8e8e6] rounded-md px-3 py-1.5 bg-white hover:bg-[#f7f7f5] transition-colors"
                >
                  <Users size={14} />
                  成员
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5">
          {[
            { key: 'board' as const, label: '看板' },
            { key: 'list' as const, label: '列表' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-[#191919] text-white'
                  : 'text-[#555] hover:bg-[#ebebeb]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : activeTab === 'board' ? (
          <KanbanBoard tasks={tasks} projectId={projectId} />
        ) : (
          <TaskTable tasks={tasks} />
        )}
      </div>

      {/* Drawer */}
      {drawerTaskId && (
        <TaskDrawer taskId={drawerTaskId} projectId={projectId} tasks={tasks} />
      )}
    </div>
  )
}
