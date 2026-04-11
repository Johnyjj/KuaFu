import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, UserPlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { projectsApi } from '@/api/projects'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/button'
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
import type { User } from '@/api/types'

export function MembersPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = id!
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => projectsApi.getMembers(projectId).then(r => r.data),
  })

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.listUsers().then(r => r.data),
    enabled: isAdmin,
  })

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.addMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] })
      toast.success('成员已添加')
      setSelectedUserId('')
      setDialogOpen(false)
    },
    onError: () => toast.error('添加失败'),
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] })
      toast.success('成员已移除')
    },
    onError: () => toast.error('移除失败'),
  })

  const memberIds = new Set(members?.map((m: User) => m.id) ?? [])
  const availableUsers = (allUsers ?? []).filter((u: User) => !memberIds.has(u.id))

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${projectId}/tasks`}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-[#f0f0ee] transition-colors text-[#555555]"
            >
              <ChevronLeft size={18} />
            </Link>
            <h1 className="text-xl font-bold text-[#191919]">成员管理</h1>
          </div>

          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-[#191919] text-white hover:bg-[#333] h-9 px-4 text-sm font-semibold rounded-md">
                  <UserPlus size={15} />
                  添加成员
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white rounded-lg border border-[#e8e8e6] shadow-md w-full max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-[#191919] font-bold text-base">添加成员</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {usersLoading ? (
                    <Skeleton className="h-9 w-full rounded-md" />
                  ) : availableUsers.length === 0 ? (
                    <p className="text-sm text-[#8c8c8c] text-center py-2">暂无可添加的用户</p>
                  ) : (
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="w-full border border-[#e8e8e6] rounded-md h-9 text-sm text-[#191919]">
                        <SelectValue placeholder="选择用户" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-[#e8e8e6] rounded-md shadow-md">
                        {availableUsers.map((u: User) => (
                          <SelectItem key={u.id} value={u.id} className="text-sm text-[#191919]">
                            {u.name} ({u.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <DialogFooter className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <Button variant="ghost" className="h-9 px-4 text-sm text-[#555555]">
                      取消
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={() => selectedUserId && addMemberMutation.mutate(selectedUserId)}
                    disabled={!selectedUserId || addMemberMutation.isPending}
                    className="h-9 px-4 text-sm bg-[#191919] text-white hover:bg-[#333] rounded-md font-semibold"
                  >
                    {addMemberMutation.isPending ? '添加中...' : '确认添加'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Members list */}
        {membersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !members || members.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#e8e8e6] p-8 shadow-sm text-center">
            <p className="text-[#8c8c8c] text-sm">暂无成员</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member: User) => (
              <div
                key={member.id}
                className="bg-white rounded-lg border border-[#e8e8e6] p-4 shadow-sm flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#191919] text-white flex items-center justify-center text-sm font-bold uppercase select-none">
                  {member.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#191919]">{member.name}</span>
                    <span
                      className={
                        member.role === 'admin'
                          ? 'text-xs font-semibold px-2 py-0.5 rounded-full bg-[#191919] text-white'
                          : 'text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f7f7f5] text-[#555555]'
                      }
                    >
                      {member.role === 'admin' ? '管理员' : '成员'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8c8c8c] mt-0.5 truncate">{member.email}</p>
                </div>

                {/* Remove button (admin only) */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMemberMutation.mutate(member.id)}
                    disabled={removeMemberMutation.isPending}
                    className="flex-shrink-0 h-8 w-8 p-0 text-[#dc2626] hover:bg-red-50 rounded-md"
                    title="移除成员"
                  >
                    <Trash2 size={15} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
