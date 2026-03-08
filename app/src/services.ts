import type { ChannelDraft } from './shared-types';

export interface InstallerLogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface InstallerPlanItem {
  id: string;
  title: string;
  status: 'done' | 'running' | 'pending';
}

export function nextDemoPlanStep(items: InstallerPlanItem[]): InstallerPlanItem[] {
  const runningIndex = items.findIndex((item) => item.status === 'running');
  if (runningIndex === -1) return items;

  return items.map((item, index) => {
    if (index <= runningIndex) return { ...item, status: 'done' };
    if (index === runningIndex + 1) return { ...item, status: 'running' };
    return item;
  });
}

export function appendDemoLog(logs: InstallerLogEntry[], message: string): InstallerLogEntry[] {
  return [...logs, { level: 'info', message }];
}

export function testChannelConnection(_name: string, draft: ChannelDraft): 'success' | 'failed' | 'testing' {
  const filledCount = Object.values(draft.fields).filter(Boolean).length;
  const requiredCount = Object.keys(draft.fields).length;
  if (!draft.enabled) return 'failed';
  if (filledCount === 0) return 'failed';
  return filledCount >= Math.max(1, requiredCount - 1) ? 'success' : 'testing';
}

export function buildDiagnosisReport(input: {
  osType?: string;
  osVersion?: string;
  arch?: string;
  memoryGb?: number;
  hasNode?: boolean;
  cwdWritable?: boolean;
  servicePort?: string;
  hasDisplay?: boolean;
  isRoot?: boolean;
}) {
  return [
    `System: ${input.osType ?? 'unknown'} ${input.osVersion ?? ''} ${input.arch ?? ''}`.trim(),
    `Memory: ${input.memoryGb ?? '?'} GB`,
    `Node: ${input.hasNode ? 'ready' : 'missing'}`,
    `Workspace write: ${input.cwdWritable ? 'ok' : 'warn'}`,
    `Display: ${input.hasDisplay ? 'available' : 'missing (use dev:web fallback)'}`,
    `Privilege: ${input.isRoot ? 'root (needs --no-sandbox for Electron)' : 'normal user'}`,
    `Service port: ${input.servicePort ?? 'unknown'}`,
  ].join('\n');
}

export function buildAcceptanceState(input: {
  installPath: string;
  dataPath: string;
  diagnosisReport: string;
  hasPack: boolean;
  channelDrafts: Record<string, ChannelDraft>;
}) {
  const channelReadyCount = Object.values(input.channelDrafts).filter((draft) => draft.enabled).length;
  return [
    { label: '安装路径已填写', ok: Boolean(input.installPath && input.dataPath) },
    { label: '已生成诊断报告', ok: Boolean(input.diagnosisReport) },
    { label: '至少启用一个渠道', ok: channelReadyCount > 0 },
    { label: '打包能力已验证', ok: input.hasPack },
  ];
}
