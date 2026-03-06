import { create } from 'zustand';
import type { InstallStepKey } from './shared-types';

export interface InstallerDraft {
  activeStep: InstallStepKey;
  installPath: string;
  dataPath: string;
  servicePort: string;
  accessMode: string;
}

interface InstallerStore extends InstallerDraft {
  setDraft: (partial: Partial<InstallerDraft>) => void;
  resetDraft: () => void;
}

const defaultDraft: InstallerDraft = {
  activeStep: 'location',
  installPath: '',
  dataPath: '',
  servicePort: '18789',
  accessMode: 'local_only',
};

const storageKey = 'claw-installer-draft';

function loadDraft(): InstallerDraft {
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
    set(partial);
    const next = { ...get(), ...partial };
    localStorage.setItem(storageKey, JSON.stringify({
      activeStep: next.activeStep,
      installPath: next.installPath,
      dataPath: next.dataPath,
      servicePort: next.servicePort,
      accessMode: next.accessMode,
    }));
  },
  resetDraft: () => {
    localStorage.removeItem(storageKey);
    set(defaultDraft);
  },
}));
