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

## 打包验证

```bash
cd app
npm install
npm run pack
```

产物目录：

- `app/release/linux-unpacked/`

## 今天可验收建议

优先验这 4 项：

1. 安装向导步骤切换与草稿恢复
2. 渠道配置页面的表单录入、启用开关、连接测试 Demo
3. 环境检测页的诊断报告生成与导出
4. `npm run pack` 是否能产出 `linux-unpacked`
