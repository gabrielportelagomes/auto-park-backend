import { Response } from 'express';
import httpStatus from 'http-status';
import { handleApplicationErrors } from '../../src/middlewares';

describe('handleApplicationErrors', () => {
  let response: Response;

  beforeEach(() => {
    response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  it('should handle ForbiddenError', () => {
    const forbiddenErr = new Error('Forbidden Error');
    forbiddenErr.name = 'ForbiddenError';

    handleApplicationErrors(forbiddenErr, response);

    expect(response.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Forbidden Error',
    });
  });

  it('should handle ConflictError', () => {
    const conflictErr = new Error('Conflict Error');
    conflictErr.name = 'ConflictError';

    handleApplicationErrors(conflictErr, response);

    expect(response.status).toHaveBeenCalledWith(httpStatus.CONFLICT);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Conflict Error',
    });
  });

  it('should handle InvalidCredentialsError and UnauthorizedError', () => {
    const invalidCredentialsErr = new Error('Invalid Credentials Error');
    invalidCredentialsErr.name = 'InvalidCredentialsError';

    handleApplicationErrors(invalidCredentialsErr, response);

    expect(response.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Invalid Credentials Error',
    });

    const unauthorizedErr = new Error('Unauthorized Error');
    unauthorizedErr.name = 'UnauthorizedError';

    handleApplicationErrors(unauthorizedErr, response);

    expect(response.status).toHaveBeenCalledWith(httpStatus.UNAUTHORIZED);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Unauthorized Error',
    });
  });

  it('should handle NotFoundError', () => {
    const notFoundErr = new Error('Not Found Error');
    notFoundErr.name = 'NotFoundError';

    handleApplicationErrors(notFoundErr, response);

    expect(response.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
    expect(response.send).toHaveBeenCalledWith({
      message: 'Not Found Error',
    });
  });

  it('should handle other errors as Internal Server Error', () => {
    const err = new Error('Unknown Error');

    handleApplicationErrors(err, response);

    expect(response.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
    expect(response.send).toHaveBeenCalledWith({
      error: 'InternalServerError',
      message: 'Internal Server Error',
    });
  });
});
