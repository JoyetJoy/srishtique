const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.setting.findUnique({ where: { key: 'HERO_SLIDES' } })
  .then(s => console.log(s ? s.value : 'Not found'))
  .finally(() => prisma.$disconnect());
