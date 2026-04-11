import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import ProjectsPage from '@/pages/ProjectsPage'
import TasksPage from '@/pages/TasksPage'
import { MembersPage } from '@/pages/MembersPage'
import { StatsPage } from '@/pages/StatsPage'
import { UsersPage } from '@/pages/UsersPage'
import { RequireAuth } from '@/components/layout/RequireAuth'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<Navigate to="tasks" replace />} />
              <Route path="/projects/:id/tasks" element={<TasksPage />} />
              <Route path="/projects/:id/members" element={<MembersPage />} />
              <Route path="/projects/:id/stats" element={<StatsPage />} />
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}
