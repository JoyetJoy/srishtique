import { Link } from 'react-router-dom';
import OrnamentDivider from './OrnamentDivider';
import './AboutUsSection.css';

const AboutUsSection = () => {
  return (
    <section className="about-us-section">
      <div className="container">
        <div className="about-us-content">
          <div className="about-us-text-col">
            <h2 className="about-title">About DK Exporting</h2>
            <OrnamentDivider />
            <p className="about-description">
              At DK Exporting, we bring you the finest quality premium spices, nuts, and authentic Indian flavors directly from nature to your doorstep. 
              Our commitment to quality, purity, and sustainable sourcing ensures that every product you receive meets the highest standards of culinary excellence.
            </p>
            <p className="about-description">
              With decades of expertise in global trade, we have built a legacy of trust with customers worldwide, delivering the essence of tradition in every pack.
            </p>
            <Link to="/about" className="about-btn">
              READ OUR STORY
            </Link>
          </div>
          <div className="about-us-image-col">
            <div className="about-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop" 
                alt="Premium Spices and Nuts" 
                className="about-image"
                loading="lazy"
              />
              <div className="about-badge">
                <span className="badge-number">100%</span>
                <span className="badge-text">Natural &<br/>Premium</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
