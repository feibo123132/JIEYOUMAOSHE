## 执行内容
1. 在 `src/components/CatAvatar.tsx` 引入 `Variants, easeInOut` 并将 `animationVariants` 显式标注为 `Variants`。
2. 将所有 `transition.ease` 从字符串改为 `easeInOut` 函数，消除类型不兼容。
3. 保留现有动画配置与 `variants/animate` 用法不变。

## 预期结果
- `pnpm run check` 通过，CI 的 Type Check 不再报错。
- `pnpm run lint` 仅保留提示级警告（不影响构建）。
- `build` 与 `deploy` 两个 Job 顺利完成。