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
  const nextIndex = items.findIndex((item) => item.status === 'running');
  if (nextIndex === -1) return items;

  return items.map((item, index) => {
    if (index < nextIndex) return { ...item, status: 'done' };
    if (index === nextIndex) return { ...item, status: 'done' };
    if (index === nextIndex + 1) return { ...item, status: 'running' };
    return item;
  });
}

export function appendDemoLog(logs: InstallerLogEntry[], message: string): InstallerLogEntry[] {
  return [...logs, { level: 'info', message }];
}
