import { propertyService } from '../services/propertyService';

export const propertyRoutes = {
  list: () => propertyService.list(),
};
