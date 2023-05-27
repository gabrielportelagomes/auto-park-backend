import { CashType, User } from '@prisma/client';

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

export type RegistersBalance = {
  quantity: number;
  amount: number;
  id: number;
  cash_type: CashType;
  value: number;
};

export type CreateInflowCashRegisterParams = Omit<CreateCashRegisterParams, 'transaction_type'> & {
  transaction_type: 'INFLOW';
};

export type CreateChangeAvailabilityParams = {
  total_price: number;
  total_paid: number;
  cash_register: CreateInflowCashRegisterParams[];
};

export type ChangeDetails = Omit<CreateCashRegisterParams, 'transaction_type'> & {
  transaction_type: 'OUTFLOW';
  user_id: number;
};
