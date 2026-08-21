import './PolicyPage.css';
import StaticSEO from '../components/StaticSEO';

const FaqPage = () => {
  return (
    <div className="policy-page">
      <StaticSEO pagePath="/faqs" defaultTitle="FAQs - DK Exporting" defaultDescription="Frequently Asked Questions about orders, shipping, and returns at DK Exporting." />
      <div className="policy-container">
        <h1 className="policy-title">Frequently Asked Questions</h1>
        <div className="policy-content">
          
          <div className="faq-item">
            <h3 className="faq-question">How do I track my order?</h3>
            <div className="faq-answer">
              Once your order has been dispatched, you will receive an email and SMS with a tracking link. You can also track your order by logging into your account and visiting the "Orders" section.
            </div>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">Do you offer international shipping?</h3>
            <div className="faq-answer">
              Currently, we only ship within India. We are working hard to expand our delivery network internationally in the near future.
            </div>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">What is your return policy?</h3>
            <div className="faq-answer">
              We offer a 7-day return policy for our products. To be eligible for a return, the product must be unopened, unused, and in its original packaging with all factory seals intact. Please check our Return Policy page for detailed terms.
            </div>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">How can I contact customer support?</h3>
            <div className="faq-answer">
              You can reach our customer support team via email at support@dkexporting.com or call us at 1800-DK-CARE between 9 AM and 6 PM, Monday to Saturday.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FaqPage;
