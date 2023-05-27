import { Response } from 'express';
import httpStatus from 'http-status';

import { CreateVehicleRegisterParams } from '../protocols';
import { AuthenticatedRequest } from '../middlewares';
import vehicleRegisterService from '../services/vehicleRegister-service';

export async function postVehicleRegister(req: AuthenticatedRequest, res: Response) {
  const { user_id } = req;
  const { vehicle_type_id, plate_number } = req.body as CreateVehicleRegisterParams;
  const plateNumberUpperCase = plate_number.toLocaleUpperCase();

  try {
    const vehicleType = await vehicleRegisterService.createVehicleRegister(
      user_id,
      vehicle_type_id,
      plateNumberUpperCase,
    );

    return res.status(httpStatus.CREATED).send(vehicleType);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error);
    }
    return res.status(httpStatus.CONFLICT).send(error);
  }
}
