import { licenseService } from '../services/licenseService';

export const licenseRoutes = {
  list: () => licenseService.list(),
};
