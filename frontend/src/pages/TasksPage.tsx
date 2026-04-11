import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, Users } from 'lucide-react'
import { tasksApi } from '@/api/tasks'
import { projectsApi } from '@/api/projects'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskTable } from '@/components/tasks/TaskTable'
import { TaskDrawer } from '@/components/tasks/TaskDrawer'
import { Skeleton } from '@/components/ui/skeleton'
import { useUIStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function TasksPage() {
  const { id: projectId = '' } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const drawerTaskId = useUIStore((s) => s.drawerTaskId)

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

          {isAdmin && (
            <div className="flex items-center gap-2">
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
            </div>
          )}
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
