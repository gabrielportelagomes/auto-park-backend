import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';

import app, { init } from '../../src/app';
import { conflictError, forbiddenError, notFoundError } from '../../src/errors';
import { createInactiveVehicleRegister, createUser, createVehicleRegister } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createVehicleType } from 'services/vehicleType-service';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('POST /vehicle-register', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/vehicle-register');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/vehicle-register').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/vehicle-register').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when body is not sent', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/vehicle-register').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when body is not valid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post('/vehicle-register').set('Authorization', `Bearer ${token}`).send(invalidBody);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when vehicle type does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = {
        vehicle_type_id: 0,
        plate_number: faker.string.alpha({ length: 4 }).toUpperCase() + faker.number.int({ min: 100, max: 999 }),
      };

      const response = await server.post('/vehicle-register').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(notFoundError());
    });

    it('should respond with status 403 when there is already an active register for the plate number', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id, 'carro', 400);
      const vehicleRegister = await createVehicleRegister(user.id, vehicleType.id);
      const body = {
        vehicle_type_id: vehicleType.id,
        plate_number: vehicleRegister.plate_number,
      };

      const response = await server.post('/vehicle-register').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.CONFLICT);
      expect(response.body).toEqual(conflictError('This vehicle already has an active registration!'));
    });

    it('should respond with status 201 and vehicle register data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id, 'carro', 400);
      const body = {
        vehicle_type_id: vehicleType.id,
        plate_number: faker.string.alpha({ length: 4 }).toUpperCase() + faker.number.int({ min: 100, max: 999 }),
      };

      const response = await server.post('/vehicle-register').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.CREATED);
      expect(response.body).toEqual({
        id: expect.any(Number),
        plate_number: expect.any(String),
        vehicle_type_id: vehicleType.id,
        entry_time: expect.any(String),
        exit_time: null,
        paid_amount: null,
        user_id: user.id,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
  });
});

describe('GET /vehicle-register/all', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/vehicle-register/all');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/vehicle-register/all').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/vehicle-register/all').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when has no vehicle registers', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/vehicle-register/all').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(notFoundError());
    });

    it('should respond with status 200 and vehicle registers data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id, 'carro', 400);
      const vehicleRegister = await createVehicleRegister(user.id, vehicleType.id);

      const response = await server.get('/vehicle-register/all').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: vehicleRegister.id,
          plate_number: vehicleRegister.plate_number,
          vehicle_type_id: vehicleRegister.vehicle_type_id,
          entry_time: vehicleRegister.entry_time.toISOString(),
          exit_time: vehicleRegister.exit_time,
          paid_amount: vehicleRegister.paid_amount,
          user_id: vehicleRegister.user_id,
          created_at: vehicleRegister.created_at.toISOString(),
          updated_at: vehicleRegister.updated_at.toISOString(),
          VehicleType: {
            id: vehicleType.id,
            vehicle_type: vehicleType.vehicle_type,
            hour_hate: vehicleType.hour_hate,
            user_id: vehicleType.user_id,
            created_at: vehicleType.created_at.toISOString(),
            updated_at: vehicleType.updated_at.toISOString(),
          },
        },
      ]);
    });
  });
});

describe('GET /vehicle-register/active', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/vehicle-register/active');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/vehicle-register/active').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/vehicle-register/active').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when has no active vehicle registers', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id, 'carro', 400);
      await createInactiveVehicleRegister(user.id, vehicleType.id);

      const response = await server.get('/vehicle-register/active').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(notFoundError());
    });

    it('should respond with status 200 and vehicle registers data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id, 'carro', 400);
      const vehicleRegister = await createVehicleRegister(user.id, vehicleType.id);

      const response = await server.get('/vehicle-register/active').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: vehicleRegister.id,
          plate_number: vehicleRegister.plate_number,
          vehicle_type_id: vehicleRegister.vehicle_type_id,
          entry_time: vehicleRegister.entry_time.toISOString(),
          exit_time: vehicleRegister.exit_time,
          paid_amount: vehicleRegister.paid_amount,
          user_id: vehicleRegister.user_id,
          created_at: vehicleRegister.created_at.toISOString(),
          updated_at: vehicleRegister.updated_at.toISOString(),
          VehicleType: {
            id: vehicleType.id,
            vehicle_type: vehicleType.vehicle_type,
            hour_hate: vehicleType.hour_hate,
            user_id: vehicleType.user_id,
            created_at: vehicleType.created_at.toISOString(),
            updated_at: vehicleType.updated_at.toISOString(),
          },
        },
      ]);
    });
  });
});

describe('GET /vehicle-register/:plate_number', () => {
  it('should respond with status 401 if no token is given', async () => {
    const plate_number = faker.string.alpha({ length: 4 }).toUpperCase() + faker.number.int({ min: 100, max: 999 });

    const response = await server.get(`/vehicle-register/${plate_number}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const plate_number = faker.string.alpha({ length: 4 }).toUpperCase() + faker.number.int({ min: 100, max: 999 });

    const response = await server.get(`/vehicle-register/${plate_number}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const plate_number = faker.string.alpha({ length: 4 }).toUpperCase() + faker.number.int({ min: 100, max: 999 });

    const response = await server.get(`/vehicle-register/${plate_number}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when it has no vehicle register with the informed plate number', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const plate_number = faker.string.alpha({ length: 4 }).toUpperCase() + faker.number.int({ min: 100, max: 999 });

      const response = await server.get(`/vehicle-register/${plate_number}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(notFoundError());
    });

    it('should respond with status 200 and vehicle register data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id, 'carro', 400);
      const vehicleRegister = await createVehicleRegister(user.id, vehicleType.id);

      const response = await server
        .get(`/vehicle-register/${vehicleRegister.plate_number}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: vehicleRegister.id,
        plate_number: vehicleRegister.plate_number,
        vehicle_type_id: vehicleRegister.vehicle_type_id,
        entry_time: vehicleRegister.entry_time.toISOString(),
        exit_time: vehicleRegister.exit_time,
        paid_amount: vehicleRegister.paid_amount,
        user_id: vehicleRegister.user_id,
        created_at: vehicleRegister.created_at.toISOString(),
        updated_at: vehicleRegister.updated_at.toISOString(),
        VehicleType: {
          id: vehicleType.id,
          vehicle_type: vehicleType.vehicle_type,
          hour_hate: vehicleType.hour_hate,
          user_id: vehicleType.user_id,
          created_at: vehicleType.created_at.toISOString(),
          updated_at: vehicleType.updated_at.toISOString(),
        },
      });
    });
  });
});

describe('GET /vehicle-register/date/:date', () => {
  it('should respond with status 401 if no token is given', async () => {
    const fakerDate = faker.date.birthdate().toISOString();
    const date = fakerDate.split('T')[0];

    const response = await server.get(`/vehicle-register/date/${date}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();
    const fakerDate = faker.date.birthdate().toISOString();
    const date = fakerDate.split('T')[0];

    const response = await server.get(`/vehicle-register/date/${date}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const fakerDate = faker.date.birthdate().toISOString();
    const date = fakerDate.split('T')[0];

    const response = await server.get(`/vehicle-register/date/${date}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when it has no vehicle register with the informed plate number', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const fakerDate = faker.date.birthdate({ max: 2000, mode: 'year' }).toISOString();
      const date = fakerDate.split('T')[0];

      const response = await server.get(`/vehicle-register/date/${date}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(notFoundError());
    });

    it('should respond with status 200 and vehicle register data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id, 'carro', 400);
      const vehicleRegister = await createVehicleRegister(user.id, vehicleType.id);
      const date = vehicleRegister.entry_time.toISOString().split('T')[0];

      const response = await server.get(`/vehicle-register/date/${date}`).set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: vehicleRegister.id,
          plate_number: vehicleRegister.plate_number,
          vehicle_type_id: vehicleRegister.vehicle_type_id,
          entry_time: vehicleRegister.entry_time.toISOString(),
          exit_time: vehicleRegister.exit_time,
          paid_amount: vehicleRegister.paid_amount,
          user_id: vehicleRegister.user_id,
          created_at: vehicleRegister.created_at.toISOString(),
          updated_at: vehicleRegister.updated_at.toISOString(),
          VehicleType: {
            id: vehicleType.id,
            vehicle_type: vehicleType.vehicle_type,
            hour_hate: vehicleType.hour_hate,
            user_id: vehicleType.user_id,
            created_at: vehicleType.created_at.toISOString(),
            updated_at: vehicleType.updated_at.toISOString(),
          },
        },
      ]);
    });
  });
});

describe('PATCH /vehicle-register/:id', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.patch('/vehicle-register/0');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.patch('/vehicle-register/0').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.patch('/vehicle-register/0').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when it has no vehicle register with the informed id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.patch('/vehicle-register/0').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 when vehicle register is not active', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id, 'carro', 400);
      const vehicleRegister = await createInactiveVehicleRegister(user.id, vehicleType.id);

      const response = await server
        .patch(`/vehicle-register/${vehicleRegister.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
      expect(response.body).toEqual(forbiddenError('This register is not active!'));
    });

    it('should respond with status 201 and vehicle register data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const vehicleType = await createVehicleType(user.id, 'carro', 400);
      const vehicleRegister = await createVehicleRegister(user.id, vehicleType.id);

      const response = await server
        .patch(`/vehicle-register/${vehicleRegister.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: vehicleRegister.id,
        plate_number: vehicleRegister.plate_number,
        vehicle_type_id: vehicleRegister.vehicle_type_id,
        entry_time: vehicleRegister.entry_time.toISOString(),
        exit_time: expect.any(String),
        paid_amount: expect.any(Number),
        user_id: vehicleRegister.user_id,
        created_at: vehicleRegister.created_at.toISOString(),
        updated_at: expect.any(String),
      });
    });
  });
});
