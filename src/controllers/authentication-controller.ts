import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { SignInParams } from '../protocols';
import authenticationService from '../services/authentication-service';

export async function postSignIn(req: Request, res: Response) {
  const { email, password } = req.body as SignInParams;

  try {
    const result = await authenticationService.postSignIn({ email, password });

    return res.status(httpStatus.CREATED).send(result);
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).send(error);
  }
}
