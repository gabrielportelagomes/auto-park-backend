import * as jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';

import app, { init } from '../../src/app';
import { forbiddenError, notFoundError } from '../../src/errors';
import { createCashItem, createCashItemWithParams, createUser } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createCashRegister, createManyCashRegister } from '../factories/cash-register-factory';

beforeAll(async () => {
  await init();
  await cleanDb();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('POST /cash-register', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/cash-register');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/cash-register').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/cash-register').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when body is not sent', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/cash-register').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when body is not valid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post('/cash-register').set('Authorization', `Bearer ${token}`).send(invalidBody);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when cash item does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = [
        {
          cash_item_id: 0,
          quantity: faker.number.int({ max: 5 }),
          amount: faker.number.int({ max: 100 }),
          transaction_type: Math.random() < 0.5 ? 'INFLOW' : 'OUTFLOW',
        },
      ];

      const response = await server.post('/cash-register').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(notFoundError());
    });

    it('should respond with status 403 when has insufficient quantity available for outflow', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const cashItem = await createCashItem(user.id);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const body = [
        {
          cash_item_id: cashItem.id,
          quantity,
          amount: quantity * cashItem.value,
          transaction_type: 'OUTFLOW',
        },
      ];
      const valueInReal = (cashItem.value / 100).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

      const response = await server.post('/cash-register').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
      expect(response.body).toEqual(forbiddenError(`Insufficient quantity available for ${valueInReal}!`));
    });

    it('should respond with status 201 and cash register data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const cashItem = await createCashItem(user.id);
      await createCashRegister({
        user_id: user.id,
        cash_item_id: cashItem.id,
        value: cashItem.value,
        transaction_type: 'INFLOW',
      });

      const quantity = faker.number.int({ min: 1, max: 1 });
      const body = [
        {
          cash_item_id: cashItem.id,
          quantity,
          amount: quantity * cashItem.value,
          transaction_type: 'OUTFLOW',
        },
      ];

      const response = await server.post('/cash-register').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.CREATED);
      expect(response.body.count).toEqual(body.length);
    });
  });
});

describe('GET /cash-register/balance', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/cash-register/balance');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/cash-register/balance').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/cash-register/balance').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when has no cash item', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/cash-register/balance').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
      expect(response.body).toEqual(notFoundError());
    });

    it('should respond with status 200 and cash registers data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const cashItem = await createCashItem(user.id);
      const newCashItem = await createCashItem(user.id);
      const quantity = faker.number.int({ min: 1, max: 5 });
      await createManyCashRegister([
        {
          cash_item_id: cashItem.id,
          quantity,
          amount: cashItem.value * quantity,
          transaction_type: 'INFLOW',
          user_id: user.id,
        },
        {
          cash_item_id: cashItem.id,
          quantity,
          amount: cashItem.value * quantity,
          transaction_type: 'OUTFLOW',
          user_id: user.id,
        },
        {
          cash_item_id: newCashItem.id,
          quantity,
          amount: newCashItem.value * quantity,
          transaction_type: 'OUTFLOW',
          user_id: user.id,
        },
        {
          cash_item_id: newCashItem.id,
          quantity,
          amount: newCashItem.value * quantity,
          transaction_type: 'INFLOW',
          user_id: user.id,
        },
      ]);

      const response = await server.get('/cash-register/balance').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual([
        {
          id: expect.any(Number),
          cash_type: expect.any(String),
          value: expect.any(Number),
          quantity: 0,
          amount: 0,
        },
        {
          id: expect.any(Number),
          cash_type: expect.any(String),
          value: expect.any(Number),
          quantity: 0,
          amount: 0,
        },
      ]);
    });
  });
});

describe('POST /cash-register/change', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/cash-register/change');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/cash-register/change').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/cash-register/change').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 400 when body is not sent', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/cash-register/change').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when body is not valid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server
        .post('/cash-register/change')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidBody);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 403 when the total paid is less than the total price', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const cashItem = await createCashItem(user.id);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const body = {
        total_price: faker.number.int({ min: 5, max: 10 }),
        total_paid: faker.number.int({ min: 1, max: 4 }),
        cash_register: [
          {
            cash_item_id: cashItem.id,
            quantity,
            amount: quantity * cashItem.value,
            transaction_type: 'INFLOW',
          },
        ],
      };

      const response = await server.post('/cash-register/change').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
      expect(response.body).toEqual(
        forbiddenError('Insufficient balance, the total paid is less than the total price!'),
      );
    });

    it('should respond with status 403 when coins and notes are insufficient cash for change!', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const cashItem = await createCashItemWithParams({ user_id: user.id, cash_type: 'NOTE', value: 500 });
      const newCashItem = await createCashItemWithParams({ user_id: user.id, cash_type: 'COIN', value: 100 });
      await createCashRegister({
        user_id: user.id,
        cash_item_id: newCashItem.id,
        value: newCashItem.value,
        transaction_type: 'INFLOW',
      });
      const body = {
        total_price: 1450,
        total_paid: 2000,
        cash_register: [
          {
            cash_item_id: cashItem.id,
            quantity: 4,
            amount: 4000,
            transaction_type: 'INFLOW',
          },
        ],
      };

      const response = await server.post('/cash-register/change').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.FORBIDDEN);
      expect(response.body).toEqual(forbiddenError('Insufficient coins and notes in cash for change!'));
    });

    it('should respond with status 201 and cash register data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const cashItem = await createCashItemWithParams({ user_id: user.id, cash_type: 'NOTE', value: 500 });
      const newCashItem = await createCashItemWithParams({ user_id: user.id, cash_type: 'COIN', value: 100 });
      await createCashRegister({
        user_id: user.id,
        cash_item_id: newCashItem.id,
        value: newCashItem.value,
        transaction_type: 'INFLOW',
      });
      const body = {
        total_price: 1900,
        total_paid: 2000,
        cash_register: [
          {
            cash_item_id: cashItem.id,
            quantity: 4,
            amount: 2000,
            transaction_type: 'INFLOW',
          },
        ],
      };

      const response = await server.post('/cash-register/change').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.CREATED);
      expect(response.body).toEqual([
        {
          quantity: expect.any(Number),
          amount: expect.any(Number),
          cash_item_id: expect.any(Number),
          transaction_type: 'OUTFLOW',
          user_id: user.id,
          value: expect.any(Number),
        },
      ]);
    });
  });
});
