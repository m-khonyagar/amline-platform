import { achievementService } from '../services/achievementService';

export const achievementRoutes = {
  leaderboard: () => achievementService.leaderboard(),
};
