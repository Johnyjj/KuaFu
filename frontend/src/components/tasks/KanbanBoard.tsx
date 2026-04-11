import React from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { tasksApi } from '@/api/tasks'
import type { Task, TaskStatus } from '@/api/types'

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done']

interface KanbanBoardProps {
  tasks: Task[]
  projectId: string
}

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const queryClient = useQueryClient()
  const [activeTask, setActiveTask] = React.useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const grouped = React.useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [], blocked: [] }
    for (const task of tasks) {
      map[task.status].push(task)
    }
    return map
  }, [tasks])

  function handleDragStart(event: { active: { id: string | number } }) {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const draggedTask = tasks.find((t) => t.id === active.id)
    if (!draggedTask) return

    // Determine target status: over could be a column status id or a task id
    const targetStatus = STATUSES.includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status

    if (!targetStatus || targetStatus === draggedTask.status) return

    // Optimistic update
    queryClient.setQueryData<Task[]>(['tasks', projectId], (old) =>
      old ? old.map((t) => (t.id === draggedTask.id ? { ...t, status: targetStatus } : t)) : old
    )

    try {
      await tasksApi.update(draggedTask.id, { status: targetStatus })
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    } catch {
      toast.error('更新状态失败')
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn key={status} status={status} tasks={grouped[status]} />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
