const fs = require('fs');

const content = fs.readFileSync('src/controllers/admin.controller.ts', 'utf8');

const startTag = 'export const getDashboardStats = async (req: Request, res: Response) => {';
const endTag = 'export const updateTrendingProducts = async (req: Request, res: Response) => {';

const startIndex = content.indexOf(startTag);
const endIndex = content.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
  console.error("Tags not found");
  process.exit(1);
}

const replacement = `export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { range, start, end } = req.query as { range?: string, start?: string, end?: string };
    
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    const now = new Date();
    
    // Default to 'today' if not provided
    const selectedRange = range || 'today';

    if (selectedRange === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (selectedRange === 'this_week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (selectedRange === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (selectedRange === 'this_year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (selectedRange === 'custom' && start && end) {
      startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
    }

    const dateFilter = (startDate && endDate) ? { gte: startDate, lte: endDate } : undefined;
    const whereDate = dateFilter ? { createdAt: dateFilter } : {};

    // 1. Basic Totals
    const totalOrders = await prisma.order.count({ where: whereDate });
    const totalProducts = await prisma.product.count({ where: whereDate });
    const activeUsers = await prisma.user.count({ where: { role: 'USER', ...whereDate } });
    
    // Revenue sum (exclude cancelled)
    const revenueResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' }, ...whereDate }
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // 2. Revenue Overview
    const revenueData = [];
    const dateObj = new Date(); // reset now

    if (selectedRange === 'today') {
      // Hourly for today
      for (let i = 0; i <= 23; i++) {
        const startHour = new Date(startDate!.getFullYear(), startDate!.getMonth(), startDate!.getDate(), i, 0, 0);
        const endHour = new Date(startDate!.getFullYear(), startDate!.getMonth(), startDate!.getDate(), i, 59, 59, 999);
        const rev = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: 'CANCELLED' }, createdAt: { gte: startHour, lte: endHour } }
        });
        revenueData.push({
          name: \`\${i}:00\`,
          revenue: rev._sum.totalAmount || 0
        });
      }
    } else if (selectedRange === 'this_week') {
      // Daily for this week
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const targetDay = new Date(startDate!);
        targetDay.setDate(targetDay.getDate() + i);
        const startDay = new Date(targetDay);
        startDay.setHours(0, 0, 0, 0);
        const endDay = new Date(targetDay);
        endDay.setHours(23, 59, 59, 999);
        const rev = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: 'CANCELLED' }, createdAt: { gte: startDay, lte: endDay } }
        });
        revenueData.push({
          name: days[targetDay.getDay()],
          revenue: rev._sum.totalAmount || 0
        });
      }
    } else if (selectedRange === 'this_month' || selectedRange === 'custom') {
      // If it's custom or this month, we'll divide it into chunks or just show daily if it's <= 31 days
      const diffTime = Math.abs(endDate!.getTime() - startDate!.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 31) {
        // Daily
        for (let i = 0; i < diffDays; i++) {
          const targetDay = new Date(startDate!);
          targetDay.setDate(targetDay.getDate() + i);
          const startDay = new Date(targetDay);
          startDay.setHours(0, 0, 0, 0);
          const endDay = new Date(targetDay);
          endDay.setHours(23, 59, 59, 999);
          const rev = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { not: 'CANCELLED' }, createdAt: { gte: startDay, lte: endDay } }
          });
          revenueData.push({
            name: \`\${targetDay.getDate()}/\${targetDay.getMonth()+1}\`,
            revenue: rev._sum.totalAmount || 0
          });
        }
      } else {
        // Monthly
        const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let curr = new Date(startDate!);
        curr.setDate(1);
        while (curr <= endDate!) {
          const startMonth = new Date(curr.getFullYear(), curr.getMonth(), 1);
          const endMonth = new Date(curr.getFullYear(), curr.getMonth() + 1, 0, 23, 59, 59, 999);
          const rev = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { not: 'CANCELLED' }, createdAt: { gte: startMonth, lte: endMonth } }
          });
          revenueData.push({
            name: \`\${monthsStr[curr.getMonth()]} \${curr.getFullYear()}\`,
            revenue: rev._sum.totalAmount || 0
          });
          curr.setMonth(curr.getMonth() + 1);
        }
      }
    } else {
      // this_year or fallback: Monthly for the year
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const targetYear = startDate ? startDate.getFullYear() : dateObj.getFullYear();
      for (let i = 0; i < 12; i++) {
        const startOfMonth = new Date(targetYear, i, 1);
        const endOfMonth = new Date(targetYear, i + 1, 0, 23, 59, 59, 999);
        const rev = await prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfMonth, lte: endOfMonth } }
        });
        revenueData.push({
          name: months[i],
          revenue: rev._sum.totalAmount || 0
        });
      }
    }

    // 3. Orders by Category
    const categories = await prisma.category.findMany();
    const categoryData = [];
    for (const cat of categories) {
      const count = await prisma.orderItem.count({
        where: {
          productVariant: { product: { categoryId: cat.id } },
          order: whereDate // filter by order date
        }
      });
      if (count > 0) {
        categoryData.push({
          name: cat.name,
          orders: count
        });
      }
    }
    categoryData.sort((a, b) => b.orders - a.orders);
    const topCategories = categoryData.slice(0, 5);

    // 4. Recent Orders
    const recentOrders = await prisma.order.findMany({
      where: whereDate,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    const startOfTodayRaw = new Date();
    startOfTodayRaw.setHours(0, 0, 0, 0);
    const todayRevResult = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' }, createdAt: { gte: startOfTodayRaw } }
    });
    const trueTodayRevenue = todayRevResult._sum.totalAmount || 0;

    // 6. Order Status Data
    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      where: whereDate,
      _count: { status: true }
    });
    const orderStatusData = orderStatuses.map(item => ({
      name: item.status,
      value: item._count.status
    }));

    // 7. Low Stock Alerts (independent of date filter, it's current state)
    const lowStockItems = await prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      take: 5,
      orderBy: { stock: 'asc' },
      include: {
        product: { select: { name: true, images: true } }
      }
    });

    // 8. Recent Customers
    const recentCustomers = await prisma.user.findMany({
      where: { role: 'USER', ...whereDate },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, email: true, createdAt: true }
    });

    res.json({
      stats: [
        { label: selectedRange === 'today' ? 'Today\\'s Revenue' : 'Period Revenue', value: \`₹\${totalRevenue.toLocaleString('en-IN')}\`, trend: '', isPositive: true },
        { label: 'Total Revenue', value: \`₹\${totalRevenue.toLocaleString('en-IN')}\`, trend: '', isPositive: true },
        { label: 'Total Orders', value: totalOrders.toString(), trend: '', isPositive: true },
        { label: 'New Products', value: totalProducts.toString(), trend: '', isPositive: true },
        { label: 'New Users', value: activeUsers.toString(), trend: '', isPositive: true }
      ],
      revenueData,
      categoryData: topCategories,
      orderStatusData,
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        productName: item.product.name,
        image: Array.isArray(item.product.images) ? item.product.images[0] : null,
        variantInfo: \`\${item.size} - \${item.color}\`,
        stock: item.stock
      })),
      recentCustomers: recentCustomers.map(c => ({
        name: c.name || 'Guest',
        email: c.email,
        date: c.createdAt.toISOString()
      })),
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        customerName: o.user.name || o.user.email || 'Guest',
        date: o.createdAt.toISOString(),
        status: o.status,
        amount: o.totalAmount
      }))
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
`;

const newContent = content.substring(0, startIndex) + replacement + '\n' + content.substring(endIndex);

fs.writeFileSync('src/controllers/admin.controller.ts', newContent, 'utf8');
console.log('Successfully updated getDashboardStats');
