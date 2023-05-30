import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';

import app, { init } from '../../src/app';
import { conflictError, notFoundError } from '../../src/errors';
import { createUser, createVehicleType } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('POST /vehicle-type', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/vehicle-type');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/vehicle-type').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/vehicle-type').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when body is not sent', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/vehicle-type').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when body is not valid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post('/vehicle-type').set('Authorization', `Bearer ${token}`).send(invalidBody);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 409 when vehicle type already exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id);
      const body = { vehicle_type: vehicleType.vehicle_type, hour_hate: vehicleType.hour_hate };

      const response = await server.post('/vehicle-type').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.CONFLICT);
      expect(response.body).toEqual(conflictError('There is already a vehicle type with this name!'));
    });

    it('should respond with status 201 and vehicle type data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { vehicle_type: faker.person.firstName(), hour_hate: faker.number.int({ max: 200 }) };

      const response = await server.post('/vehicle-type').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.CREATED);
      expect(response.body).toEqual({
        id: expect.any(Number),
        vehicle_type: expect.any(String),
        hour_hate: expect.any(Number),
        user_id: user.id,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
  });
});

describe('GET /vehicle-type/all', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/vehicle-type/all');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/vehicle-type/all').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/vehicle-type/all').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when has no vehicle type', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/vehicle-type/all').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(notFoundError());
    });

    it('should respond with status 200 and vehicle types data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id);

      const response = await server.get('/vehicle-type/all').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: vehicleType.id,
          vehicle_type: vehicleType.vehicle_type,
          hour_hate: vehicleType.hour_hate,
          user_id: vehicleType.user_id,
          created_at: vehicleType.created_at.toISOString(),
          updated_at: vehicleType.updated_at.toISOString(),
        },
      ]);
    });
  });
});
