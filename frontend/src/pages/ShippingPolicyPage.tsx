import './PolicyPage.css';
import StaticSEO from '../components/StaticSEO';

const ShippingPolicyPage = () => {
  return (
    <div className="policy-page">
      <StaticSEO pagePath="/shipping-policy" defaultTitle="Shipping Policy - DK Exporting" defaultDescription="Learn about DK Exporting's shipping policies and delivery timelines." />
      <div className="policy-container">
        <h1 className="policy-title">Shipping Policy</h1>
        <div className="policy-content">
          <p>At DK Exporting, we are committed to delivering your orders accurately, in good condition, and always on time. We partner with reputed national couriers to ensure that your products are handled with care and reach you safely.</p>
          
          <h2>Processing Time</h2>
          <p>All orders are processed within 1-2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.</p>

          <h2>Shipping Rates and Estimates</h2>
          <p>We offer free standard shipping on all prepaid orders across India. For Cash on Delivery (COD) orders, a nominal convenience fee of ₹50 is applied.</p>
          <ul>
            <li><strong>Standard Shipping:</strong> 3-5 business days</li>
            <li><strong>Express Shipping:</strong> 1-2 business days (Available in select pincodes)</li>
          </ul>

          <h2>Order Tracking</h2>
          <p>Once your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 24 hours for the tracking information to become available.</p>

          <h2>Delays and Issues</h2>
          <p>If you haven’t received your order within 7 days of receiving your shipping confirmation email, please contact us at support@dk_exporting.com with your name and order number, and we will look into it for you.</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
