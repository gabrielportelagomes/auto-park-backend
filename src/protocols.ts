import { User } from '@prisma/client';

export type ApplicationError = {
  name: string;
  message: string;
};

export type CreateUserParams = {
  email: string;
  password: string;
};

export type SignUpResponse = Pick<User, 'id' | 'email'>;

export type SignInParams = CreateUserParams;

export type SignInResponse = {
  user_id: number;
  email: string;
  token: string;
};

export type CreateSessionParams = Omit<SignInResponse, 'email'>;

export type CreateCashItemParams = {
  cash_type: 'COIN' | 'NOTE';
  value: number;
};

export type CreateCashItem = CreateCashItemParams & {
  user_id: number;
};

export type CreateCashRegisterParams = {
  cash_item_id: number;
  quantity: number;
  amount: number;
  transaction_type: 'INFLOW' | 'OUTFLOW';
};

export type CreateCashRegister = CreateCashRegisterParams & {
  user_id: number;
};
