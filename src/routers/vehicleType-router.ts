import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createVehicleType } from '../schemas';
import { getAllVehicleTypes, postVehicleType } from '../controllers';

const vehicleTypeRouter = Router();

vehicleTypeRouter.all('/*', authenticateToken);
vehicleTypeRouter.post('/', validateBody(createVehicleType), postVehicleType);
vehicleTypeRouter.get('/all', getAllVehicleTypes);

export { vehicleTypeRouter };
