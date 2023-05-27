import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { CreateVehicleRegisterParams, FindVehicleRegisterByPlateNumberParams } from '../protocols';
import { AuthenticatedRequest } from '../middlewares';
import vehicleRegisterService from '../services/vehicleRegister-service';

export async function postVehicleRegister(req: AuthenticatedRequest, res: Response) {
  const { user_id } = req;
  const { vehicle_type_id, plate_number } = req.body as CreateVehicleRegisterParams;
  const plateNumberUpperCase = plate_number.toLocaleUpperCase();

  try {
    const vehicleRegister = await vehicleRegisterService.createVehicleRegister(
      user_id,
      vehicle_type_id,
      plateNumberUpperCase,
    );

    return res.status(httpStatus.CREATED).send(vehicleRegister);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.status(httpStatus.NOT_FOUND).send(error);
    }
    return res.status(httpStatus.CONFLICT).send(error);
  }
}

export async function getAllVehicleRegisters(req: Request, res: Response) {
  try {
    const registers = await vehicleRegisterService.findAllVehicleRegisters();

    return res.status(httpStatus.OK).send(registers);
  } catch (error) {
    return res.status(httpStatus.NOT_FOUND).send(error);
  }
}

export async function getVehicleRegisterByPlateNumber(req: Request, res: Response) {
  const { plate_number } = req.params as FindVehicleRegisterByPlateNumberParams;
  const plateNumberUpperCase = plate_number.toLocaleUpperCase();

  try {
    const registers = await vehicleRegisterService.findVehicleRegisterByPlateNumber(plateNumberUpperCase);

    return res.status(httpStatus.OK).send(registers);
  } catch (error) {
    return res.status(httpStatus.NOT_FOUND).send(error);
  }
}
