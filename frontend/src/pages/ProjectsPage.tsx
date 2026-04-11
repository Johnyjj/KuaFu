import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FolderOpen, Plus, Loader2, Pencil } from 'lucide-react'
import { projectsApi } from '@/api/projects'
import type { Project, ProjectStatus } from '@/api/types'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { cn, formatDate } from '@/lib/utils'

// Color map based on first letter of project name
const COLOR_MAP: Record<string, string> = {
  A: '#f87171', B: '#fb923c', C: '#fbbf24', D: '#a3e635',
  E: '#34d399', F: '#2dd4bf', G: '#38bdf8', H: '#818cf8',
  I: '#c084fc', J: '#e879f9', K: '#f472b6', L: '#fb7185',
  M: '#f97316', N: '#eab308', O: '#84cc16', P: '#10b981',
  Q: '#06b6d4', R: '#3b82f6', S: '#8b5cf6', T: '#d946ef',
  U: '#ec4899', V: '#14b8a6', W: '#22c55e', X: '#0ea5e9',
  Y: '#a855f7', Z: '#6366f1',
}

function getProjectColor(name: string): string {
  const letter = name.charAt(0).toUpperCase()
  return COLOR_MAP[letter] || '#8c8c8c'
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  active:    { label: '进行中', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  completed: { label: '已完成', className: 'bg-green-50 text-green-700 border border-green-200' },
  archived:  { label: '已归档', className: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

function EditProjectDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      projectsApi.update(project.id, { name: name.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('项目已更新')
      setOpen(false)
    },
    onError: () => toast.error('更新失败，请重试'),
  })

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    setName(project.name)
    setDescription(project.description ?? '')
    setOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={handleOpen}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-[#f0f0ee] text-[#8c8c8c] hover:text-[#191919] transition-colors"
        >
          <Pencil size={13} />
        </button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>编辑项目</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            if (name.trim()) mutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">项目名称</label>
            <Input
              placeholder="请输入项目名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">项目描述</label>
            <textarea
              placeholder="请输入项目描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] placeholder:text-[#8c8c8c] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-[#e8e8e6] text-[#555555] h-9 px-4 text-sm">
                取消
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="bg-[#191919] text-white hover:bg-[#333] h-9 px-4 text-sm font-medium rounded-md disabled:opacity-60"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />保存中...</span>
              ) : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProjectCard({ project, isAdmin }: { project: Project; isAdmin: boolean }) {
  const navigate = useNavigate()
  const color = getProjectColor(project.name)
  const statusCfg = STATUS_CONFIG[project.status]

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}/tasks`)}
      className="bg-white border border-[#e8e8e6] rounded-lg p-5 cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <h3 className="text-[#191919] font-bold text-sm truncate flex-1">{project.name}</h3>
        {isAdmin && <EditProjectDialog project={project} />}
      </div>

      <p className="text-[#555555] text-sm line-clamp-2 mb-4 min-h-[2.5rem]">
        {project.description ?? '暂无描述'}
      </p>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
            statusCfg.className
          )}
        >
          {statusCfg.label}
        </span>
        <span className="text-[#8c8c8c] text-xs">{formatDate(project.created_at)}</span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#e8e8e6] rounded-lg p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-4 w-full mb-1.5" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

function CreateProjectDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => projectsApi.create({ name: name.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('项目创建成功')
      setOpen(false)
      setName('')
      setDescription('')
    },
    onError: () => {
      toast.error('创建失败，请重试')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#191919] text-white hover:bg-[#333] h-9 px-4 text-sm font-medium rounded-md flex items-center gap-1.5">
          <Plus size={15} />
          新建项目
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建项目</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">项目名称</label>
            <Input
              placeholder="请输入项目名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">项目描述</label>
            <textarea
              placeholder="请输入项目描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] placeholder:text-[#8c8c8c] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-[#e8e8e6] text-[#555555] h-9 px-4 text-sm"
              >
                取消
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="bg-[#191919] text-white hover:bg-[#333] h-9 px-4 text-sm font-medium rounded-md disabled:opacity-60"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  创建中...
                </span>
              ) : (
                '创建'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ProjectsPage() {
  const { isAdmin } = useAuth()

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list().then((r) => r.data),
  })

  const count = projects?.length ?? 0

  return (
    <div className="min-h-screen bg-[#fafafa] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#191919]">项目</h1>
          <p className="text-[#8c8c8c] text-sm mt-0.5">
            共 {isLoading ? '—' : count} 个项目
          </p>
        </div>
        {isAdmin && <CreateProjectDialog />}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && count === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center mb-4">
            <FolderOpen size={24} className="text-[#8c8c8c]" />
          </div>
          <p className="text-[#555555] text-sm font-medium">还没有项目</p>
          <p className="text-[#8c8c8c] text-xs mt-1">
            {isAdmin ? '点击「新建项目」开始创建' : '暂时没有可访问的项目'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && count > 0 && (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {projects!.map((project) => (
            <ProjectCard key={project.id} project={project} isAdmin={isAdmin} />
          ))}

          {/* Admin: add new project card */}
          {isAdmin && (
            <div className="border-2 border-dashed border-[#e8e8e6] rounded-lg flex flex-col items-center justify-center min-h-[140px] hover:border-[#c0c0bc] transition-colors duration-150">
              <CreateProjectTriggerButton />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Inline trigger inside the dashed card — reuses the same dialog
function CreateProjectTriggerButton() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const mutation = useMutation({
    mutationFn: () => projectsApi.create({ name: name.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('项目创建成功')
      setOpen(false)
      setName('')
      setDescription('')
    },
    onError: () => {
      toast.error('创建失败，请重试')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#8c8c8c] hover:text-[#555555] transition-colors"
        >
          <Plus size={20} />
          <span className="text-sm font-medium">新建项目</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建项目</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">项目名称</label>
            <Input
              placeholder="请输入项目名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">项目描述</label>
            <textarea
              placeholder="请输入项目描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] placeholder:text-[#8c8c8c] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-[#e8e8e6] text-[#555555] h-9 px-4 text-sm"
              >
                取消
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={mutation.isPending || !name.trim()}
              className="bg-[#191919] text-white hover:bg-[#333] h-9 px-4 text-sm font-medium rounded-md disabled:opacity-60"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  创建中...
                </span>
              ) : (
                '创建'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
