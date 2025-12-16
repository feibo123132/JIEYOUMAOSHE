## 方案概述
- 放弃短信登录，改为“账号+密码”登录 + 游客登录。
- 账号体系仅用于 Demo：后端云函数完成注册与登录，密码哈希存储；前端只持有会话标识（uid）。
- 游客登录使用 CloudBase 匿名登录（已可用）。

## 数据模型
- 集合 `Cat_users` 增加字段：
  - `username: string`（唯一）
  - `passwordHash: string`（bcryptjs 哈希）
  - `authType: 'password' | 'guest'`（默认 'guest'）
- 索引：`username` 唯一；`id` 唯一（现有）。

## 云函数（auth）
- 新增 `cloudfunctions/auth/index.js` + `package.json`：
  - 依赖：`bcryptjs`（纯JS，无原生编译问题）
- 动作：
  - `register`: 入参 `{username, password}` → 检查重复 → `bcryptjs.hash` → 写入 `Cat_users` → 返回 `{uid}`
  - `login`: 入参 `{username, password}` → 查找 → `bcryptjs.compare` → 返回 `{uid}`
  - `logout`: 可选（前端清除本地会话即可）
- 说明：为 Demo 简化，使用 CloudBase 匿名认证访问数据库；会话 `uid` 存 `localStorage.tcb_auth`。

## 前端服务（src/services/cloudbase.ts）
- 新增：
  - `registerUser(username, password)`: 调用云函数 `auth` → 返回 `uid`
  - `loginUser(username, password)`: 调用云函数 `auth` → 返回 `uid`
  - `guestLogin()`: `ensureLogin()` 后生成/获取匿名 `uid`（沿用当前匿名登录），创建 `Cat_users` 记录（`authType:'guest'`）。
- 成功后统一：`localStorage.tcb_auth = uid` → `getOrCreateUser(uid)`。

## 页面与路由
- `Login` 页：
  - 切换到“账号 + 密码”输入（移除短信UI）；按钮：`登录`、`注册`、`游客登录`。
  - 登录：调用 `loginUser`；注册：调用 `registerUser`；游客登录：调用 `guestLogin`。
- `Register` 页：可保留或在 `Login` 页内弹出注册表单。
- 受保护路由：保持不变（读取 `tcb_auth`）。

## 安全与限制（Demo）
- 仅存密码哈希，不存明文；不在日志中打印密码。
- 简单校验（用户名长度、密码强度）；可加1分钟内尝试次数限制（可选）。
- 正式环境需改为供后端签发令牌的“自有登录”或 CloudBase 自带的“邮箱/手机号登录”。

## 实施步骤
1. 新增 `cloudfunctions/auth/index.js` 与 `package.json`（bcryptjs），部署并安装依赖。
2. 在 `src/services/cloudbase.ts` 添加 `registerUser/loginUser/guestLogin`；复用 `ensureLogin/getOrCreateUser`。
3. 修改 `src/pages/Login.tsx` 为账号+密码+游客登录交互；移除短信按钮与逻辑。
4. 验证：注册→登录→受保护页面可用；游客登录→可用；刷新后会话保留。

## 验证清单
- 云函数日志显示 `register/login` 调用成功；数据库出现 `username/passwordHash/authType`。
- 前端登录后 `localStorage.tcb_auth` 写入；`Profile` 显示用户信息；`Shop`/`Profile` 不再跳转登录。

确认后我将开始代码改造并交付上述文件变更。