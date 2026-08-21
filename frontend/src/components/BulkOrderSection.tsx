import React, { useState } from 'react';
import BulkOrderModal from './BulkOrderModal';
import FadeIn from './FadeIn';
import './BulkOrderSection.css';

interface BulkOrderSectionProps {
  products: any[];
}

const BulkOrderSection: React.FC<BulkOrderSectionProps> = ({ products }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <FadeIn delay={0.1} direction="up">
        <section className="bulk-section">
          <div className="bulk-inner">
            {/* Image Side */}
            <div className="bulk-image" />

            {/* Content Side */}
            <div className="bulk-content">
              <h2 className="bulk-title">Wholesale &amp; Bulk Orders</h2>
              <p className="bulk-desc">
                Looking to source premium quality spices and nuts for your business? We offer competitive pricing, exceptional quality, and reliable global shipping for all bulk orders. Partner with us for your culinary needs.
              </p>
              <button
                className="bulk-btn"
                onClick={() => setIsModalOpen(true)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#382d26'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a3b32'}
              >
                Request Bulk Quote
              </button>
            </div>
          </div>
        </section>
      </FadeIn>

      <BulkOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
      />
    </>
  );
};

export default BulkOrderSection;
