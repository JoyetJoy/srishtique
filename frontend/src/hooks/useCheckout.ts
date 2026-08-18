import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiateCheckout = async (options: {
    token: string | null;
    items: Array<{ productVariantId: number; quantity: number }>;
    addressId: number | null;
    couponCode?: string;
    onSuccess?: () => void;
    onError?: (err: string) => void;
  }) => {
    const { token, items, addressId, couponCode, onSuccess, onError } = options;

    if (!token) {
      navigate('/guest-login');
      return;
    }

    if (!addressId) {
      toast.error('Please select a shipping address.');
      if (onError) onError('No address selected');
      return;
    }

    setLoading(true);
    try {
      const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/public/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!profileRes.ok) throw new Error('Failed to retrieve user profile');
      const profileData = await profileRes.json();

      // Load Razorpay SDK
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your connection.');
      }

      // Initiate Order in Backend
      const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/public/orders/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          items,
          couponCode,
          addressId
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to initiate order');
      }

      // Configure Razorpay Checkout
      const rzpOptions = {
        key: orderData.razorpayKeyId,
        amount: Math.round(orderData.amount * 100),
        currency: 'INR',
        name: 'DK Exporting',
        description: 'Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify Payment
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/public/orders/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.order.id
              })
            });
            
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success('Payment successful! Your order has been placed.');
              if (onSuccess) {
                onSuccess();
              } else {
                navigate('/orders');
              }
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
              if (onError) onError(verifyData.error);
            }
          } catch (err) {
            console.error(err);
            toast.error('Payment verification failed');
            if (onError) onError('Verification failed');
          }
        },
        prefill: {
          name: profileData.name || '',
          email: profileData.email || '',
        },
        theme: {
          color: '#800000'
        }
      };

      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed');
        if (onError) onError(response.error.description);
      });
      rzp.open();
      
    } catch (err: any) {
      if (onError) onError(err.message);
      toast.error(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return { initiateCheckout, loading };
};
