import { Router } from 'express';

import { authenticateToken, validateBody } from '../middlewares';
import { createVehicleRegister } from '../schemas';
import { getAllVehicleRegisters, postVehicleRegister } from '../controllers';

const vehicleRegisterRouter = Router();

vehicleRegisterRouter.all('/*', authenticateToken);
vehicleRegisterRouter.post('/', validateBody(createVehicleRegister), postVehicleRegister);
vehicleRegisterRouter.get('/all', getAllVehicleRegisters);

export { vehicleRegisterRouter };
