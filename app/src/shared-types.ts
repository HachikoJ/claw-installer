export type InstallStepKey =
  | 'location'
  | 'environment'
  | 'mode'
  | 'progress'
  | 'basicConfig'
  | 'channels'
  | 'done'
  | 'dashboard'
  | 'settings';

export interface StepItem {
  key: InstallStepKey;
  title: string;
  description: string;
}

export interface EnvironmentCheckItem {
  key: string;
  label: string;
  status: 'pass' | 'warn' | 'fail' | 'pending';
  detail: string;
}

export interface ChannelDraft {
  enabled: boolean;
  fields: Record<string, string>;
  lastTestResult?: 'idle' | 'success' | 'failed' | 'testing';
}
