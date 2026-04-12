import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Download } from 'lucide-react'
import { toast } from 'sonner'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts'
import { projectsApi } from '@/api/projects'
import { tasksApi } from '@/api/tasks'
import { modulesApi } from '@/api/modules'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ProjectStats, Task } from '@/api/types'

const STATUS_COLORS: Record<string, string> = {
  todo: '#d97706',
  in_progress: '#2563eb',
  done: '#16a34a',
  blocked: '#dc2626',
}

const STATUS_LABELS: Record<string, string> = {
  todo: '待办',
  in_progress: '进行中',
  done: '已完成',
  blocked: '阻塞',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#2563eb',
  high: '#f97316',
  urgent: '#dc2626',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
}

function get7DayLabels() {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    result.push({ label: `周${days[d.getDay()]}`, offset: i })
  }
  return result
}

function generateMockTrend(stats: ProjectStats) {
  const labels = get7DayLabels()
  const done = stats.by_status.done ?? 0
  return labels.map(({ label }, idx) => ({
    day: label,
    完成: idx === 6 ? done : Math.max(0, Math.round(done * (0.1 + idx * 0.12))),
  }))
}

export function StatsPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id!

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', projectId],
    queryFn: () => projectsApi.getStats(projectId).then(r => r.data),
  })

  const { data: tasks } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksApi.list(projectId).then(r => r.data),
  })

  const { data: modules = [] } = useQuery({
    queryKey: ['modules', projectId],
    queryFn: () => modulesApi.list(projectId).then(r => r.data),
  })

  const handleExport = async () => {
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

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-7 w-32 rounded" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
                <Skeleton className="h-4 w-20 rounded mb-3" />
                <Skeleton className="h-9 w-16 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
              <Skeleton className="h-[220px] w-full rounded" />
            </div>
            <div className="col-span-2 bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
              <Skeleton className="h-[220px] w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const total = stats.total_tasks
  const done = stats.by_status.done ?? 0
  const blocked = stats.by_status.blocked ?? 0
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
  const avgProgress = Math.round(stats.avg_progress)

  // Pie data
  const pieData = Object.entries(stats.by_status)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ name: status, value: count }))

  // Priority counts from tasks
  const priorityCounts: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 }
  if (tasks) {
    for (const t of tasks as Task[]) {
      if (t.priority in priorityCounts) priorityCounts[t.priority]++
    }
  }
  const priorityData = Object.entries(priorityCounts).map(([key, value]) => ({
    name: PRIORITY_LABELS[key],
    value,
    key,
  }))

  // 7-day trend
  const trendData = generateMockTrend(stats)

  // Per-module stats
  const moduleStats = modules.map((mod) => {
    const modTasks = (tasks as Task[] ?? []).filter(t => t.module_id === mod.id)
    const modTotal = modTasks.length
    const modDone = modTasks.filter(t => t.status === 'done').length
    const modBlocked = modTasks.filter(t => t.status === 'blocked').length
    const modInProgress = modTasks.filter(t => t.status === 'in_progress').length
    const modTodo = modTasks.filter(t => t.status === 'todo').length
    const modCompletion = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0
    const modAvgProgress = modTotal > 0
      ? Math.round(modTasks.reduce((sum, t) => sum + t.progress, 0) / modTotal)
      : 0
    return { mod, modTotal, modDone, modBlocked, modInProgress, modTodo, modCompletion, modAvgProgress }
  })

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${projectId}/tasks`}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[#f0f0ee] transition-colors text-[#555555]"
            >
              <ChevronLeft size={18} />
            </Link>
            <h1 className="text-xl font-bold text-[#191919]">数据统计</h1>
          </div>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2 h-9 px-4 text-sm font-semibold rounded-md text-white"
            style={{ backgroundColor: '#059669' }}
          >
            <Download size={15} />
            导出 Excel
          </Button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {/* Total tasks */}
          <div className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#8c8c8c] mb-2">总任务数</p>
            <p className="text-3xl font-extrabold text-[#191919]">{total}</p>
          </div>

          {/* Completion rate */}
          <div className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#8c8c8c] mb-2">完成率</p>
            <p className="text-3xl font-extrabold text-[#191919]">{completionRate}%</p>
            <div className="mt-3 h-1.5 rounded-full bg-[#f0f0ee] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#16a34a] transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Avg progress */}
          <div className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#8c8c8c] mb-2">平均进度</p>
            <p className="text-3xl font-extrabold text-[#191919]">{avgProgress}%</p>
            <div className="mt-3 h-1.5 rounded-full bg-[#f0f0ee] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2563eb] transition-all"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>

          {/* Blocked count */}
          <div className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#8c8c8c] mb-2">阻塞任务数</p>
            <p className={cn('text-3xl font-extrabold', blocked > 0 ? 'text-[#dc2626]' : 'text-[#191919]')}>
              {blocked}
            </p>
          </div>
        </div>

        {/* Chart row 1 */}
        <div className="grid grid-cols-5 gap-4">
          {/* Donut pie chart */}
          <div className="col-span-3 bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#191919] mb-4">任务状态分布</p>
            {pieData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-[#8c8c8c]">暂无数据</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={STATUS_COLORS[entry.name] ?? '#ccc'} />
                      ))}
                    </Pie>
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={((value: unknown, name: unknown) => [value, STATUS_LABELS[String(name)] ?? String(name)]) as any}
                      contentStyle={{ fontSize: 12, border: '1px solid #e8e8e6', borderRadius: 6 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom legend */}
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {pieData.map(entry => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[entry.name] ?? '#ccc' }}
                      />
                      <span className="text-xs text-[#555555]">
                        {STATUS_LABELS[entry.name] ?? entry.name}
                        <span className="ml-1 font-semibold text-[#191919]">{entry.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Priority bar chart */}
          <div className="col-span-2 bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#191919] mb-4">优先级分布</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={priorityData}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
              >
                <XAxis type="number" tick={{ fontSize: 11, fill: '#8c8c8c' }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#555555' }}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((value: unknown) => [value, '任务数']) as any}
                  contentStyle={{ fontSize: 12, border: '1px solid #e8e8e6', borderRadius: 6 }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={PRIORITY_COLORS[entry.key] ?? '#ccc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Module breakdown */}
        {modules.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[#191919] mb-3">模块统计</p>
            <div className="grid grid-cols-1 gap-3">
              {moduleStats.map(({ mod, modTotal, modDone, modBlocked, modInProgress, modTodo, modCompletion, modAvgProgress }) => (
                <div key={mod.id} className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
                  {/* Module header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm text-[#191919] truncate">{mod.name}</span>
                      {mod.owner && (
                        <span className="text-xs text-[#8c8c8c] flex-shrink-0">负责人：{mod.owner.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 text-xs text-[#8c8c8c]">
                      <span>共 <strong className="text-[#191919]">{modTotal}</strong> 个任务</span>
                      <span>平均进度 <strong className="text-[#191919]">{modAvgProgress}%</strong></span>
                    </div>
                  </div>

                  {modTotal === 0 ? (
                    <p className="text-xs text-[#8c8c8c]">暂无任务</p>
                  ) : (
                    <>
                      {/* Stacked progress bar */}
                      <div className="flex h-2 rounded-full overflow-hidden gap-px mb-3">
                        {modDone > 0 && (
                          <div style={{ width: `${(modDone / modTotal) * 100}%`, backgroundColor: STATUS_COLORS.done }} />
                        )}
                        {modInProgress > 0 && (
                          <div style={{ width: `${(modInProgress / modTotal) * 100}%`, backgroundColor: STATUS_COLORS.in_progress }} />
                        )}
                        {modBlocked > 0 && (
                          <div style={{ width: `${(modBlocked / modTotal) * 100}%`, backgroundColor: STATUS_COLORS.blocked }} />
                        )}
                        {modTodo > 0 && (
                          <div style={{ width: `${(modTodo / modTotal) * 100}%`, backgroundColor: '#e8e8e6' }} />
                        )}
                      </div>

                      {/* Status counts + completion rate */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-3">
                          {[
                            { label: '待办', value: modTodo, color: STATUS_COLORS.todo },
                            { label: '进行中', value: modInProgress, color: STATUS_COLORS.in_progress },
                            { label: '阻塞', value: modBlocked, color: STATUS_COLORS.blocked },
                            { label: '已完成', value: modDone, color: STATUS_COLORS.done },
                          ].filter(s => s.value > 0).map(s => (
                            <div key={s.label} className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                              <span className="text-xs text-[#555]">{s.label} <strong className="text-[#191919]">{s.value}</strong></span>
                            </div>
                          ))}
                        </div>
                        <span className={cn(
                          'text-sm font-extrabold flex-shrink-0',
                          modCompletion === 100 ? 'text-[#16a34a]' : modBlocked > 0 ? 'text-[#dc2626]' : 'text-[#191919]'
                        )}>
                          {modCompletion}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart row 2 */}
        <div className="grid grid-cols-2 gap-4">
          {/* Member contribution */}
          <div className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#191919] mb-4">成员贡献</p>
            {!stats.member_stats || stats.member_stats.length === 0 ? (
              <div className="h-[160px] flex items-center justify-center text-sm text-[#8c8c8c]">暂无数据</div>
            ) : (
              <div className="space-y-3">
                {stats.member_stats.map(m => {
                  const ratio = m.total > 0 ? m.done / m.total : 0
                  return (
                    <div key={m.user_id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#191919] text-white flex items-center justify-center text-xs font-bold uppercase select-none">
                        {m.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-[#191919] truncate">{m.name}</span>
                          <span className="text-xs text-[#8c8c8c] flex-shrink-0 ml-2">
                            {m.done}/{m.total} 完成
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#f0f0ee] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#16a34a] transition-all"
                            style={{ width: `${Math.round(ratio * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 7-day trend area chart */}
          <div className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#191919] mb-4">近 7 日完成趋势</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#8c8c8c' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8c8c8c' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((value: unknown) => [value, '完成数']) as any}
                  contentStyle={{ fontSize: 12, border: '1px solid #e8e8e6', borderRadius: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="完成"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#areaGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#2563eb' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
