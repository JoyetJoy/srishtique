import { Router } from 'express';
import { getPublicCategories, getPublicOccasions, getPublicProducts, getPublicTestimonials } from '../controllers/public.controller';
import { validateCoupon, getActiveCoupons } from '../controllers/coupon.controller';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile, setPassword, addAddress, updateAddress, deleteAddress, setDefaultAddress, initiatePayment, verifyPayment, getOrders, trackCart, getCart, getOrderById, rateOrder, subscribeStockNotification, checkStockNotification } from '../controllers/user.controller';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller';
import { getCountries, getStates } from '../controllers/location.controller';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/categories', getPublicCategories);
router.get('/occasions', getPublicOccasions);
router.get('/products', getPublicProducts);
router.get('/testimonials', getPublicTestimonials);

// Coupon route
router.post('/validate-coupon', validate('validateCoupon'), validateCoupon);
router.get('/coupons/active', getActiveCoupons);

// User Profile routes
router.get('/user/profile', authenticate, getProfile);
router.put('/user/profile', authenticate, validate('updateProfile'), updateProfile);
router.put('/user/set-password', authenticate, validate('setPassword'), setPassword);

// User Address routes
router.post('/user/addresses', authenticate, validate('address'), addAddress);
router.put('/user/addresses/:id', authenticate, validate('address'), updateAddress);
router.delete('/user/addresses/:id', authenticate, deleteAddress);
router.put('/user/addresses/:id/default', authenticate, setDefaultAddress);

// Order & Payment routes
router.post('/orders/initiate', authenticate, initiatePayment);
router.post('/orders/verify', authenticate, verifyPayment);
router.get('/orders', authenticate, getOrders);

// Wishlist routes
router.get('/wishlist', authenticate, getWishlist);
router.post('/wishlist/toggle', authenticate, validate('wishlistToggle'), toggleWishlist);

// Location Master routes
router.get('/countries', getCountries);
router.get('/states', getStates);


// Cart tracking (for abandonment reminders) & sync
router.post('/cart/track', authenticate, trackCart);
router.get('/cart', authenticate, getCart);

// Order detail & rating
router.get('/orders/:id', authenticate, getOrderById);
router.post('/orders/:id/rate', authenticate, rateOrder);

// Stock notification
router.post('/stock-notifications', authenticate, subscribeStockNotification);
router.get('/stock-notifications/check', authenticate, checkStockNotification);

export default router;
