import './PolicyPage.css';
import StaticSEO from '../components/StaticSEO';

const TermsPage = () => {
  return (
    <div className="policy-page">
      <StaticSEO pagePath="/terms" defaultTitle="Terms & Conditions - DK Exporting" defaultDescription="Terms of service and conditions for using the DK Exporting website." />
      <div className="policy-container">
        <h1 className="policy-title">Terms & Conditions</h1>
        <div className="policy-content">
          <p>Welcome to DK Exporting. These terms and conditions outline the rules and regulations for the use of DK Exporting's Website.</p>
          
          <h2>Acceptance of Terms</h2>
          <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use DK Exporting if you do not agree to take all of the terms and conditions stated on this page.</p>

          <h2>License</h2>
          <p>Unless otherwise stated, DK Exporting and/or its licensors own the intellectual property rights for all material on DK Exporting. All intellectual property rights are reserved. You may access this from DK Exporting for your own personal use subjected to restrictions set in these terms and conditions.</p>

          <h2>User Comments & Content</h2>
          <p>Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. DK Exporting does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of DK Exporting, its agents and/or affiliates.</p>
          
          <h2>Product Accuracy</h2>
          <p>We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.</p>

          <h2>Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to update, change or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
