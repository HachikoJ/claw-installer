# Windows Packaging

## Goal
Produce a Windows GUI-installable build for `claw-installer`.

## Added scripts
Inside `app/`:

- `npm run pack:win` → build Windows installer targets
- `npm run pack:linux`
- `npm run pack:mac`

## Windows targets
- `nsis`
- `portable`
- `zip`

## Recommended environment
Use a real Windows machine for the final `.exe` packaging and GUI verification.

## Commands
```bash
cd app
npm install
npm run pack:win
```

## Expected output
Files will be generated under:
- `app/release/`

## Notes
- Current Linux VM is suitable for source prep and browser-first verification
- Final Windows GUI acceptance should happen on Windows
- If cross-build tooling is incomplete on Linux, use a Windows host directly for reliable `.exe` output
