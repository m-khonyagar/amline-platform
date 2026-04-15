import { achievementRoutes } from './routes/achievements';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { billingRoutes } from './routes/billing';
import { hrRoutes } from './routes/hr';
import { paymentRoutes } from './routes/payments';
import { propertyRoutes } from './routes/properties';
import { licenseRoutes } from './routes/licenses';
import { aiService } from './services/aiService';
import { logger } from './utils/logger';

export function createApp() {
  return {
    authRoutes,
    propertyRoutes,
    paymentRoutes,
    billingRoutes,
    licenseRoutes,
    achievementRoutes,
    hrRoutes,
    adminRoutes,
    aiService,
  };
}

if (require.main === module) {
  logger.info('Amline API bootstrap completed', { port: process.env.PORT ?? 8080 });
}
