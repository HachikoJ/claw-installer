# Claw Installer

`Claw Installer` 是一个面向 `macOS / Windows / Linux` 的 OpenClaw 可视化安装与部署控制台。

## 当前可验收能力

- 安装向导基础流程
- Electron 主进程 + preload + IPC 环境桥接
- 默认安装路径 / 数据路径自动注入
- 安装草稿持久化
- Dashboard / Settings 控制台壳
- 安装编排 demo
- 日志面板
- 渠道配置可交互 Demo
- 诊断报告生成与导出 Demo
- `npm run pack` 打包验证通过
- Windows 打包目标配置已补齐（`nsis / portable / zip`）
- 无图形环境下可走浏览器 fallback 开发路径

## 本地开发

### 浏览器模式（当前 VM 推荐）

```bash
cd app
npm install
npm run dev:web
```

### 桌面模式（需要图形环境）

```bash
cd app
npm install
npm run dev
```

如果当前机器没有 `DISPLAY / WAYLAND_DISPLAY`，Electron 桌面窗口无法直接启动，此时请使用浏览器模式继续开发与验收。

## 打包

### 通用目录打包验证

```bash
cd app
npm install
npm run pack
```

### Windows 打包

```bash
cd app
npm install
npm run pack:win
```

### Linux 打包

```bash
cd app
npm install
npm run pack:linux
```

### macOS 打包

```bash
cd app
npm install
npm run pack:mac
```

产物目录：

- `app/release/`

## 今天可验收建议

优先按下面顺序验：

1. `cd app && npm run dev:web`
2. 验安装向导步骤切换与草稿恢复
3. 验渠道配置页的表单录入、启用开关、连接测试 Demo
4. 验环境检测页的诊断报告生成与导出
5. 验 `npm run pack` 是否能产出 `release`

## 当前限制

- 这台 VM 没有图形环境，因此今天的主验收路径应以 `dev:web` 为主
- Windows `.exe` 最终建议在真实 Windows 机器上执行 `npm run pack:win` 并完成 GUI 验收
