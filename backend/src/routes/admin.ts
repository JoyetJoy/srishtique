import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory, getOccasions, createOccasion, updateOccasion, deleteOccasion, addProductsToOccasion, getProducts, createProduct, getProduct, updateProduct, deleteProduct, toggleProductStatus, uploadFile, getCustomers, getCustomer, getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, getAllOrders, updateOrderStatus, processRefund, getDashboardStats, updateTrendingProducts, updateNewArrivalsProducts, getSizeCharts, getSizeChart, createSizeChart, updateSizeChart, deleteSizeChart, getRestockRequests, getBulkOrders, updateBulkOrderStatus, getBulkOrderById } from '../controllers/admin.controller';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/coupon.controller';
import { authenticate, requireSuperAdmin } from '../middleware/auth';
import { upload } from '../utils/s3';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireSuperAdmin);

router.post('/upload', upload.single('image'), uploadFile);

router.get('/dashboard-stats', getDashboardStats);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/occasions', getOccasions);
router.post('/occasions', createOccasion);
router.put('/occasions/:id', updateOccasion);
router.delete('/occasions/:id', deleteOccasion);
router.post('/occasions/:id/products', addProductsToOccasion);

router.get('/products', getProducts);
router.post('/products', createProduct);
router.get('/products/:id', getProduct);
router.put('/products/:id', updateProduct);
router.put('/products/:id/status', toggleProductStatus);
router.delete('/products/:id', deleteProduct);
router.post('/products/trending', updateTrendingProducts);
router.post('/products/new-arrivals', updateNewArrivalsProducts);
router.get('/restock-requests', getRestockRequests);

router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomer);

router.get('/testimonials', getTestimonials);
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

router.get('/size-charts', getSizeCharts);
router.get('/size-charts/:id', getSizeChart);
router.post('/size-charts', createSizeChart);
router.put('/size-charts/:id', updateSizeChart);
router.delete('/size-charts/:id', deleteSizeChart);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/refund', processRefund);

router.get('/bulk-orders', getBulkOrders);
router.get('/bulk-orders/:id', getBulkOrderById);
router.put('/bulk-orders/:id/status', updateBulkOrderStatus);

export default router;
