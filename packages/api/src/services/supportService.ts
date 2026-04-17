import { readJsonState, writeJsonState } from '../utils/stateStore';

export type ComplaintRecord = {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: 'submitted' | 'reviewing';
  trackingCode: string;
  createdAt: string;
};

type SupportState = {
  version: 1;
  complaints: ComplaintRecord[];
};

const stateFile = 'amline-support-store.json';
const defaultState: SupportState = {
  version: 1,
  complaints: [],
};
const state = readJsonState<SupportState>(stateFile, defaultState);

function persist(): void {
  writeJsonState(stateFile, state);
}

export const supportService = {
  submit(subject: string, description: string, category = 'general'): ComplaintRecord {
    const complaint: ComplaintRecord = {
      id: `cmp_${state.complaints.length + 1}`,
      subject,
      description,
      category,
      status: 'submitted',
      trackingCode: `AML-${String(state.complaints.length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
    };

    state.complaints.unshift(complaint);
    persist();
    return complaint;
  },
  list(): ComplaintRecord[] {
    return state.complaints;
  },
};
