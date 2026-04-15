export const authRoutes = {
  login(mobile: string) {
    return { token: `token_${mobile}`, expiresIn: 3600 };
  },
};
