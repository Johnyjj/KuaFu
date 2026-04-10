<template>
  <div class="stats-card card">
    <div class="stats-icon"><component :is="icon" :size="20" /></div>
    <div class="stats-body">
      <div class="stats-value">{{ value }}</div>
      <div class="stats-label">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
defineProps<{ icon: Component; value: string | number; label: string }>()
</script>

<style scoped>
.stats-card { display: flex; align-items: center; gap: 12px; }
.stats-icon { color: var(--color-primary); }
.stats-value { font-size: 22px; font-weight: 800; color: var(--color-foreground); }
.stats-label { font-size: 12px; color: var(--color-text-muted); }
</style>
