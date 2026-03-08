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

export function testChannelConnection(_name: string, draft: ChannelDraft): 'success' | 'failed' {
  const filledCount = Object.values(draft.fields).filter(Boolean).length;
  const requiredCount = Object.keys(draft.fields).length;
  if (!draft.enabled) return 'failed';
  return filledCount >= Math.max(1, requiredCount - 1) ? 'success' : 'failed';
}

export function buildDiagnosisReport(input: {
  osType?: string;
  osVersion?: string;
  arch?: string;
  memoryGb?: number;
  hasNode?: boolean;
  cwdWritable?: boolean;
  servicePort?: string;
}) {
  return [
    `System: ${input.osType ?? 'unknown'} ${input.osVersion ?? ''} ${input.arch ?? ''}`.trim(),
    `Memory: ${input.memoryGb ?? '?'} GB`,
    `Node: ${input.hasNode ? 'ready' : 'missing'}`,
    `Workspace write: ${input.cwdWritable ? 'ok' : 'warn'}`,
    `Service port: ${input.servicePort ?? 'unknown'}`,
  ].join('\n');
}
