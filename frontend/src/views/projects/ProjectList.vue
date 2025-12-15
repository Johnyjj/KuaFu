<template>
  <div class="project-list">
    <div class="header">
      <h2>项目列表</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        创建项目
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col
        v-for="project in projects"
        :key="project.project_id"
        :span="8"
      >
        <el-card class="project-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ project.name }}</span>
              <el-tag :type="getStatusType(project.status)">
                {{ getStatusText(project.status) }}
              </el-tag>
            </div>
          </template>

          <div class="project-info">
            <p>{{ project.description }}</p>

            <div class="progress-section">
              <div class="progress-label">
                <span>进度</span>
                <span>{{ project.task_progress.percentage }}%</span>
              </div>
              <el-progress
                :percentage="project.task_progress.percentage"
                :color="getProgressColor(project.task_progress.percentage)"
              />
            </div>

            <div class="stats">
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>{{ project.task_progress.total }} 个任务</span>
              </div>
              <div class="stat-item">
                <el-icon><Check /></el-icon>
                <span>{{ project.task_progress.completed }} 已完成</span>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="card-footer">
              <el-button size="small" @click="viewProject(project.project_id)">
                查看详情
              </el-button>
              <el-button size="small" @click="editProject(project.project_id)">
                编辑
              </el-button>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建项目对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建项目"
      width="500px"
    >
      <el-form :model="newProject" label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="newProject.name" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input
            v-model="newProject.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createProject">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/project'
import type { CreateProjectRequest } from '@/types/project'
import { Document, Check } from '@element-plus/icons-vue'

const router = useRouter()
const projectStore = useProjectStore()

const showCreateDialog = ref(false)
const newProject = ref<CreateProjectRequest>({
  name: '',
  description: '',
  owner_id: '', // 需要从认证上下文获取
})

const projects = ref([])

onMounted(async () => {
  try {
    // TODO: 从认证上下文获取用户ID
    newProject.value.owner_id = 'current-user-id'
    await projectStore.fetchProjects()
    projects.value = projectStore.projects
  } catch (error) {
    console.error('获取项目列表失败:', error)
  }
})

function getStatusType(status: string) {
  const typeMap: Record<string, any> = {
    planning: '',
    active: 'success',
    on_hold: 'warning',
    completed: 'success',
    cancelled: 'danger',
  }
  return typeMap[status] || ''
}

function getStatusText(status: string) {
  const textMap: Record<string, string> = {
    planning: '计划中',
    active: '活跃',
    on_hold: '暂停',
    completed: '已完成',
    cancelled: '已取消',
  }
  return textMap[status] || status
}

function getProgressColor(percentage: number) {
  if (percentage < 30) return '#f56c6c'
  if (percentage < 70) return '#e6a23c'
  return '#67c23a'
}

function viewProject(projectId: string) {
  router.push(`/projects/${projectId}`)
}

function editProject(projectId: string) {
  router.push(`/projects/${projectId}`)
}

async function createProject() {
  try {
    await projectStore.createProject(newProject.value)
    showCreateDialog.value = false
    newProject.value = {
      name: '',
      description: '',
      owner_id: newProject.value.owner_id,
    }
  } catch (error) {
    console.error('创建项目失败:', error)
  }
}
</script>

<style scoped>
.project-list {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.project-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-info {
  min-height: 200px;
}

.progress-section {
  margin: 20px 0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.stats {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
