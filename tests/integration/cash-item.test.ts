import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';

import app, { init } from '../../src/app';
import { conflictError, notFoundError } from '../../src/errors';
import { createCashItem, createUser } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('POST /cash-item', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/cash-item');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/cash-item').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/cash-item').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when body is not sent', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/cash-item').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when body is not valid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post('/cash-item').set('Authorization', `Bearer ${token}`).send(invalidBody);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 409 when cash item already exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const cashItem = await createCashItem(user.id);
      const body = { cash_type: cashItem.cash_type, value: cashItem.value };

      const response = await server.post('/cash-item').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.CONFLICT);
      expect(response.body).toEqual(conflictError('Already exists a cash item with this value!'));
    });

    it('should respond with status 201 and cash item data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { cash_type: Math.random() < 0.5 ? 'COIN' : 'NOTE', value: faker.number.int({ max: 200 }) };

      const response = await server.post('/cash-item').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.CREATED);
      expect(response.body).toEqual({
        id: expect.any(Number),
        cash_type: body.cash_type,
        value: body.value,
        user_id: user.id,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });
  });
});

describe('GET /cash-item/all', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/cash-item/all');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/cash-item/all').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/cash-item/all').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when has no cash items', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/cash-item/all').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(notFoundError());
    });

    it('should respond with status 200 and cash items data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const cashItem = await createCashItem(user.id);

      const response = await server.get('/cash-item/all').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: cashItem.id,
          cash_type: cashItem.cash_type,
          value: cashItem.value,
          user_id: cashItem.user_id,
          created_at: cashItem.created_at.toISOString(),
          updated_at: cashItem.updated_at.toISOString(),
        },
      ]);
    });
  });
});
