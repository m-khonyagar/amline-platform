import { logger } from '../utils/logger';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type OtpSession = {
  code: string;
  expiresAt: number;
  attempts: number;
  lockedUntil: number;
};

const otpSessions = new Map<string, OtpSession>();
const nationalIds = new Set<string>(['0012345678']);
const blacklistedMobiles = new Set<string>(['09999999999']);
const refreshStore = new Map<string, { mobile: string; expiresAt: number }>();

const OTP_TTL_MS = 120_000;
const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60_000;

function normalizeMobile(mobile: string): string {
  return mobile.replace(/\s/g, '');
}

export function validateIranMobile(mobile: string): { ok: true; mobile: string } | { ok: false; error: string } {
  const m = normalizeMobile(mobile);
  if (!/^09\d{9}$/.test(m)) {
    return { ok: false, error: 'شماره موبایل باید ۱۱ رقم باشد' };
  }
  return { ok: true, mobile: m };
}

function randomOtp(): string {
  return String(Math.floor(100_000 + Math.random() * 900_000));
}

export const authService = {
  requestOtp(mobileRaw: string, meta?: { ip?: string }): { ok: true; expiresInSeconds: number; devHint?: string } | { ok: false; error: string } {
    const v = validateIranMobile(mobileRaw);
    if (!v.ok) {
      return { ok: false, error: v.error };
    }
    const mobile = v.mobile;
    if (blacklistedMobiles.has(mobile)) {
      logger.warn('auth_blacklist_block', { mobile, ip: meta?.ip });
      return { ok: false, error: 'این شماره مسدود شده است. با پشتیبانی تماس بگیرید' };
    }

    let session = otpSessions.get(mobile);
    const now = Date.now();
    if (!session) {
      session = { code: randomOtp(), expiresAt: now + OTP_TTL_MS, attempts: 0, lockedUntil: 0 };
    } else if (session.lockedUntil > now) {
      return { ok: false, error: 'تعداد تلاش‌ها بیش از حد مجاز است. ۵ دقیقه دیگر تلاش کنید' };
    } else {
      session.code = randomOtp();
      session.expiresAt = now + OTP_TTL_MS;
      session.attempts = 0;
    }
    otpSessions.set(mobile, session);

    logger.info('user_otp_sent', { mobile, ip: meta?.ip, expiresAt: session.expiresAt });

    return {
      ok: true,
      expiresInSeconds: Math.ceil(OTP_TTL_MS / 1000),
      devHint: process.env.NODE_ENV !== 'production' ? `کد توسعه: ${session.code}` : undefined,
    };
  },

  verifyOtp(
    mobileRaw: string,
    code: string,
    meta?: { ip?: string; device?: string },
  ):
    | { ok: true; tokens: AuthTokens; user: { id: string; mobile: string } }
    | { ok: false; error: string; code?: string } {
    const v = validateIranMobile(mobileRaw);
    if (!v.ok) {
      return { ok: false, error: v.error };
    }
    const mobile = v.mobile;
    if (blacklistedMobiles.has(mobile)) {
      return { ok: false, error: 'این شماره مسدود شده است. با پشتیبانی تماس بگیرید' };
    }

    const session = otpSessions.get(mobile);
    const now = Date.now();
    if (!session) {
      return { ok: false, error: 'ابتدا درخواست کد تأیید را بزنید', code: 'OTP_NOT_REQUESTED' };
    }
    if (session.lockedUntil > now) {
      logger.warn('otp_bruteforce_attempt', { mobile, ip: meta?.ip });
      return { ok: false, error: 'تعداد تلاش‌ها بیش از حد مجاز است. ۵ دقیقه دیگر تلاش کنید' };
    }
    if (now > session.expiresAt) {
      return { ok: false, error: 'کد منقضی شده است. درخواست مجدد کنید', code: 'OTP_EXPIRED' };
    }

    const normalized = code.replace(/\D/g, '').slice(0, 6);
    if (normalized !== session.code) {
      session.attempts += 1;
      if (session.attempts >= MAX_OTP_ATTEMPTS) {
        session.lockedUntil = now + LOCKOUT_MS;
        logger.warn('otp_bruteforce_attempt', { mobile, ip: meta?.ip, lockedUntil: session.lockedUntil });
        return { ok: false, error: 'تعداد تلاش‌ها بیش از حد مجاز است. ۵ دقیقه دیگر تلاش کنید' };
      }
      return { ok: false, error: 'کد تأیید اشتباه است. دوباره تلاش کنید', code: 'OTP_WRONG' };
    }

    otpSessions.delete(mobile);

    const accessToken = `acc_${mobile}_${now}`;
    const refreshToken = `ref_${mobile}_${now}`;
    const expiresIn = 3600;
    refreshStore.set(refreshToken, { mobile, expiresAt: now + 7 * 24 * 3600_000 });

    logger.info('user_login_success', { mobile, ip: meta?.ip, device: meta?.device });

    return {
      ok: true,
      tokens: { accessToken, refreshToken, expiresIn },
      user: { id: 'acct_1', mobile },
    };
  },

  refresh(refreshToken: string): { ok: true; tokens: AuthTokens } | { ok: false; error: string } {
    const row = refreshStore.get(refreshToken);
    const now = Date.now();
    if (!row || row.expiresAt < now) {
      return { ok: false, error: 'توکن منقضی شده است. مجدداً وارد شوید' };
    }
    const accessToken = `acc_${row.mobile}_${now}`;
    const nextRefresh = `ref_${row.mobile}_${now}`;
    refreshStore.delete(refreshToken);
    refreshStore.set(nextRefresh, { mobile: row.mobile, expiresAt: now + 7 * 24 * 3600_000 });
    return {
      ok: true,
      tokens: { accessToken, refreshToken: nextRefresh, expiresIn: 3600 },
    };
  },

  logout(accessToken: string | undefined, refreshToken: string | undefined): void {
    if (refreshToken) {
      refreshStore.delete(refreshToken);
    }
    logger.info('user_logout', { accessToken: Boolean(accessToken) });
  },

  /** Legacy: قبلاً فقط برای سازگاری با کلاینت‌های قدیمی */
  legacyLogin(mobile: string): AuthTokens {
    const v = validateIranMobile(mobile);
    if (!v.ok) {
      throw new Error(v.error);
    }
    const now = Date.now();
    const accessToken = `token_${v.mobile}`;
    const refreshToken = `ref_legacy_${v.mobile}_${now}`;
    refreshStore.set(refreshToken, { mobile: v.mobile, expiresAt: now + 7 * 24 * 3600_000 });
    return { accessToken, refreshToken, expiresIn: 3600 };
  },

  registerNationalId(nationalId: string): { ok: true } | { ok: false; error: string } {
    const id = nationalId.trim();
    if (!/^\d{10}$/.test(id)) {
      return { ok: false, error: 'کد ملی نامعتبر است' };
    }
    if (nationalIds.has(id)) {
      return { ok: false, error: 'این کد ملی قبلاً ثبت شده است' };
    }
    nationalIds.add(id);
    return { ok: true };
  },
};
