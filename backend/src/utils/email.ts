import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"DK Exporting" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Login OTP for DK Exporting',
    text: `Your OTP for login is: ${otp}. It is valid for 10 minutes.`,
    html: `<h3>Your OTP for login is: <strong>${otp}</strong></h3><p>It is valid for 10 minutes.</p>`,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendOrderConfirmation = async (
  email: string,
  orderId: number,
  items: { name: string; quantity: number; price: number }[],
  totalAmount: number
) => {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
      </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #80011f;">Order Confirmation - DK Exporting</h2>
      <p>Thank you for your order!</p>
      <p><strong>Order ID:</strong> #${orderId}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #80011f; color: white;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; font-weight: bold; text-align: right;">Total:</td>
            <td style="padding: 10px; font-weight: bold; text-align: right;">₹${totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      <p>We'll send you shipping updates once your order is on its way.</p>
      <p style="color: #666; font-size: 12px;">If you have any questions, please contact us at ${process.env.SMTP_USER}</p>
    </div>
  `;

  const mailOptions = {
    from: `"DK Exporting" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order Confirmation #${orderId} - DK Exporting`,
    text: `Your order #${orderId} has been confirmed. Total: ₹${totalAmount.toFixed(2)}`,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendOrderStatusUpdate = async (
  email: string,
  orderId: number,
  status: string,
  trackingNumber?: string
) => {
  const statusMessages: Record<string, string> = {
    PROCESSING: 'Your order is being processed.',
    SHIPPED: `Your order has been shipped.${trackingNumber ? ` Tracking number: ${trackingNumber}` : ''}`,
    DELIVERED: 'Your order has been delivered.',
    CANCELLED: 'Your order has been cancelled.',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #80011f;">Order Update - DK Exporting</h2>
      <p>Hello,</p>
      <p>${statusMessages[status] || `Your order status has been updated to ${status}.`}</p>
      <p><strong>Order ID:</strong> #${orderId}</p>
      <p><strong>Status:</strong> ${status}</p>
      ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
      <p style="color: #666; font-size: 12px;">Thank you for shopping with DK Exporting!</p>
    </div>
  `;

  const mailOptions = {
    from: `"DK Exporting" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Order #${orderId} Status Update - ${status}`,
    text: `Your order #${orderId} status has been updated to ${status}.`,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendRestockNotification = async (
  email: string,
  productName: string,
  url: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #80011f;">Good News! - DK Exporting</h2>
      <p>Hello,</p>
      <p>The item you requested, <strong>${productName}</strong>, is now back in stock!</p>
      <p>Click the link below to view it and place your order before it runs out again:</p>
      <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #80011f; color: white; text-decoration: none; border-radius: 5px;">Shop Now</a></p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">Thank you for shopping with DK Exporting!</p>
    </div>
  `;

  const mailOptions = {
    from: `"DK Exporting" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `${productName} is Back in Stock!`,
    text: `The item you requested, ${productName}, is now back in stock! View it here: ${url}`,
    html,
  };

  return await transporter.sendMail(mailOptions);
};
