import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateOrderNumber(dateStr: Date | string, orderId: number) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `DK-${year}${month}${day}-${orderId.toString().padStart(5, '0')}`;
}

async function migrate() {
  console.log('Fetching orders without orderNumber...');
  const orders = await prisma.order.findMany({
    where: {
      orderNumber: null
    }
  });

  console.log(`Found ${orders.length} orders to update.`);

  for (const order of orders) {
    const orderNumber = generateOrderNumber(order.createdAt, order.id);
    await prisma.order.update({
      where: { id: order.id },
      data: { orderNumber }
    });
    console.log(`Updated Order ID ${order.id} -> ${orderNumber}`);
  }

  console.log('Migration complete!');
}

migrate()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
