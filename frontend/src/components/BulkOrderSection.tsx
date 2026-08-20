import React, { useState } from 'react';
import BulkOrderModal from './BulkOrderModal';
import FadeIn from './FadeIn';

interface BulkOrderSectionProps {
  products: any[];
}

const BulkOrderSection: React.FC<BulkOrderSectionProps> = ({ products }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <FadeIn delay={0.1} direction="up">
        <section style={{ 
          backgroundColor: '#f9f6f0', 
          margin: '60px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '0 auto',
            minHeight: '450px'
          }}>
            {/* Image Side */}
            <div style={{
              flex: '1',
              height: window.innerWidth <= 768 ? '300px' : '100%',
              minHeight: window.innerWidth <= 768 ? '300px' : '450px',
              width: '100%',
              backgroundImage: 'url(/assets/images/bulk_spices_nuts.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
            
            {/* Content Side */}
            <div style={{
              flex: '1',
              padding: window.innerWidth <= 768 ? '40px 20px' : '60px 80px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}>
              <h2 style={{ 
                fontSize: '2.5rem', 
                marginBottom: '20px', 
                color: '#4a3b32',
                fontFamily: 'Playfair Display, serif',
                fontWeight: '600'
              }}>
                Wholesale & Bulk Orders
              </h2>
              <p style={{ 
                fontSize: '1.1rem',
                lineHeight: '1.6',
                marginBottom: '35px', 
                color: '#6b5c53' 
              }}>
                Looking to source premium quality spices and nuts for your business? We offer competitive pricing, exceptional quality, and reliable global shipping for all bulk orders. Partner with us for your culinary needs.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                style={{ 
                  padding: '14px 32px',
                  backgroundColor: '#4a3b32',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
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
