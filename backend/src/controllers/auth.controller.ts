import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { sendSmsOTP, sendOtpDualChannel } from '../utils/sms';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { phone, email, name } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert user
    const user = await prisma.user.upsert({
      where: { phone },
      update: { otp, otpExpiry, name },
      create: { phone, email, otp, otpExpiry, name, role: 'USER' },
    });

    // Send OTP via dual channel (SMS + Telegram)
    await sendOtpDualChannel(phone, otp, user.id);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to request OTP' });
  }
};

export const verifySignup = async (req: Request, res: Response) => {
  try {
    const { phone, otp, password } = req.body;
    if (!phone || !otp || !password) {
      return res.status(400).json({ error: 'Phone, OTP, and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        otp: null, 
        otpExpiry: null, 
        password: hashedPassword,
        isPhoneVerified: true
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: updatedUser.id, phone: updatedUser.phone, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Signup successful',
      token,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify signup' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    // phone variable can contain either phone or email now
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Mobile number/Email and password are required' });
    }

    const isEmail = phone.includes('@');

    console.log('Login attempt:', { phone, password, isEmail });

    const user = await prisma.user.findFirst({
      where: isEmail ? { email: phone } : { phone }
    });
    
    console.log('Found user:', user);

    if (!user || !user.password) {
      console.log('Failing login - user or password missing');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid mobile number or password' });
    }

    if (!user.isPhoneVerified) {
      return res.status(403).json({ error: 'Please verify your mobile number first' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const checkGuestPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Mobile number is required' });

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    if (user && user.address && user._count.orders > 0) {
      return res.json({ needsAddress: false });
    }

    return res.json({ needsAddress: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check mobile number' });
  }
};

export const forgotPasswordRequestOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Mobile number is required' });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ error: 'User with this mobile number does not exist' });

    if (user.role === 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super Admin cannot reset password via OTP. Please contact support or use database access.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { phone },
      data: { otp, otpExpiry }
    });

    // Send OTP via dual channel (SMS + Telegram)
    await sendOtpDualChannel(phone, otp, user.id);

    res.json({ message: 'OTP sent successfully to your mobile number' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to request OTP for password reset' });
  }
};

export const resetPasswordVerify = async (req: Request, res: Response) => {
  try {
    const { phone, otp, password } = req.body;
    if (!phone || !otp || !password) {
      return res.status(400).json({ error: 'Mobile number, OTP, and new password are required' });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    
    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null
      }
    });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const guestLogin = async (req: Request, res: Response) => {
  try {
    const { phone, email, address } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Mobile number is required' });
    }

    // If no address is provided, we must ensure the user already exists and has an address
    if (!address) {
      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user || !user.address) {
        return res.status(400).json({ error: 'Address is required for new guests' });
      }
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert user with email, update address
    const guestUser = await prisma.user.upsert({
      where: { phone },
      update: { 
        otp, 
        otpExpiry, 
        ...(address && { address }) // only update address if provided
      },
      create: { 
        phone, 
        email, 
        otp, 
        otpExpiry, 
        address: address || '', // theoretically should not hit if !address due to check above, but required by schema if not nullable
        role: 'USER', 
        isPhoneVerified: false 
      }
    });

    // Send OTP via dual channel (SMS + Telegram)
    await sendOtpDualChannel(phone, otp, guestUser.id);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to request guest OTP' });
  }
};

export const verifyGuestLogin = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Update User to verify email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        otp: null, 
        otpExpiry: null, 
        isPhoneVerified: true
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: updatedUser.id, phone: updatedUser.phone, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Guest login successful',
      token,
      user: {
        id: updatedUser.id,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
        address: updatedUser.address,
      },
      isNewUser: !updatedUser.password,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify guest OTP' });
  }
};

export const checkoutRegister = async (req: Request, res: Response) => {
  try {
    const { phone, email, password, addressObj, name, addressId } = req.body;
    if (!phone || (!addressObj && !addressId)) {
      return res.status(400).json({ error: 'Mobile number and address are required' });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please verify OTP first.' });
    }

    if (!user.isPhoneVerified) {
      return res.status(403).json({ error: 'Mobile number not verified.' });
    }

    let hashedPassword = user.password;
    if (password && !user.password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user password if provided
    if (hashedPassword) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
    }

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name }
      });
    }

    let finalAddressId: number;
    if (addressId) {
      const existingAddr = await prisma.address.findFirst({
        where: { id: Number(addressId), userId: user.id }
      });
      if (existingAddr) {
        finalAddressId = existingAddr.id;
        await prisma.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false }
        });
        await prisma.address.update({
          where: { id: finalAddressId },
          data: { isDefault: true }
        });
      } else if (addressObj) {
        await prisma.address.updateMany({
          where: { userId: user.id },
          data: { isDefault: false }
        });
        const newAddress = await prisma.address.create({
          data: {
            userId: user.id,
            street: addressObj.street,
            city: addressObj.city,
            state: addressObj.state,
            country: addressObj.country,
            pincode: addressObj.pincode,
            isDefault: true
          }
        });
        finalAddressId = newAddress.id;
      } else {
        return res.status(400).json({ error: 'Valid address required' });
      }
    } else {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false }
      });
      const newAddress = await prisma.address.create({
        data: {
          userId: user.id,
          street: addressObj.street,
          city: addressObj.city,
          state: addressObj.state,
          country: addressObj.country,
          pincode: addressObj.pincode,
          isDefault: true
        }
      });
      finalAddressId = newAddress.id;
    }

    // Also update the fallback address string on user if addressObj is present
    let updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (addressObj && updatedUser) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { address: JSON.stringify(addressObj) }
      });
    }

    const token = jwt.sign(
      { userId: updatedUser!.id, phone: updatedUser!.phone, role: updatedUser!.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.json({
      message: 'Checkout registration successful',
      token,
      addressId: finalAddressId,
      user: {
        id: updatedUser!.id,
        phone: updatedUser!.phone,
        email: updatedUser!.email,
        role: updatedUser!.role,
        address: updatedUser!.address,
        name: updatedUser!.name
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to complete checkout registration' });
  }
};
