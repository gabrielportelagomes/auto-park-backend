import bcrypt from 'bcrypt';

import { CashItem, CashRegister, Prisma, PrismaClient, VehicleRegister, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.findFirst();
  if (!user) {
    const password = 'Superadmin1';
    const hashedPassword = await bcrypt.hash(password, 12);

    user = await prisma.user.create({
      data: {
        email: 'admin@admin.com',
        password: hashedPassword,
      },
    });
  }

  let cashItem: CashItem[] | Prisma.BatchPayload = await prisma.cashItem.findMany();
  if (cashItem.length === 0) {
    cashItem = await prisma.cashItem.createMany({
      data: [
        {
          cash_type: 'COIN',
          value: 5,
          user_id: user.id,
        },
        {
          cash_type: 'COIN',
          value: 10,
          user_id: user.id,
        },
        {
          cash_type: 'COIN',
          value: 25,
          user_id: user.id,
        },
        {
          cash_type: 'COIN',
          value: 50,
          user_id: user.id,
        },
        {
          cash_type: 'COIN',
          value: 100,
          user_id: user.id,
        },
        {
          cash_type: 'NOTE',
          value: 200,
          user_id: user.id,
        },
        {
          cash_type: 'NOTE',
          value: 500,
          user_id: user.id,
        },
        {
          cash_type: 'NOTE',
          value: 1000,
          user_id: user.id,
        },
        {
          cash_type: 'NOTE',
          value: 2000,
          user_id: user.id,
        },
        {
          cash_type: 'NOTE',
          value: 5000,
          user_id: user.id,
        },
        {
          cash_type: 'NOTE',
          value: 10000,
          user_id: user.id,
        },
        {
          cash_type: 'NOTE',
          value: 20000,
          user_id: user.id,
        },
      ],
    });
  }

  let cashRegister: CashRegister[] | Prisma.BatchPayload = await prisma.cashRegister.findMany();
  if (cashRegister.length === 0) {
    const cashItem_5 = await prisma.cashItem.findFirst({ where: { value: 5 } });
    const cashItem_10 = await prisma.cashItem.findFirst({ where: { value: 10 } });
    const cashItem_50 = await prisma.cashItem.findFirst({ where: { value: 50 } });
    const cashItem_100 = await prisma.cashItem.findFirst({ where: { value: 100 } });
    const cashItem_200 = await prisma.cashItem.findFirst({ where: { value: 200 } });
    const cashItem_500 = await prisma.cashItem.findFirst({ where: { value: 500 } });
    const cashItem_1000 = await prisma.cashItem.findFirst({ where: { value: 1000 } });

    if (cashItem_5 && cashItem_10 && cashItem_50 && cashItem_100 && cashItem_200 && cashItem_500 && cashItem_1000) {
      cashRegister = await prisma.cashRegister.createMany({
        data: [
          {
            cash_item_id: cashItem_5.id,
            quantity: 3,
            amount: 3 * cashItem_5.value,
            transaction_type: 'INFLOW',
            user_id: user.id,
          },
          {
            cash_item_id: cashItem_10.id,
            quantity: 4,
            amount: 4 * cashItem_10.value,
            transaction_type: 'INFLOW',
            user_id: user.id,
          },
          {
            cash_item_id: cashItem_50.id,
            quantity: 4,
            amount: 4 * cashItem_50.value,
            transaction_type: 'INFLOW',
            user_id: user.id,
          },
          {
            cash_item_id: cashItem_50.id,
            quantity: 2,
            amount: 2 * cashItem_50.value,
            transaction_type: 'OUTFLOW',
            user_id: user.id,
          },
          {
            cash_item_id: cashItem_100.id,
            quantity: 2,
            amount: 2 * cashItem_100.value,
            transaction_type: 'INFLOW',
            user_id: user.id,
          },
          {
            cash_item_id: cashItem_200.id,
            quantity: 3,
            amount: 3 * cashItem_200.value,
            transaction_type: 'INFLOW',
            user_id: user.id,
          },
          {
            cash_item_id: cashItem_500.id,
            quantity: 1,
            amount: 1 * cashItem_500.value,
            transaction_type: 'INFLOW',
            user_id: user.id,
          },
          {
            cash_item_id: cashItem_1000.id,
            quantity: 2,
            amount: 2 * cashItem_1000.value,
            transaction_type: 'INFLOW',
            user_id: user.id,
          },
        ],
      });
    }
  }

  let vehicleType: VehicleType[] | Prisma.BatchPayload = await prisma.vehicleType.findMany();
  if (vehicleType.length === 0) {
    vehicleType = await prisma.vehicleType.createMany({
      data: [
        {
          vehicle_type: 'carro',
          hour_hate: 400,
          user_id: user.id,
        },
        {
          vehicle_type: 'moto',
          hour_hate: 250,
          user_id: user.id,
        },
      ],
    });
  }

  let vehicleRegister: VehicleRegister[] | Prisma.BatchPayload = await prisma.vehicleRegister.findMany();
  if (vehicleRegister.length === 0) {
    const vehicleType_carro = await prisma.vehicleType.findFirst({ where: { vehicle_type: 'carro' } });
    const vehicleType_moto = await prisma.vehicleType.findFirst({ where: { vehicle_type: 'moto' } });

    if (vehicleType_carro && vehicleType_moto) {
      vehicleRegister = await prisma.vehicleRegister.createMany({
        data: [
          {
            vehicle_type_id: vehicleType_carro.id,
            plate_number: 'H58FB9C',
            entry_time: new Date(),
            user_id: user.id,
          },
          {
            vehicle_type_id: vehicleType_moto.id,
            plate_number: 'EB29J1A',
            entry_time: new Date(),
            user_id: user.id,
          },
        ],
      });
    }
  }

  console.log({ user, cashItem, cashRegister, vehicleType, vehicleRegister });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
