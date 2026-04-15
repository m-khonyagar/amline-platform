import { hrService } from '../services/hrService';

export const hrRoutes = {
  openings: () => hrService.openings(),
};
