import { Request, Response } from 'express';
import { CreateUserParams } from '../protocols';
import httpStatus from 'http-status';
import usersService from '../services/users-service';

export async function postUser(req: Request, res: Response) {
  const { email, password } = req.body as CreateUserParams;

  try {
    const user = await usersService.createUser({ email, password });

    return res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    return res.status(httpStatus.CONFLICT).send(error);
  }
}
