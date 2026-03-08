# Acceptance Checklist

## 1. Browser fallback dev
- Run `cd app && npm run dev:web`
- Confirm the installer UI loads in browser
- Confirm step navigation works

## 2. Draft persistence
- Fill install path / data path / service port
- Refresh browser
- Confirm values are restored

## 3. Channel configuration demo
- Go to `接入配置`
- Enable/disable a channel
- Fill channel fields
- Click `测试连接`
- Confirm test result changes

## 4. Diagnosis flow
- Go to `环境检测`
- Click `生成诊断报告`
- Confirm report content is generated
- Click `导出报告`
- Confirm a file appears under `app/artifacts/`

## 5. Packaging
- Run `cd app && npm run pack`
- Confirm output exists under `app/release/linux-unpacked/`

## Browser-first acceptance path for today
- Primary path: `cd app && npm run dev:web`
- Verify the interactive installer in browser first
- Use `npm run pack` as the packaging acceptance item

## Known limitation
- Electron desktop dev still requires a graphical environment (`DISPLAY / WAYLAND_DISPLAY`)
- In this VM, browser fallback is the main acceptance path
