import './PolicyPage.css';
import StaticSEO from '../components/StaticSEO';

const ReturnPolicyPage = () => {
  return (
    <div className="policy-page">
      <StaticSEO pagePath="/return-policy" defaultTitle="Return Policy - DK Exporting" defaultDescription="Information on returns, refunds, and exchanges for DK Exporting purchases." />
      <div className="policy-container">
        <h1 className="policy-title">Return & Refund Policy</h1>
        <div className="policy-content">
          <p>We want you to love what you ordered. If you are not completely satisfied with your purchase, we're here to help.</p>
          
          <h2>Returns</h2>
          <p>You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unopened, unused, and in the same condition that you received it. Your item must be in the original packaging with all factory seals intact.</p>

          <h2>Non-Returnable Items</h2>
          <p>Certain items cannot be returned due to hygiene and food safety reasons:</p>
          <ul>
            <li>Opened or partially used food items</li>
            <li>Customized or personalized items</li>
            <li>Items marked as "Final Sale"</li>
          </ul>

          <h2>Refunds</h2>
          <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.</p>
          <p>If your return is approved, we will initiate a refund to your original method of payment (or store credit for COD orders). You will receive the credit within 5-7 business days, depending on your card issuer's policies.</p>

          <h2>Exchanges</h2>
          <p>We only replace items if they are defective or damaged. If you need to exchange an item, please send us an email at support@dkexporting.com.</p>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
