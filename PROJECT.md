# Claw Installer Project

## Objective
Build a cross-platform visual installer and deployment console for OpenClaw across macOS, Windows, and Linux.

## Current Phase
- Phase 0: scaffold + architecture
- Phase 1: installer wizard shell

## MVP Scope
- Installer welcome / path / environment / mode / progress / basic config / channels / done
- Dashboard shell
- IPC bridge
- environment detection skeleton
- install orchestration skeleton

## Progress Reporting
Hourly progress summaries should be sent to Wilson.

## Rules
- Prefer incremental, stable commits
- Keep platform differences behind adapter layer
- Default to safer local-only config posture
