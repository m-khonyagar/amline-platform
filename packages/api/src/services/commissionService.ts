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
      return { ok: false, error: 'رکورد یافت نشد' };
    }
    if (row.amountRial <= 0 || row.status !== 'pending') {
      return { ok: false, error: 'تسویه برای این رکورد مجاز نیست' };
    }
    row.status = 'requested';
    persist();
    recordAudit('commission', id, 'settlement_requested', `درخواست تسویه به مبلغ ${row.amountRial} ریال`, 'ops.system', 'system');
    return {
      ok: true,
      message: `درخواست تسویه به مبلغ ${row.amountRial.toLocaleString('fa-IR')} ریال ثبت شد. کارشناسان بررسی می‌کنند.`,
    };
  },

  approve(id: string): { ok: true } | { ok: false; error: string } {
    const row = state.commissions.find((commission) => commission.id === id);
    if (!row) {
      return { ok: false, error: 'رکورد یافت نشد' };
    }
    row.status = 'paid';
    persist();
    recordAudit('commission', id, 'settlement_approved', 'تسویه تایید شد', 'ops.finance', 'ops');
    return { ok: true };
  },

  reject(id: string, reason: string): { ok: true } | { ok: false; error: string } {
    const row = state.commissions.find((commission) => commission.id === id);
    if (!row) {
      return { ok: false, error: 'رکورد یافت نشد' };
    }
    if (!reason.trim()) {
      return { ok: false, error: 'دلیل رد اجباری است' };
    }
    row.status = 'rejected';
    row.rejectReason = reason.trim();
    persist();
    recordAudit('commission', id, 'settlement_rejected', reason.trim(), 'ops.finance', 'ops');
    return { ok: true };
  },
};
