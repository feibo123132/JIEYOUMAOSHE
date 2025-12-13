## 问题现象
- Chrome 打开 `http://localhost:5173/`：主页显示“数据加载失败/请先登录”。
- 豆包网站同路径运行：页面正常，能读取与写入云数据。

## 可能原因
1. 安全域名未包含本地开发域：TCB Web SDK 在未授权域名上会拒绝登录，`getLoginState()`返回空 → 初始化失败。
2. 本地未配置环境变量：缺少 `VITE_CLOUDBASE_ENV_ID/VITE_CLOUDBASE_REGION` 导致 SDK 初始化失败。
3. 浏览器差异或拦截：Chrome 插件/隐私设置阻断第三方存储或网络请求；豆包环境使用受信网络或代理。
4. HTTP/HTTPS 与同源策略：本地是 `http`，云端是 `https`，跨域或混合内容被阻止。

## 验证步骤
1. 打开 Chrome 控制台（F12）→ Network/Console：
   - 观察是否出现 `domain not in security domain`、`auth` 相关报错，或 `CORS`、`Mixed Content`。
2. 检查 `.env` 或环境变量：
   - `VITE_CLOUDBASE_ENV_ID` 与 `VITE_CLOUDBASE_REGION` 是否存在且正确。
3. TCB 控制台 → 安全配置 → Web 安全域名：
   - 添加 `http://localhost:5173`、`http://127.0.0.1:5173`、以及你的 Pages 域（`https://<username>.github.io` 和仓库路径）。
4. 清理浏览器影响：
   - 关闭拦截插件，切换无痕模式；清理站点数据后重试。

## 修复计划（代码与配置）
1. 在 TCB 安全域名里新增本地开发域：`http://localhost:5173`、`http://127.0.0.1:5173`。
2. 新建或完善本地 `.env`：
   - `VITE_CLOUDBASE_ENV_ID=<你的envId>`
   - `VITE_CLOUDBASE_REGION=<你的region>`
3. 增强错误日志：在 `AppContext` 初始化与 `ensureLogin()` 处打印明确提示（登录失败/域名未授权/缺少 env），便于定位。
4. 可选：为本地开发提供后备方案
   - 若云登录失败，回退到 LocalStorage（仅 Demo），页面不报错但显示“本地模式”。
5. 可选：统一 HTTPS 开发
   - 通过 `vite` 启用本地 HTTPS（自签名证书），消除混合内容可能性。

## 原因解释：同 URL 不同网站的差异
- “豆包网站”运行环境与浏览器不同：其 Web 容器可能已配置允许域、安全策略与网络代理；而本机 Chrome 受你的本地网络、安全域设置与插件影响。
- TCB Web SDK基于“安全域名白名单”工作：未列入的来源无法登录与读写 → 业务初始化失败；豆包环境已在白名单或使用可信域，因此能正常工作。

## 交付与下一步
- 我将按上述计划完善日志与（可选）回退逻辑；你在控制台完成安全域名与环境变量配置后，重启本地开发并验证。