import { Router } from 'express';
import { requestOtp, verifySignup, login, guestLogin, verifyGuestLogin, checkGuestPhone, forgotPasswordRequestOtp, resetPasswordVerify, checkoutRegister } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/signup', validate('signup'), requestOtp);
router.post('/verify-signup', validate('verifySignup'), verifySignup);
router.post('/login', validate('login'), login);

import { prisma } from '../prisma';
router.get('/test-db', async (req, res) => {
  const user = await prisma.user.findFirst();
  res.json({ 
    dbUrl: process.env.DATABASE_URL, 
    user 
  });
});
router.post('/guest-check-phone', validate('forgotPassword'), checkGuestPhone);
router.post('/guest-login', validate('guestLogin'), guestLogin);
router.post('/verify-guest-login', verifyGuestLogin);
router.post('/checkout-register', validate('checkoutRegister'), checkoutRegister);

router.post('/forgot-password', validate('forgotPassword'), forgotPasswordRequestOtp);
router.post('/reset-password', validate('resetPassword'), resetPasswordVerify);

export default router;
