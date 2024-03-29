import { Response } from 'express';
import httpStatus from 'http-status';

import { ApplicationError } from '../protocols';

export function handleApplicationErrors(err: ApplicationError | Error, res: Response) {
  if (err.name === 'ForbiddenError') {
    return res.status(httpStatus.FORBIDDEN).send({
      message: err.message,
    });
  }

  if (err.name === 'ConflictError') {
    return res.status(httpStatus.CONFLICT).send({
      message: err.message,
    });
  }

  if (err.name === 'InvalidCredentialsError') {
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: err.message,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(httpStatus.UNAUTHORIZED).send({
      message: err.message,
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(httpStatus.NOT_FOUND).send({
      message: err.message,
    });
  }

  /* eslint-disable-next-line no-console */
  console.error(err.name);
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
    error: 'InternalServerError',
    message: 'Internal Server Error',
  });
}
