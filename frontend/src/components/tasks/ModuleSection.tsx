import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { KanbanBoard } from './KanbanBoard'
import { TaskTable } from './TaskTable'
import { modulesApi } from '@/api/modules'
import type { ModuleUpdate } from '@/api/modules'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import type { Module, Task, User } from '@/api/types'

interface ModuleSectionProps {
  module: Module
  tasks: Task[]
  projectId: string
  viewMode: 'board' | 'list'
  canEdit: boolean
  canDelete: boolean
  members: User[]
}

function EditModuleDialog({
  module,
  members,
  projectId,
}: {
  module: Module
  members: User[]
  projectId: string
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(module.name)
  const [description, setDescription] = useState(module.description ?? '')
  const [ownerId, setOwnerId] = useState(module.owner?.id ?? '')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () =>
      modulesApi.update(module.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        owner_id: ownerId || undefined,
      } as ModuleUpdate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', projectId] })
      toast.success('模块已更新')
      setOpen(false)
    },
    onError: () => toast.error('更新失败'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setName(module.name); setDescription(module.description ?? ''); setOwnerId(module.owner?.id ?? ''); setOpen(true) }}
          className="flex items-center gap-1 text-xs text-[#8c8c8c] hover:text-[#191919] px-2 py-1 rounded hover:bg-[#f0f0ee] transition-colors"
        >
          <Pencil size={12} />
          编辑
        </button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>编辑模块</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            if (name.trim()) mutation.mutate()
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">模块名称</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#191919]">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[#e8e8e6] bg-white px-3 py-2 text-sm text-[#191919] placeholder:text-[#8c8c8c] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent resize-none"
              placeholder="模块描述（可选）"
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
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
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
              {mutation.isPending ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ModuleSection({
  module,
  tasks,
  projectId,
  viewMode,
  canEdit,
  canDelete,
  members,
}: ModuleSectionProps) {
  const [collapsed, setCollapsed] = useState(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => modulesApi.delete(module.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules', projectId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('模块已删除')
    },
    onError: () => toast.error('删除失败'),
  })

  function handleDelete() {
    if (!window.confirm(`确定删除模块「${module.name}」？该模块下的所有任务将同步删除，此操作不可恢复。`)) return
    deleteMutation.mutate()
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3 py-2 border-b border-[#e8e8e6]">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {collapsed ? (
            <ChevronRight size={16} className="text-[#8c8c8c] flex-shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-[#8c8c8c] flex-shrink-0" />
          )}
          <span className="font-semibold text-sm text-[#191919] truncate">{module.name}</span>
          {module.description && (
            <span className="text-xs text-[#8c8c8c] truncate hidden sm:inline">{module.description}</span>
          )}
          {module.owner && (
            <div className="flex items-center gap-1 ml-1 flex-shrink-0">
              <div className="w-5 h-5 rounded-full bg-[#e8e8e6] flex items-center justify-center text-[10px] font-semibold text-[#555]">
                {module.owner.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-[#8c8c8c]">{module.owner.name}</span>
            </div>
          )}
          <span className="ml-auto flex-shrink-0 text-[11px] font-semibold bg-[#e8e8e6] text-[#555] rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          {canEdit && (
            <EditModuleDialog module={module} members={members} projectId={projectId} />
          )}
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-xs text-[#dc2626] hover:text-[#b91c1c] px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              删除
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        viewMode === 'board' ? (
          <KanbanBoard tasks={tasks} projectId={projectId} />
        ) : (
          <TaskTable tasks={tasks} />
        )
      )}
    </div>
  )
}
