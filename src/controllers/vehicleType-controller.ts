import { Response } from 'express';
import httpStatus from 'http-status';

import { CreateVehicleTypeParams } from '../protocols';
import { AuthenticatedRequest } from '../middlewares';
import vehicleTypeService from '../services/vehicleType-service';

export async function postVehicleType(req: AuthenticatedRequest, res: Response) {
  const { user_id } = req;
  const { vehicle_type, hour_hate } = req.body as CreateVehicleTypeParams;
  const vehicleTypeLowerCase = vehicle_type.toLocaleLowerCase();

  try {
    const vehicleType = await vehicleTypeService.createVehicleType(user_id, vehicleTypeLowerCase, hour_hate);

    return res.status(httpStatus.CREATED).send(vehicleType);
  } catch (error) {
    return res.status(httpStatus.CONFLICT).send(error);
  }
}
