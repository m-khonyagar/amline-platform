import { recordAudit } from './adminService';
import { readJsonState, writeJsonState } from '../utils/stateStore';

export type CommissionRecord = {
  id: string;
  advisorId: string;
  contractId: string;
  amountRial: number;
  status: 'pending' | 'requested' | 'paid' | 'rejected';
  rejectReason?: string;
};

type CommissionState = {
  version: 1;
  commissions: CommissionRecord[];
};

const stateFile = 'amline-commission-store.json';
const state = readJsonState<CommissionState>(stateFile, {
  version: 1,
  commissions: [{ id: 'com-1', advisorId: 'adv_21', contractId: 'ct-1007', amountRial: 12_000_000, status: 'pending' }],
});

function persist(): void {
  writeJsonState(stateFile, state);
}

export const commissionService = {
  list(advisorId: string): CommissionRecord[] {
    return state.commissions.filter((commission) => commission.advisorId === advisorId);
  },

  requestSettlement(
    id: string,
    advisorId: string,
  ): { ok: true; message: string } | { ok: false; error: string } {
    const row = state.commissions.find((commission) => commission.id === id && commission.advisorId === advisorId);
    if (!row) {
      return { ok: false, error: 'Ø±Ú©ÙˆØ±Ø¯ ÛŒØ§ÙØª Ù†Ø´Ø¯' };
    }
    if (row.amountRial <= 0 || row.status !== 'pending') {
      return { ok: false, error: 'ØªØ³ÙˆÛŒÙ‡ Ø¨Ø±Ø§ÛŒ Ø§ÛŒÙ† Ø±Ú©ÙˆØ±Ø¯ Ù…Ø¬Ø§Ø² Ù†ÛŒØ³Øª' };
    }
    row.status = 'requested';
    persist();
    recordAudit('commission', id, 'settlement_requested', `Ø¯Ø±Ø®ÙˆØ§Ø³Øª ØªØ³ÙˆÛŒÙ‡ Ø¨Ù‡ Ù…Ø¨Ù„Øº ${row.amountRial} Ø±ÛŒØ§Ù„`, 'ops.system', 'system');
    return {
      ok: true,
      message: `Ø¯Ø±Ø®ÙˆØ§Ø³Øª ØªØ³ÙˆÛŒÙ‡ Ø¨Ù‡ Ù…Ø¨Ù„Øº ${row.amountRial.toLocaleString('fa-IR')} Ø±ÛŒØ§Ù„ Ø«Ø¨Øª Ø´Ø¯. Ú©Ø§Ø±Ø´Ù†Ø§Ø³Ø§Ù† Ø¨Ø±Ø±Ø³ÛŒ Ù…ÛŒâ€ŒÚ©Ù†Ù†Ø¯.`,
    };
  },

  approve(id: string): { ok: true } | { ok: false; error: string } {
    const row = state.commissions.find((commission) => commission.id === id);
    if (!row) {
      return { ok: false, error: 'Ø±Ú©ÙˆØ±Ø¯ ÛŒØ§ÙØª Ù†Ø´Ø¯' };
    }
    row.status = 'paid';
    persist();
    recordAudit('commission', id, 'settlement_approved', 'ØªØ³ÙˆÛŒÙ‡ ØªØ£ÛŒÛŒØ¯ Ø´Ø¯', 'ops.finance', 'ops');
    return { ok: true };
  },

  reject(id: string, reason: string): { ok: true } | { ok: false; error: string } {
    const row = state.commissions.find((commission) => commission.id === id);
    if (!row) {
      return { ok: false, error: 'Ø±Ú©ÙˆØ±Ø¯ ÛŒØ§ÙØª Ù†Ø´Ø¯' };
    }
    if (!reason.trim()) {
      return { ok: false, error: 'Ø¯Ù„ÛŒÙ„ Ø±Ø¯ Ø§Ø¬Ø¨Ø§Ø±ÛŒ Ø§Ø³Øª' };
    }
    row.status = 'rejected';
    row.rejectReason = reason.trim();
    persist();
    recordAudit('commission', id, 'settlement_rejected', reason.trim(), 'ops.finance', 'ops');
    return { ok: true };
  },
};
