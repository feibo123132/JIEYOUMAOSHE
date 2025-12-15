## 改造内容
1) 重构服务层（src/services/cloudbase.ts）
- 新增：
  - `sendPhoneCode(phone)` → `await ensureLogin()` → `auth.sendSmsCode({ phoneNumber: phone })`（或 `auth.sendPhoneCode`，根据 SDK 实际方法兼容）→ 返回 `requestId`
  - `signInWithPhoneCode(phone, code, requestId?)` → `await ensureLogin()` → `auth.signInWithPhone({ phoneNumber: phone, code })`（或 `auth.signInWithPhoneCode`）→ 返回 `uid`
- 移除：云函数 `callLoginFunction`、`sendCode/verifyCode` 的依赖；不再调用 `login` 云函数。
- 保留：`ensureLogin`（匿名登录，持久化一次），避免“未认证不能请求”。

2) 调整登录页（src/pages/Login.tsx）
- “获取验证码”改为调用 `sendPhoneCode(phone)`，记录 `requestId`，倒计时 60s。
- “登录/注册”改为调用 `signInWithPhoneCode(phone, code, requestId)`，成功后：写入 `localStorage.tcb_auth`、拉取用户、跳转首页。
- 错误提示显示 `code/message`，便于定位（未开启手机号登录、白名单等）。

3) 初始化与受保护路由
- 保留当前 `AppContext` 初始化：顶层 `await ensureLogin()`，从 `tcb_auth` 加载用户与当日互动；未登录受保护页跳转 `/login`。

4) 云函数
- 保留目录但不再使用；如需可后续删除，避免误用。

## 预期结果
- 登录页无需云函数即可发送短信与校验；流程稳定，无“未认证/云函数依赖”报错。
- 线上/本地均一致运行；仅在控制台未开启手机号登录或域名未授权时给出明确错误信息。