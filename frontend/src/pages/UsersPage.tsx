import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import type { User } from '@/api/types'

export function UsersPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.listUsers().then(r => r.data),
    enabled: isAdmin,
  })

  const createUserMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
      authApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('用户已创建')
      setForm({ name: '', email: '', password: '', role: 'member' })
      setDialogOpen(false)
    },
    onError: () => toast.error('创建失败'),
  })

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl font-bold text-[#191919] mb-2">403</p>
          <p className="text-[#8c8c8c] text-sm">无权限</p>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error('请填写所有必填项')
      return
    }
    createUserMutation.mutate(form)
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-[#191919]">用户管理</h1>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-[#191919] text-white hover:bg-[#333] h-9 px-4 text-sm font-semibold rounded-md">
                <UserPlus size={15} />
                创建用户
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg border border-[#e8e8e6] shadow-md w-full max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-[#191919] font-bold text-base">创建用户</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-3 py-4">
                  <div>
                    <label className="text-xs font-semibold text-[#555555] mb-1 block">姓名</label>
                    <Input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="请输入姓名"
                      className="h-9 text-sm border-[#e8e8e6] focus-visible:ring-0 focus-visible:border-[#191919]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#555555] mb-1 block">邮箱</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="请输入邮箱"
                      className="h-9 text-sm border-[#e8e8e6] focus-visible:ring-0 focus-visible:border-[#191919]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#555555] mb-1 block">密码</label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="请输入密码"
                      className="h-9 text-sm border-[#e8e8e6] focus-visible:ring-0 focus-visible:border-[#191919]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#555555] mb-1 block">角色</label>
                    <Select value={form.role} onValueChange={val => setForm(f => ({ ...f, role: val }))}>
                      <SelectTrigger className="w-full border border-[#e8e8e6] rounded-md h-9 text-sm text-[#191919]">
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-[#e8e8e6] rounded-md shadow-md">
                        <SelectItem value="member" className="text-sm text-[#191919]">成员</SelectItem>
                        <SelectItem value="admin" className="text-sm text-[#191919]">管理员</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" className="h-9 px-4 text-sm text-[#555555]">
                      取消
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    className="h-9 px-4 text-sm bg-[#191919] text-white hover:bg-[#333] rounded-md font-semibold"
                  >
                    {createUserMutation.isPending ? '创建中...' : '确认创建'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#e8e8e6] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e8e8e6] bg-[#fafafa]">
                <th className="text-left text-xs font-semibold text-[#8c8c8c] px-4 py-3">姓名</th>
                <th className="text-left text-xs font-semibold text-[#8c8c8c] px-4 py-3">邮箱</th>
                <th className="text-left text-xs font-semibold text-[#8c8c8c] px-4 py-3">角色</th>
                <th className="text-left text-xs font-semibold text-[#8c8c8c] px-4 py-3">创建时间</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#e8e8e6]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-24 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-40 rounded" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></td>
                  </tr>
                ))
              ) : !users || users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-[#8c8c8c]">
                    暂无用户
                  </td>
                </tr>
              ) : (
                users.map((u: User) => (
                  <tr key={u.id} className="border-b border-[#e8e8e6] last:border-0 hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#191919] text-white flex items-center justify-center text-xs font-bold uppercase select-none">
                          {u.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-[#191919]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#555555]">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          u.role === 'admin'
                            ? 'text-xs font-semibold px-2 py-0.5 rounded-full bg-[#191919] text-white'
                            : 'text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f7f7f5] text-[#555555]'
                        }
                      >
                        {u.role === 'admin' ? '管理员' : '成员'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#8c8c8c]">{formatDate(u.created_at)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
