## 问题分析
1. 构建失败的唯一错误是 `src/pages/Home.tsx:155` 的 `Unexpected any`（来源：`handleInteraction(type.id as any)`）。
2. 两个黄色警告来自 `react-refresh/only-export-components` 规则，属于提示，不会导致失败；可后续再优化结构或将非组件导出拆分至独立文件。
3. 远端分支上 `Home.tsx` 还存在未用的导入与向 `InteractionButton` 传递已移除的 `name` 属性，建议同步清理以保证 lint 通过。

## 修改方案
### 1. 去除 `any` 的断言并强类型化互动类型
- 在 `src/pages/Home.tsx` 顶部增加类型：
```ts
 type InteractionType = 'feed' | 'pet' | 'bath' | 'play' | 'sleep'
```
- 将 `interactionTypes` 的 `id` 显式声明为 `InteractionType`：
```ts
 const interactionTypes: { id: InteractionType; name: string; icon: string; color: string }[] = [
   { id: 'feed', name: '喂食', icon: '🍽️', color: 'bg-orange-400' },
   { id: 'pet', name: '撸猫', icon: '🤗', color: 'bg-pink-400' },
   { id: 'bath', name: '洗澡', icon: '🛁', color: 'bg-blue-400' },
   { id: 'play', name: '逗猫', icon: '🎾', color: 'bg-green-400' },
   { id: 'sleep', name: '哄睡', icon: '😴', color: 'bg-purple-400' }
 ]
```
- 更新点击处理，不再使用 `any`：
```tsx
 onClick={() => handleInteraction(type.id)}
```

### 2. 清理未使用的导入与属性
- `src/pages/Home.tsx`：移除未用的 `Link、Heart、ShoppingBag、User、Sparkles` 导入（保留实际使用的）。
- `src/components/InteractionButton.tsx`：确保接口不含 `name` 字段；`Home.tsx` 对该组件不再传递 `name`。
- `src/components/Navigation.tsx`：确认未使用的 `motion` 已删除（若仍存在则移除）。

### 3.（可选）处理 react-refresh 警告
- 这是提示级别，不影响构建。若希望消除：
  - 将 `useApp` 等非组件导出迁移到独立文件（例如 `src/contexts/useApp.ts`），让 `AppContext.tsx` 仅导出组件；或在 `.eslintrc` 中将该规则调为 `warn`。

## 验证步骤
1. 本地运行：`pnpm run lint` 应无 error（可能保留 warn）。
2. 运行：`pnpm run build` 成功产出 `dist`。
3. 推送到 `main` 后，Actions 的 `build` Job 通过，随后 `deploy` 成功。

## 你需要执行的操作
1. 按上述修改更新文件（尤其是 `Home.tsx` 的类型与点击事件）。
2. 提交并推送：
   - `git add -A && git commit -m "fix: type InteractionType & remove any" && git push`
3. 在 GitHub Actions 观察工作流，确认 `build` 通过后查看 `deploy` 输出中的 `page_url` 访问站点。

若确认此方案，我将直接为你提交这些代码调整并触发一次构建。