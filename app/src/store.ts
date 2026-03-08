import { create } from 'zustand';
import type { ChannelDraft, InstallStepKey } from './shared-types';
import { defaultChannelDrafts } from './channel-presets';

export interface InstallerDraft {
  activeStep: InstallStepKey;
  installPath: string;
  dataPath: string;
  servicePort: string;
  accessMode: string;
  channelDrafts: Record<string, ChannelDraft>;
  diagnosisReport: string;
}

interface InstallerStore extends InstallerDraft {
  setDraft: (partial: Partial<InstallerDraft>) => void;
  updateChannelField: (channel: string, field: string, value: string) => void;
  toggleChannel: (channel: string, enabled: boolean) => void;
  setChannelTestResult: (channel: string, result: ChannelDraft['lastTestResult']) => void;
  setDiagnosisReport: (report: string) => void;
  resetDraft: () => void;
}

const defaultDraft: InstallerDraft = {
  activeStep: 'location',
  installPath: '',
  dataPath: '',
  servicePort: '18789',
  accessMode: 'local_only',
  channelDrafts: defaultChannelDrafts as Record<string, ChannelDraft>,
  diagnosisReport: '',
};

const storageKey = 'claw-installer-draft';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function persistState(state: InstallerDraft) {
  if (!canUseStorage()) return;
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadDraft(): InstallerDraft {
  if (!canUseStorage()) return defaultDraft;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultDraft;
    return { ...defaultDraft, ...JSON.parse(raw) };
  } catch {
    return defaultDraft;
  }
}

export const useInstallerStore = create<InstallerStore>((set, get) => ({
  ...defaultDraft,
  ...loadDraft(),
  setDraft: (partial) => {
    const next = { ...get(), ...partial };
    set(partial);
    persistState({
      activeStep: next.activeStep,
      installPath: next.installPath,
      dataPath: next.dataPath,
      servicePort: next.servicePort,
      accessMode: next.accessMode,
      channelDrafts: next.channelDrafts,
      diagnosisReport: next.diagnosisReport,
    });
  },
  updateChannelField: (channel, field, value) => {
    const current = get();
    const nextDrafts = {
      ...current.channelDrafts,
      [channel]: {
        ...current.channelDrafts[channel],
        fields: {
          ...current.channelDrafts[channel].fields,
          [field]: value,
        },
      },
    };
    set({ channelDrafts: nextDrafts });
    persistState({ ...get(), channelDrafts: nextDrafts });
  },
  toggleChannel: (channel, enabled) => {
    const current = get();
    const nextDrafts = {
      ...current.channelDrafts,
      [channel]: {
        ...current.channelDrafts[channel],
        enabled,
      },
    };
    set({ channelDrafts: nextDrafts });
    persistState({ ...get(), channelDrafts: nextDrafts });
  },
  setChannelTestResult: (channel, result) => {
    const current = get();
    const nextDrafts = {
      ...current.channelDrafts,
      [channel]: {
        ...current.channelDrafts[channel],
        lastTestResult: result,
      },
    };
    set({ channelDrafts: nextDrafts });
    persistState({ ...get(), channelDrafts: nextDrafts });
  },
  setDiagnosisReport: (report) => {
    set({ diagnosisReport: report });
    persistState({ ...get(), diagnosisReport: report });
  },
  resetDraft: () => {
    if (canUseStorage()) {
      localStorage.removeItem(storageKey);
    }
    set(defaultDraft);
  },
}));
