import { authService } from '../services/authService';

export const authRoutes = {
  login(mobile: string) {
    const tokens = authService.legacyLogin(mobile);
    return { token: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn: tokens.expiresIn };
  },
};
