import { Router } from 'express';

import { authenticateToken, validateBody, validateParams } from '../middlewares';
import {
  createVehicleRegister,
  findVehicleRegisterByDate,
  findVehicleRegisterByPlateNumber,
  patchVehicleRegisterId,
} from '../schemas';
import {
  getAllVehicleRegisters,
  getVehicleRegisterByPlateNumber,
  getVehicleRegistersByDate,
  patchVehicleRegister,
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
vehicleRegisterRouter.patch('/:id', validateParams(patchVehicleRegisterId), patchVehicleRegister);

export { vehicleRegisterRouter };
