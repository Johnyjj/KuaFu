<template>
  <div class="stats-view">
    <div class="page-header">
      <RouterLink :to="`/projects/${route.params.id}/board`" class="back-link">
        <ChevronLeft :size="16" />项目看板
      </RouterLink>
      <h2 class="page-title">项目统计</h2>
      <button class="btn-primary" @click="handleExport" :disabled="exporting">
        {{ exporting ? '导出中…' : '导出报告' }}
      </button>
    </div>

    <div v-if="stats" class="stats-grid">
      <div class="stat-card card">
        <div class="stat-num">{{ stats.total_tasks }}</div>
        <div class="stat-label">总任务数</div>
      </div>
      <div class="stat-card card">
        <div class="stat-num" style="color: var(--color-accent)">{{ stats.by_status.done }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-card card">
        <div class="stat-num" style="color: #f59e0b">{{ stats.by_status.in_progress }}</div>
        <div class="stat-label">进行中</div>
      </div>
      <div class="stat-card card">
        <div class="stat-num">{{ stats.avg_progress }}%</div>
        <div class="stat-label">平均进度</div>
      </div>
    </div>

    <div v-if="stats" class="card member-stats">
      <h3 class="section-title">成员工作量</h3>
      <div v-for="m in stats.member_stats" :key="m.user_id" class="member-row">
        <div class="member-avatar">{{ m.name[0] }}</div>
        <span class="member-name">{{ m.name }}</span>
        <div class="member-bar-wrap">
          <div class="member-bar">
            <div class="member-fill" :style="{ width: m.total ? (m.done/m.total*100) + '%' : '0%' }" />
          </div>
        </div>
        <span class="member-count">{{ m.done }} / {{ m.total }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import { projectsApi } from '@/api/projects'
import type { ProjectStats } from '@/types'

const route = useRoute()
const stats = ref<ProjectStats | null>(null)
const exporting = ref(false)

onMounted(async () => {
  const res = await projectsApi.getStats(route.params.id as string)
  stats.value = res.data
})

async function handleExport() {
  exporting.value = true
  try {
    const res = await projectsApi.export(route.params.id as string)
    const url = URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url; a.download = 'project-report.xlsx'; a.click()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.stats-view { max-width: 800px; }
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.back-link { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--color-primary); }
.page-title { flex: 1; font-size: 20px; font-weight: 700; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-card { text-align: center; }
.stat-num { font-size: 28px; font-weight: 800; color: var(--color-primary); }
.stat-label { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
.member-stats { margin-top: 4px; }
.section-title { font-size: 14px; font-weight: 700; margin-bottom: 14px; }
.member-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--color-border); }
.member-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary); color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.member-name { width: 80px; font-size: 13px; font-weight: 600; }
.member-bar-wrap { flex: 1; }
.member-bar { height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden; }
.member-fill { height: 8px; background: var(--color-accent); border-radius: 4px; transition: width 400ms; }
.member-count { font-size: 12px; color: var(--color-text-muted); min-width: 48px; text-align: right; }
</style>
