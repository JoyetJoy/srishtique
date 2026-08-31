import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './ContactPage.css';
import StaticSEO from '../components/StaticSEO';
import { useSiteSettings } from '../context/SiteSettingsContext';
import Loader from '../components/Loader';

const ContactPage = () => {
  const { brandPhysicalAddress, brandPhone, isLoading } = useSiteSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // For now, just show a success toast.
    toast.success('Thank you for reaching out! We will get back to you soon.');
    (e.target as HTMLFormElement).reset();
  };

  if (isLoading) return <Loader />;

  return (
    <div className="contact-page">
      <StaticSEO pagePath="/contact" defaultTitle="Contact Us - DK Exporting" defaultDescription="Get in touch with DK Exporting customer support for any queries or assistance." />
      <div className="container">
        
        <div className="contact-header">
          <h1>Get in Touch</h1>
          <p>We'd love to hear from you. Please fill out the form or reach out using the details below.</p>
        </div>

        <div className="contact-grid">
          {/* Contact Information */}
          <div className="contact-info">
            <h2>Contact Info</h2>
            
            <div className="info-item">
              <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="info-content">
                <h3>Our Office</h3>
                <p style={{ whiteSpace: 'pre-line' }}>{brandPhysicalAddress || "123 Fashion Street, Silk Board\nBangalore, Karnataka 560068\nIndia"}</p>
              </div>
            </div>

            <div className="info-item">
              <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div className="info-content">
                <h3>Phone</h3>
                <p>{brandPhone || "+91 98765 43210"}<br/>Mon - Sat, 10am to 7pm</p>
              </div>
            </div>

            <div className="info-item">
              <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div className="info-content">
                <h3>Email</h3>
                <p>support@dk_exporting.com<br/>wholesale@dk_exporting.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <h2>Send a Message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" required placeholder="Jane Doe" />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" required placeholder="jane@example.com" />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" required placeholder="How can we help?" />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows={5} required placeholder="Write your message here..."></textarea>
              </div>
              
              <button type="submit" className="submit-btn">SEND MESSAGE</button>
            </form>
          </div>
        </div>

        {/* Quick FAQs */}
        <div className="faq-snippet">
          <h2>Have questions?</h2>
          <p>Check out our frequently asked questions for quick answers.</p>
          <p style={{ color: 'var(--text-mid)' }}>
            <strong>What is your return policy?</strong><br />
            We offer a hassle-free 7-day return policy for unused items with original tags.
          </p>
          <p style={{ color: 'var(--text-mid)', marginTop: '16px' }}>
            <strong>How long does shipping take?</strong><br />
            Standard shipping takes 3-5 business days across India.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
