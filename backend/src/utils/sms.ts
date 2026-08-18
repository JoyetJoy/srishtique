import { prisma } from '../prisma';
import axios from 'axios';


export const sendSmsOTP = async (phone: string, otp: string): Promise<boolean> => {
  try {
    const settings = await prisma.adminGeneralSetting.findFirst();

    if (!settings) {
      console.error('Admin general settings not found. Cannot send SMS.');
      return false;
    }

    if (!settings.msg91AuthKey || !settings.msg91Template) {
      console.error('MSG91 credentials not found in settings.');
      return false;
    }

    const authKey = settings.msg91AuthKey;
    const templateId = settings.msg91Template;
    const mobile = phone.startsWith('91') ? phone : `91${phone}`;

    const response = await axios.post(`https://api.msg91.com/api/v5/otp`, null, {
      params: {
        template_id: templateId,
        mobile: mobile,
        authkey: authKey,
        otp: otp
      }
    });

    if (response.data && response.data.type === 'success') {
      return true;
    } else {
      console.error('MSG91 API Error:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    return false;
  }
};

export const sendOtpDualChannel = async (
  phone: string,
  otp: string,
  userId?: number
): Promise<{ sms: boolean }> => {
  const results = { sms: false };

  // Always try SMS via MSG91

  try {
    await sendSmsOTP(phone, otp);
    results.sms = true;
  } catch (err) {
    console.error('SMS OTP failed:', err);
  }

  return results;
};
