import { Router } from 'express';

import { authenticateToken, validateBody, validateParams } from '../middlewares';
import { createVehicleRegister, findVehicleRegisterByDate, findVehicleRegisterByPlateNumber } from '../schemas';
import {
  getAllVehicleRegisters,
  getVehicleRegisterByPlateNumber,
  getVehicleRegistersByDate,
  postVehicleRegister,
} from '../controllers';

const vehicleRegisterRouter = Router();

vehicleRegisterRouter.all('/*', authenticateToken);
vehicleRegisterRouter.post('/', validateBody(createVehicleRegister), postVehicleRegister);
vehicleRegisterRouter.get('/all', getAllVehicleRegisters);
vehicleRegisterRouter.get(
  '/:plate_number',
  validateParams(findVehicleRegisterByPlateNumber),
  getVehicleRegisterByPlateNumber,
);
vehicleRegisterRouter.get('/date/:date', validateParams(findVehicleRegisterByDate), getVehicleRegistersByDate);

export { vehicleRegisterRouter };
