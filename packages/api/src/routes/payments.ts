import { paymentService } from '../services/paymentService';

export const paymentRoutes = {
  history: () => paymentService.history(),
};
