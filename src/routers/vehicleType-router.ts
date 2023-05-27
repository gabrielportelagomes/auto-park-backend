import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createVehicleType } from '../schemas';
import { postVehicleType } from '../controllers';

const vehicleTypeRouter = Router();

vehicleTypeRouter.all('/', authenticateToken);
vehicleTypeRouter.post('/', validateBody(createVehicleType), postVehicleType);

export { vehicleTypeRouter };
