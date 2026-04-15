import { propertyService } from '../services/propertyService';

export const propertyRoutes = {
  list: () => propertyService.list(),
  create: (input: Parameters<typeof propertyService.create>[0]) => propertyService.create(input),
};
