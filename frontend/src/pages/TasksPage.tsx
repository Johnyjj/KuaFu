import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BarChart2, Users, Plus, Loader2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { tasksApi } from '@/api/tasks'
import { projectsApi } from '@/api/projects'
import { modulesApi } from '@/api/modules'
import type { ModuleCreate } from '@/api/modules'
import { ModuleSection } from '@/components/tasks/ModuleSection'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskTable } from '@/components/tasks/TaskTable'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { TaskDrawer } from '@/components/tasks/TaskDrawer'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { TaskPriority, Module } from '@/api/types'

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
]

// ── 新建模块弹窗 ─────────────────────────────────────────────
function CreateModuleDialog({ projectId, members }: { projectId: string; members: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      modulesApi.create(projectId, {
        name: name.trim(),
        description: description.trim() || undefined,
        owner_id: ownerId || undefined,
      } as ModuleCreate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', projectId] })
      toast.success('模块创建成功')
      setOpen(false)
      setName('')
      setDescription('')
      setOwnerId('')
    },
    onError: () => toast.error('创建失败，请重试'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[#e8e8e6] text-[#555] h-9 px-4 text-sm flex items-center gap-1.5">
          <Plus size={14} />
          新建模块
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader><DialogTitle>新建模块</DialogTitle></DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); if (name.trim()) mutation.mutate() }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">模块名称 *</label>
            <Input placeholder="请输入模块名称" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">描述</label>
            <textarea
              placeholder="模块描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] placeholder:text-[#8c8c8c] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">负责人</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <option value="">无负责人</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-[#e8e8e6] text-[#555] h-9 px-4 text-sm">取消</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
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

// ── 新建任务弹窗 ─────────────────────────────────────────────
function CreateTaskDialog({ projectId, modules, members }: {
  projectId: string
  modules: Module[]
  members: { id: string; name: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      tasksApi.create(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        assignee: assigneeId ? { id: assigneeId, name: '' } : null,
        module_id: moduleId || undefined,
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
      setModuleId(modules[0]?.id ?? '')
    },
    onError: () => toast.error('创建失败，请重试'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#191919] text-white hover:bg-[#333] h-9 px-4 text-sm font-medium rounded-md flex items-center gap-1.5">
          <Plus size={15} />新建任务
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader><DialogTitle>新建任务</DialogTitle></DialogHeader>
        <form
          onSubmit={(e) => { e.preventDefault(); if (title.trim()) mutation.mutate() }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">所属模块 *</label>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              required
              className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <option value="">请选择模块</option>
              {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
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
                {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-[#e8e8e6] text-[#555] h-9 px-4 text-sm">取消</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={mutation.isPending || !title.trim() || !moduleId}
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

// ── 主页面 ────────────────────────────────────────────────────
export default function TasksPage() {
  const { id: projectId = '' } = useParams<{ id: string }>()
  const { user, isAdmin } = useAuth()
  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const drawerTaskId = useUIStore((s) => s.drawerTaskId)

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksApi.list(projectId).then((r) => r.data),
    enabled: !!projectId,
  })

  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ['modules', projectId],
    queryFn: () => modulesApi.list(projectId).then((r) => r.data),
    enabled: !!projectId,
  })

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list().then((r) => r.data),
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => projectsApi.getMembers(projectId).then((r) => r.data),
    enabled: !!projectId,
  })

  const project = projectsData?.find((p) => p.id === projectId)
  const tasks = tasksData ?? []
  const modules = modulesData ?? []
  const isLoading = tasksLoading || modulesLoading

  // 按 module_id 分组
  const tasksByModule: Record<string, typeof tasks> = {}
  const unassignedTasks: typeof tasks = []
  for (const task of tasks) {
    if (task.module_id) {
      if (!tasksByModule[task.module_id]) tasksByModule[task.module_id] = []
      tasksByModule[task.module_id].push(task)
    } else {
      unassignedTasks.push(task)
    }
  }

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
            {isAdmin && <CreateModuleDialog projectId={projectId} members={members} />}
            {isAdmin && modules.length > 0 && (
              <CreateTaskDialog projectId={projectId} modules={modules} members={members} />
            )}
            {isAdmin && (
              <>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#191919] border border-[#e8e8e6] rounded-md px-3 py-1.5 bg-white hover:bg-[#f7f7f5] transition-colors"
                >
                  <Download size={14} />导出
                </button>
                <Link
                  to={`/projects/${projectId}/stats`}
                  className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#191919] border border-[#e8e8e6] rounded-md px-3 py-1.5 bg-white hover:bg-[#f7f7f5] transition-colors"
                >
                  <BarChart2 size={14} />统计
                </Link>
                <Link
                  to={`/projects/${projectId}/members`}
                  className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#191919] border border-[#e8e8e6] rounded-md px-3 py-1.5 bg-white hover:bg-[#f7f7f5] transition-colors"
                >
                  <Users size={14} />成员
                </Link>
              </>
            )}
          </div>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 mb-5">
          {([{ key: 'board', label: '看板' }, { key: 'list', label: '列表' }] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeTab === tab.key ? 'bg-[#191919] text-white' : 'text-[#555] hover:bg-[#ebebeb]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        )}

        {/* Empty state: no modules */}
        {!isLoading && modules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[#555555] text-sm font-medium">还没有模块</p>
            <p className="text-[#8c8c8c] text-xs mt-1">
              {isAdmin ? '点击「新建模块」开始规划' : '暂无模块'}
            </p>
          </div>
        )}

        {/* Module sections */}
        {!isLoading && modules.length > 0 && (
          <div>
            {modules.map((mod) => (
              <ModuleSection
                key={mod.id}
                module={mod}
                tasks={tasksByModule[mod.id] ?? []}
                projectId={projectId}
                viewMode={activeTab}
                canEdit={isAdmin || mod.owner?.id === user?.id}
                canDelete={isAdmin}
                members={members}
              />
            ))}

            {/* 未分配任务（历史数据） */}
            {unassignedTasks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 py-2 border-b border-[#e8e8e6]">
                  <span className="text-sm font-semibold text-[#8c8c8c]">未分配</span>
                  <span className="ml-auto text-[11px] font-semibold bg-[#e8e8e6] text-[#555] rounded-full px-2 py-0.5">
                    {unassignedTasks.length}
                  </span>
                </div>
                {activeTab === 'board' ? (
                  <KanbanBoard tasks={unassignedTasks} projectId={projectId} />
                ) : (
                  <TaskTable tasks={unassignedTasks} />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task drawer */}
      {drawerTaskId && (
        <TaskDrawer taskId={drawerTaskId} projectId={projectId} tasks={tasks} />
      )}
    </div>
  )
}
