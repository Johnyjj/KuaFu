<template>
  <div class="progress-slider">
    <div class="track">
      <div class="fill" :style="{ width: modelValue + '%' }" />
      <input
        type="range" min="0" max="100"
        :value="modelValue"
        @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
        class="range-input"
      />
    </div>
    <span class="value">{{ modelValue }}%</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: number }>()
defineEmits<{ 'update:modelValue': [value: number] }>()
</script>

<style scoped>
.progress-slider { display: flex; align-items: center; gap: 10px; }
.track { flex: 1; position: relative; height: 8px; }
.fill {
  position: absolute; left: 0; top: 0; height: 8px;
  background: var(--color-primary); border-radius: 4px;
  pointer-events: none; transition: width 100ms;
}
.range-input {
  position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 100%; height: 8px; opacity: 0; cursor: pointer; margin: 0;
}
.track::before {
  content: ''; display: block; width: 100%; height: 8px;
  background: var(--color-border); border-radius: 4px;
}
.value { font-size: 13px; font-weight: 600; color: var(--color-foreground); min-width: 36px; }
</style>
