import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Footer.css';
import Logo from './Logo';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { brandName, brandInstagram, brandFacebook, brandWhatsapp } = useSiteSettings();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success(`Thank you for subscribing with ${email}!`);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Logo variant="light" size="md" />
            <p className="footer-desc">
              Premium spices, nuts, and authentic<br />Indian flavors delivered worldwide
            </p>
            <div className="footer-socials">
              <a href={brandFacebook || '#'} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href={brandWhatsapp ? `https://wa.me/${brandWhatsapp.replace(/[^0-9]/g, '')}` : '#'} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </a>
              <a href={brandInstagram.includes('http') ? brandInstagram : `https://instagram.com/${brandInstagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h4 className="footer-heading">QUICK LINKS</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/new-arrivals">New Arrivals</Link></li>
              <li><Link to="/categories">Categories</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-links-col">
            <h4 className="footer-heading">CUSTOMER CARE</h4>
            <ul>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/return-policy">Return Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h4 className="footer-heading">STAY CONECTED</h4>
            <p className="newsletter-desc">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
            </p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">SUBSCRIBE</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p>@{new Date().getFullYear()} DK Exporting. All Rights Reserved.</p>
          <p>Powered by Eayila consulting</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
