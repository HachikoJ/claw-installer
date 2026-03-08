# Tonight Delivery

## Final delivery target
Deliver a browser-first, demo-complete `Claw Installer` build that can be accepted tonight without requiring a GUI desktop environment.

## Deliverable scope
- Browser-first installer UI via `npm run dev:web`
- Step-based installer shell
- Draft persistence
- Environment detection panel
- Channel configuration interactive demo
- Diagnosis generation and export demo
- Acceptance status panel
- Packaging verification via `npm run pack`

## Acceptance command set
```bash
cd /root/.openclaw/workspace/claw-installer/app
npm install
npm run dev:web
```

## Packaging command
```bash
cd /root/.openclaw/workspace/claw-installer/app
npm run pack
```

## Blocking note
Electron GUI end-to-end validation still requires a machine with `DISPLAY / WAYLAND_DISPLAY`.
Tonight's final acceptance path is browser-first.
