import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createVehicleRegister } from '../schemas';
import { postVehicleRegister } from '../controllers';

const vehicleRegisterRouter = Router();

vehicleRegisterRouter.all('/*', authenticateToken);
vehicleRegisterRouter.post('/', validateBody(createVehicleRegister), postVehicleRegister);

export { vehicleRegisterRouter };
