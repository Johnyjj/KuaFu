import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Users, LogOut, Plus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { user, isAdmin } = useAuth()

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list().then(r => r.data),
    enabled: !!localStorage.getItem('access_token'),
  })

  function handleLogout() {
    localStorage.removeItem('access_token')
    qc.clear()
    navigate('/login')
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0F172A] text-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-2 border-b border-white/10">
        <div className="w-7 h-7 rounded-md bg-white text-[#0F172A] flex items-center justify-center font-800 text-sm">K</div>
        <span className="font-700 text-base tracking-tight">KuaFu</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin space-y-0.5">
        <NavLink
          to="/projects"
          end
          className={({ isActive }) =>
            cn('flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
              isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/80')
          }
        >
          <LayoutDashboard size={15} />
          <span>项目列表</span>
        </NavLink>

        {/* Projects */}
        <div className="pt-3 pb-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[10px] font-700 uppercase tracking-wider text-white/30">项目</span>
            {isAdmin && (
              <NavLink to="/projects" className="text-white/40 hover:text-white/70 transition-colors">
                <Plus size={13} />
              </NavLink>
            )}
          </div>
          {projects.map(p => (
            <NavLink
              key={p.id}
              to={`/projects/${p.id}/tasks`}
              className={({ isActive }) =>
                cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors truncate',
                  isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80')
              }
            >
              <FolderKanban size={13} className="flex-shrink-0" />
              <span className="truncate">{p.name}</span>
            </NavLink>
          ))}
        </div>

        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              cn('flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/80')
            }
          >
            <Users size={15} />
            <span>用户管理</span>
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/10 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-700 flex-shrink-0">
          {user?.name?.[0] ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-600 truncate">{user?.name}</div>
          <div className="text-[10px] text-white/40 truncate">{user?.email}</div>
        </div>
        <button onClick={handleLogout} className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
