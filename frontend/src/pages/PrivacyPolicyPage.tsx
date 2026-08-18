import './PolicyPage.css';
import StaticSEO from '../components/StaticSEO';

const PrivacyPolicyPage = () => {
  return (
    <div className="policy-page">
      <StaticSEO pagePath="/privacy-policy" defaultTitle="Privacy Policy - DK Exporting" defaultDescription="Read DK Exporting's Privacy Policy to understand how we protect your data." />
      <div className="policy-container">
        <h1 className="policy-title">Privacy Policy</h1>
        <div className="policy-content">
          <p>Your privacy is important to us. It is DK Exporting's policy to respect your privacy regarding any information we may collect from you across our website.</p>
          
          <h2>Information We Collect</h2>
          <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. The information we collect may include:</p>
          <ul>
            <li>Name and contact details (email, mobile number, address)</li>
            <li>Order history and preferences</li>
            <li>Device and browsing information</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the collected information for various purposes:</p>
          <ul>
            <li>To process and fulfill your orders</li>
            <li>To communicate with you regarding your orders and support queries</li>
            <li>To improve our website and customer experience</li>
            <li>To send promotional emails and offers (only if you opt-in)</li>
          </ul>

          <h2>Data Security</h2>
          <p>We take data security seriously. We implement commercially acceptable means to protect your personal information against loss, theft, unauthorized access, disclosure, copying, use, or modification.</p>

          <h2>Contact Us</h2>
          <p>If you have any questions about how we handle user data and personal information, feel free to contact us at privacy@dk_exporting.com.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
