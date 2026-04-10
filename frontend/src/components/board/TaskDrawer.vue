<template>
  <div class="drawer-overlay" @click.self="$emit('close')">
    <div class="drawer" v-if="task">
      <!-- 头部 -->
      <div class="drawer-header">
        <h3 class="drawer-title">{{ task.title }}</h3>
        <button class="btn-ghost close-btn" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <!-- 元信息 -->
      <div class="drawer-meta">
        <div class="meta-row">
          <span class="meta-label">状态</span>
          <select v-model="localStatus" class="meta-select" :disabled="!canEdit">
            <option value="todo">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="done">已完成</option>
            <option value="blocked">已阻塞</option>
          </select>
        </div>
        <div class="meta-row">
          <span class="meta-label">优先级</span>
          <PriorityBadge :priority="task.priority" />
        </div>
        <div class="meta-row">
          <span class="meta-label">负责人</span>
          <span class="meta-value">{{ task.assignee?.name || '未分配' }}</span>
        </div>
        <div v-if="task.due_date" class="meta-row">
          <span class="meta-label">截止日期</span>
          <span class="meta-value">{{ task.due_date }}</span>
        </div>
      </div>

      <!-- 进度 -->
      <div class="drawer-section">
        <div class="section-label">完成进度</div>
        <ProgressSlider v-model="localProgress" />
      </div>

      <!-- 进展记录输入 -->
      <div v-if="canEdit" class="drawer-section">
        <div class="section-label">记录今日进展</div>
        <textarea
          v-model="logContent"
          class="log-input"
          placeholder="描述今天完成了什么…"
          rows="3"
        />
        <button
          class="btn-primary submit-btn"
          :disabled="!logContent.trim() || submitting"
          @click="handleSubmit"
        >
          {{ submitting ? '提交中…' : '提交进展' }}
        </button>
      </div>

      <!-- 历史日志 -->
      <div class="drawer-section">
        <div class="section-label">进展历史</div>
        <div v-if="logs.length === 0" class="no-logs">暂无进展记录</div>
        <div v-for="log in logs" :key="log.id" class="log-item">
          <div class="log-meta">
            <span class="log-user">{{ log.user.name }}</span>
            <span class="log-time">{{ formatTime(log.created_at) }}</span>
            <span class="log-progress">{{ log.progress }}%</span>
          </div>
          <p class="log-content">{{ log.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { Task, TaskLog, TaskStatus } from '@/types'
import { useAuthStore } from '@/stores/auth'
import PriorityBadge from '@/components/common/PriorityBadge.vue'
import ProgressSlider from '@/components/common/ProgressSlider.vue'

const props = defineProps<{ task: Task | null; logs: TaskLog[] }>()
const emit = defineEmits<{
  close: []
  submitLog: [payload: { content: string; progress: number; status: string }]
}>()

const auth = useAuthStore()
const canEdit = ref(auth.isAdmin || props.task?.assignee?.id === auth.user?.id)

const localStatus = ref<TaskStatus>(props.task?.status ?? 'todo')
const localProgress = ref(props.task?.progress ?? 0)
const logContent = ref('')
const submitting = ref(false)

watch(() => props.task, (t) => {
  if (t) {
    localStatus.value = t.status
    localProgress.value = t.progress
    canEdit.value = auth.isAdmin || t.assignee?.id === auth.user?.id
  }
}, { immediate: true })

async function handleSubmit() {
  if (!logContent.value.trim()) return
  submitting.value = true
  try {
    emit('submitLog', {
      content: logContent.value,
      progress: localProgress.value,
      status: localStatus.value,
    })
    logContent.value = ''
  } finally {
    submitting.value = false
  }
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(15,23,42,0.3);
  display: flex; justify-content: flex-end;
}
.drawer {
  width: 400px; height: 100%; background: white;
  overflow-y: auto; padding: 20px;
  box-shadow: var(--shadow-lg);
  animation: slideIn 200ms ease-out;
}
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.drawer-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.drawer-title { font-size: 16px; font-weight: 700; color: var(--color-foreground); line-height: 1.4; flex: 1; }
.close-btn { color: var(--color-text-subtle); flex-shrink: 0; }

.drawer-meta { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border); }
.meta-row { display: flex; align-items: center; gap: 10px; }
.meta-label { font-size: 12px; color: var(--color-text-subtle); width: 56px; flex-shrink: 0; }
.meta-value { font-size: 13px; color: var(--color-foreground); }
.meta-select { font-size: 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 3px 8px; background: white; }

.drawer-section { margin-bottom: 20px; }
.section-label { font-size: 12px; font-weight: 700; color: var(--color-text-subtle); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 10px; }

.log-input {
  width: 100%; border: 1px solid var(--color-border); border-radius: var(--radius-md);
  padding: 10px 12px; font-size: 13px; resize: vertical;
  transition: border-color var(--transition-fast);
}
.log-input:focus { border-color: var(--color-primary); }
.submit-btn { margin-top: 8px; width: 100%; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.no-logs { font-size: 13px; color: var(--color-text-subtle); text-align: center; padding: 16px 0; }
.log-item { padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.log-item:last-child { border-bottom: none; }
.log-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.log-user { font-size: 12px; font-weight: 600; color: var(--color-foreground); }
.log-time { font-size: 11px; color: var(--color-text-subtle); flex: 1; }
.log-progress { font-size: 11px; font-weight: 600; color: var(--color-primary); }
.log-content { font-size: 13px; color: var(--color-text-muted); line-height: 1.5; }
</style>
