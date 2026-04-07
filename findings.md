# 研究与发现

## 设计系统（由 ui-ux-pro-max 生成）

### 布局模式
- **名称：** Minimal Single Column
- 单 CTA 焦点，大字体，大量留白，无导航混乱，移动优先

### 视觉风格
- **名称：** Micro-interactions（微交互）
- 小动画、手势驱动、触觉反馈、细腻过渡
- 适合：生产力工具、触屏 UI、企业应用
- 亮色/暗色模式：均完整支持

### 色彩系统
| 用途 | 色值 | CSS 变量 |
|------|------|----------|
| 主色 | `#2563EB` | `--color-primary` |
| 主色文字 | `#FFFFFF` | `--color-on-primary` |
| 次色 | `#3B82F6` | `--color-secondary` |
| 强调/CTA | `#059669` | `--color-accent` |
| 背景 | `#F8FAFC` | `--color-background` |
| 前景/文字 | `#0F172A` | `--color-foreground` |
| 柔和背景 | `#F1F5FD` | `--color-muted` |
| 边框 | `#E4ECFC` | `--color-border` |
| 危险色 | `#DC2626` | `--color-destructive` |
| 焦点环 | `#2563EB` | `--color-ring` |

### 字体
- **标题 + 正文：** Plus Jakarta Sans
- 定位：企业级 SaaS、B2B 生产力工具、专业易读
- Google Fonts：
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');
```

### 关键交互效果
- 悬停微动画（50-100ms）
- 加载 spinner
- 成功/错误状态动画
- 手势触发（滑动/捏合）
- 触觉反馈

### 禁忌（Anti-patterns）
- 复杂引导流程
- 性能缓慢

## 技术调研
> 待确认技术栈后填写

## 参考资料
> 待填写
