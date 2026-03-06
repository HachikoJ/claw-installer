export type InstallStepKey =
  | 'welcome'
  | 'location'
  | 'environment'
  | 'mode'
  | 'progress'
  | 'basicConfig'
  | 'channels'
  | 'done';

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
