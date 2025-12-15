<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1 class="logo">项目管理</h1>
          <el-menu
            mode="horizontal"
            :default-active="activeMenu"
            router
          >
            <el-menu-item index="/projects">项目</el-menu-item>
            <el-menu-item index="/tasks">任务</el-menu-item>
            <el-menu-item index="/users">用户</el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
#app {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-header {
  background-color: #409eff;
  color: white;
  padding: 0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.logo {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.el-menu {
  border-bottom: none;
  background-color: transparent;
}

.el-menu-item {
  color: white;
}

.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.el-main {
  background-color: #f5f5f5;
  padding: 20px;
}
</style>
