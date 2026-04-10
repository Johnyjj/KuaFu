import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StatusBadge from '@/components/common/StatusBadge.vue'

describe('StatusBadge', () => {
  it('shows 待处理 for todo', () => {
    const w = mount(StatusBadge, { props: { status: 'todo' } })
    expect(w.text()).toBe('待处理')
    expect(w.classes()).toContain('todo')
  })
  it('shows 进行中 for in_progress', () => {
    const w = mount(StatusBadge, { props: { status: 'in_progress' } })
    expect(w.text()).toBe('进行中')
  })
  it('shows 已完成 for done', () => {
    const w = mount(StatusBadge, { props: { status: 'done' } })
    expect(w.text()).toBe('已完成')
  })
})
